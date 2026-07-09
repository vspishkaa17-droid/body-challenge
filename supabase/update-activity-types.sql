-- Обновление типов активностей
-- Supabase → SQL Editor → Run

alter table public.challenge_activities
  drop constraint if exists challenge_activities_type_check;

alter table public.challenge_activities
  add constraint challenge_activities_type_check
  check (type in ('workout', 'training', 'pushups', 'stretching', 'steps'));
