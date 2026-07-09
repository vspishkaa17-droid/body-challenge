-- Запустите этот файл, если schema.sql упал с ошибкой "policy already exists"
-- Можно запускать повторно — безопасно

-- Рейтинг недели
create or replace function public.weekly_leaderboard(week_start date, week_end date)
returns table (
  user_id uuid,
  display_name text,
  weekly_points numeric,
  activity_count bigint
)
language sql
stable
security invoker
as $$
  select
    p.id as user_id,
    p.display_name,
    coalesce(sum(a.points), 0) as weekly_points,
    count(a.id) as activity_count
  from public.profiles p
  left join public.activities a
    on a.user_id = p.id
    and a.activity_date between week_start and week_end
  group by p.id, p.display_name
  having coalesce(sum(a.points), 0) > 0
  order by weekly_points desc, p.display_name asc;
$$;

grant execute on function public.weekly_leaderboard(date, date) to authenticated;

-- Автосоздание профиля при регистрации
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
