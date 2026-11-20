-- Run once in Supabase SQL Editor. Existing badges and links are preserved.
alter table public.google_profile_stats
  add column if not exists show_leave_review_badge_home boolean not null default false,
  add column if not exists show_leave_review_badge_reviews boolean not null default false;
