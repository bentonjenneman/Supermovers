-- Run once in this project's Supabase SQL editor.
-- Adds the independent Google badge toggle; preserves existing data.
ALTER TABLE public.google_profile_stats
  ADD COLUMN IF NOT EXISTS google_badge_enabled boolean NOT NULL DEFAULT false;

-- Remove the retired claim-support requirement enforced by the database.
ALTER TABLE public.google_profile_stats
  DROP CONSTRAINT IF EXISTS badge_requires_basis;

NOTIFY pgrst, 'reload schema';
