-- Body Challenge: схема для группового челленджа с рейтингом недели
-- Выполните в Supabase → SQL Editor → New query → Run

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 30),
  created_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('pushups', 'squats', 'steps', 'workout', 'run', 'plank')),
  amount numeric not null check (amount > 0),
  points numeric not null check (points > 0),
  activity_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists activities_user_date_idx on public.activities (user_id, activity_date);
create index if not exists activities_date_idx on public.activities (activity_date);

alter table public.profiles enable row level security;
alter table public.activities enable row level security;

-- Профили: все видят имена (для рейтинга), редактировать может только владелец
drop policy if exists "Profiles are readable by authenticated users" on public.profiles;
create policy "Profiles are readable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Активности: добавлять только свои, читать все (для рейтинга)
drop policy if exists "Activities readable by authenticated users" on public.activities;
create policy "Activities readable by authenticated users"
  on public.activities for select
  to authenticated
  using (true);

drop policy if exists "Users insert own activities" on public.activities;
create policy "Users insert own activities"
  on public.activities for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own activities" on public.activities;
create policy "Users delete own activities"
  on public.activities for delete
  to authenticated
  using (auth.uid() = user_id);

-- Рейтинг недели: сумма очков по каждому участнику
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

-- Автосоздание профиля при регистрации (если имя передано в metadata)
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
  on conflict (id) do update
    set display_name = excluded.display_name;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
