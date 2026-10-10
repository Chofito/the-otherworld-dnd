-- Site-wide settings: a single row holding the visual theme every visitor sees.
-- The DM switches it from /dashboard/theme (user client, RLS below).
-- Public pages read it on the server with the service client.

CREATE TABLE public.site_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  theme text NOT NULL DEFAULT 'arcane'
    CHECK (theme ~ '^[a-z][a-z0-9-]{0,31}$'),
  updated_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.site_settings (id) VALUES (true)
ON CONFLICT (id) DO NOTHING;

CREATE TRIGGER site_settings_set_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Signup is closed: every authenticated user is a DM.
CREATE POLICY site_settings_select_authenticated ON public.site_settings
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY site_settings_update_authenticated ON public.site_settings
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (updated_by = auth.uid());

-- Default privileges no longer auto-grant to anon/authenticated.
GRANT SELECT ON public.site_settings TO authenticated;
GRANT UPDATE (theme, updated_by) ON public.site_settings TO authenticated;
