-- Domain schema: profiles, campaigns, invites, characters + RLS
-- Applied remotely via Supabase MCP as version 20260806060526.

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name text NOT NULL,
  image text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dm_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  max_players integer NOT NULL DEFAULT 4 CHECK (max_players > 0),
  max_level integer NOT NULL DEFAULT 4 CHECK (max_level > 0),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'ongoing', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX campaigns_dm_id_idx ON public.campaigns (dm_id);

CREATE TABLE public.invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns (id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'revoked')),
  expires_at timestamptz NOT NULL,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX invites_campaign_id_idx ON public.invites (campaign_id);

CREATE TABLE public.characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_id uuid NOT NULL UNIQUE REFERENCES public.invites (id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES public.campaigns (id) ON DELETE CASCADE,
  character_name text NOT NULL,
  image text NOT NULL,
  race text NOT NULL,
  class text NOT NULL,
  email text NOT NULL,
  contribution text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT characters_campaign_email_unique UNIQUE (campaign_id, email)
);

CREATE INDEX characters_campaign_id_idx ON public.characters (campaign_id);
CREATE INDEX characters_email_idx ON public.characters (email);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER campaigns_set_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER invites_set_updated_at
  BEFORE UPDATE ON public.invites
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER characters_set_updated_at
  BEFORE UPDATE ON public.characters
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, image)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1), 'Dungeon Master'),
    COALESCE(NEW.raw_user_meta_data ->> 'image', 'example')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.is_campaign_owner(p_campaign_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = p_campaign_id AND c.dm_id = auth.uid()
  );
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY campaigns_select_own ON public.campaigns
  FOR SELECT TO authenticated
  USING (dm_id = auth.uid());

CREATE POLICY campaigns_insert_own ON public.campaigns
  FOR INSERT TO authenticated
  WITH CHECK (dm_id = auth.uid());

CREATE POLICY campaigns_update_own ON public.campaigns
  FOR UPDATE TO authenticated
  USING (dm_id = auth.uid())
  WITH CHECK (dm_id = auth.uid());

CREATE POLICY campaigns_delete_own ON public.campaigns
  FOR DELETE TO authenticated
  USING (dm_id = auth.uid());

CREATE POLICY invites_select_own ON public.invites
  FOR SELECT TO authenticated
  USING (public.is_campaign_owner(campaign_id));

CREATE POLICY invites_insert_own ON public.invites
  FOR INSERT TO authenticated
  WITH CHECK (public.is_campaign_owner(campaign_id));

CREATE POLICY invites_update_own ON public.invites
  FOR UPDATE TO authenticated
  USING (public.is_campaign_owner(campaign_id))
  WITH CHECK (public.is_campaign_owner(campaign_id));

CREATE POLICY invites_delete_own ON public.invites
  FOR DELETE TO authenticated
  USING (public.is_campaign_owner(campaign_id));

CREATE POLICY characters_select_own ON public.characters
  FOR SELECT TO authenticated
  USING (public.is_campaign_owner(campaign_id));

CREATE POLICY characters_insert_own ON public.characters
  FOR INSERT TO authenticated
  WITH CHECK (public.is_campaign_owner(campaign_id));

CREATE POLICY characters_update_own ON public.characters
  FOR UPDATE TO authenticated
  USING (public.is_campaign_owner(campaign_id))
  WITH CHECK (public.is_campaign_owner(campaign_id));

CREATE POLICY characters_delete_own ON public.characters
  FOR DELETE TO authenticated
  USING (public.is_campaign_owner(campaign_id));

REVOKE ALL ON FUNCTION public.is_campaign_owner(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_campaign_owner(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
