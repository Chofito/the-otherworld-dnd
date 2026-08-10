-- Lock down public invite/campaign RPCs: service_role only.
-- Defense in depth: revoke anon privileges on domain tables.
-- Additive / non-destructive to data.

REVOKE ALL ON FUNCTION public.fetch_invite_page(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fetch_invite_page(text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fetch_invite_page(text) TO service_role;

REVOKE ALL ON FUNCTION public.fetch_campaign_page(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fetch_campaign_page(text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fetch_campaign_page(text) TO service_role;

REVOKE ALL ON FUNCTION public.submit_invite_character(text, text, text, uuid, uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_invite_character(text, text, text, uuid, uuid, text, text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_invite_character(text, text, text, uuid, uuid, text, text) TO service_role;

-- Keep helper for RLS policies only (authenticated), never anon.
REVOKE ALL ON FUNCTION public.is_campaign_owner(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_campaign_owner(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_campaign_owner(uuid) TO authenticated, service_role;

REVOKE ALL ON TABLE public.profiles FROM anon;
REVOKE ALL ON TABLE public.campaigns FROM anon;
REVOKE ALL ON TABLE public.invites FROM anon;
REVOKE ALL ON TABLE public.characters FROM anon;
REVOKE ALL ON TABLE public.races FROM anon;
REVOKE ALL ON TABLE public.classes FROM anon;
