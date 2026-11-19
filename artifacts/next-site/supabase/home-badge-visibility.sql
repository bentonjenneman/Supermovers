-- Run manually in Supabase SQL Editor. This file is not applied by the app.
alter table public.google_profile_stats
  add column if not exists show_satisfaction_badge_home boolean not null default false,
  add column if not exists show_google_badge_home boolean not null default false;
