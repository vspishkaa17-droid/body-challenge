-- Исправления: удаление, обновление шагов, нулевые баллы за шаги
-- Supabase → SQL Editor → Run

alter table public.challenge_activities
  drop constraint if exists challenge_activities_points_check;

alter table public.challenge_activities
  add constraint challenge_activities_points_check
  check (points >= 0);

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
