-- Harden SECURITY DEFINER grants / search_path
-- Applied remotely via Supabase MCP as version 20260806060910.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;

REVOKE ALL ON FUNCTION public.is_campaign_owner(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_campaign_owner(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_campaign_owner(uuid) TO authenticated;
