-- Run once in the existing Supabase project's SQL Editor.
CREATE TABLE IF NOT EXISTS public.site_banner (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  title text NOT NULL DEFAULT '' CHECK (char_length(title) <= 160),
  subtitle text NOT NULL DEFAULT '' CHECK (char_length(subtitle) <= 300),
  link text NOT NULL DEFAULT '' CHECK (char_length(link) <= 2048)
);

ALTER TABLE public.site_banner ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.site_banner FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.site_banner TO service_role;

INSERT INTO public.site_banner (id) VALUES (true)
ON CONFLICT (id) DO NOTHING;

NOTIFY pgrst, 'reload schema';
