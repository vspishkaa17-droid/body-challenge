-- Разрешить удаление активностей
-- Supabase → SQL Editor → Run

drop policy if exists "Anyone can delete challenge activities" on public.challenge_activities;
create policy "Anyone can delete challenge activities"
  on public.challenge_activities for delete
  to anon, authenticated
  using (true);
