-- Body Challenge БЕЗ регистрации
-- Supabase → SQL Editor → New query → Run

create table if not exists public.challenge_activities (
  id uuid primary key default gen_random_uuid(),
  participant_name text not null check (char_length(participant_name) between 2 and 30),
  type text not null check (type in ('workout', 'training', 'pushups', 'stretching', 'steps')),
  amount numeric not null check (amount > 0),
  points numeric not null check (points >= 0),
  activity_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists challenge_activities_participant_date_idx
  on public.challenge_activities (participant_name, activity_date);

create index if not exists challenge_activities_date_idx
  on public.challenge_activities (activity_date);

alter table public.challenge_activities enable row level security;

drop policy if exists "Anyone can read challenge activities" on public.challenge_activities;
create policy "Anyone can read challenge activities"
  on public.challenge_activities for select
  to anon, authenticated
  using (true);

drop policy if exists "Anyone can insert challenge activities" on public.challenge_activities;
create policy "Anyone can insert challenge activities"
  on public.challenge_activities for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Anyone can delete challenge activities" on public.challenge_activities;
create policy "Anyone can delete challenge activities"
  on public.challenge_activities for delete
  to anon, authenticated
  using (true);

drop policy if exists "Anyone can update challenge activities" on public.challenge_activities;
create policy "Anyone can update challenge activities"
  on public.challenge_activities for update
  to anon, authenticated
  using (true)
  with check (true);

create or replace function public.weekly_leaderboard_simple(week_start date, week_end date)
returns table (
  participant_name text,
  weekly_points numeric,
  activity_count bigint
)
language sql
stable
security invoker
as $$
  select
    a.participant_name,
    sum(a.points) as weekly_points,
    count(a.id) as activity_count
  from public.challenge_activities a
  where a.activity_date between week_start and week_end
  group by a.participant_name
  order by weekly_points desc, participant_name asc;
$$;

grant execute on function public.weekly_leaderboard_simple(date, date) to anon, authenticated;
