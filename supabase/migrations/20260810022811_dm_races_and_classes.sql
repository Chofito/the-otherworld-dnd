-- DM-scoped races & classes catalog + additive character FKs.
-- Non-destructive: CREATE TABLE / ADD COLUMN only; keeps characters.race/class text.
-- Remote version: 20260810022811

CREATE TABLE public.races (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dm_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT races_dm_id_name_unique UNIQUE (dm_id, name)
);

CREATE INDEX races_dm_id_idx ON public.races (dm_id);

CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dm_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT classes_dm_id_name_unique UNIQUE (dm_id, name)
);

CREATE INDEX classes_dm_id_idx ON public.classes (dm_id);

CREATE TRIGGER races_set_updated_at
  BEFORE UPDATE ON public.races
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER classes_set_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.characters
  ADD COLUMN race_id uuid REFERENCES public.races (id) ON DELETE SET NULL,
  ADD COLUMN class_id uuid REFERENCES public.classes (id) ON DELETE SET NULL;

CREATE INDEX characters_race_id_idx ON public.characters (race_id);
CREATE INDEX characters_class_id_idx ON public.characters (class_id);

ALTER TABLE public.races ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY races_select_own ON public.races
  FOR SELECT TO authenticated
  USING (dm_id = auth.uid());

CREATE POLICY races_insert_own ON public.races
  FOR INSERT TO authenticated
  WITH CHECK (dm_id = auth.uid());

CREATE POLICY races_update_own ON public.races
  FOR UPDATE TO authenticated
  USING (dm_id = auth.uid())
  WITH CHECK (dm_id = auth.uid());

CREATE POLICY races_delete_own ON public.races
  FOR DELETE TO authenticated
  USING (dm_id = auth.uid());

CREATE POLICY classes_select_own ON public.classes
  FOR SELECT TO authenticated
  USING (dm_id = auth.uid());

CREATE POLICY classes_insert_own ON public.classes
  FOR INSERT TO authenticated
  WITH CHECK (dm_id = auth.uid());

CREATE POLICY classes_update_own ON public.classes
  FOR UPDATE TO authenticated
  USING (dm_id = auth.uid())
  WITH CHECK (dm_id = auth.uid());

CREATE POLICY classes_delete_own ON public.classes
  FOR DELETE TO authenticated
  USING (dm_id = auth.uid());

CREATE OR REPLACE FUNCTION public.fetch_invite_page(p_slug text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite public.invites%ROWTYPE;
  v_campaign public.campaigns%ROWTYPE;
  v_character public.characters%ROWTYPE;
  v_races jsonb;
  v_classes jsonb;
BEGIN
  IF p_slug IS NULL OR length(trim(p_slug)) = 0 THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_invite FROM public.invites WHERE slug = p_slug;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  IF v_invite.status = 'revoked' THEN
    RETURN NULL;
  END IF;

  IF v_invite.status = 'pending' AND v_invite.expires_at <= now() THEN
    UPDATE public.invites
    SET status = 'expired', updated_at = now()
    WHERE id = v_invite.id AND status = 'pending';
    RETURN NULL;
  END IF;

  IF v_invite.status = 'expired' THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_campaign FROM public.campaigns WHERE id = v_invite.campaign_id;

  SELECT coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', r.id,
        'name', r.name,
        'description', r.description
      )
      ORDER BY r.sort_order, r.name
    ),
    '[]'::jsonb
  )
  INTO v_races
  FROM public.races r
  WHERE r.dm_id = v_campaign.dm_id AND r.is_active;

  SELECT coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', c.id,
        'name', c.name,
        'description', c.description
      )
      ORDER BY c.sort_order, c.name
    ),
    '[]'::jsonb
  )
  INTO v_classes
  FROM public.classes c
  WHERE c.dm_id = v_campaign.dm_id AND c.is_active;

  IF v_invite.status = 'completed' THEN
    SELECT * INTO v_character FROM public.characters WHERE invite_id = v_invite.id;
    RETURN jsonb_build_object(
      'invite', jsonb_build_object(
        'id', v_invite.id,
        'slug', v_invite.slug,
        'status', v_invite.status,
        'expires_at', v_invite.expires_at,
        'completed_at', v_invite.completed_at
      ),
      'campaign', jsonb_build_object(
        'id', v_campaign.id,
        'name', v_campaign.name,
        'description', v_campaign.description,
        'max_players', v_campaign.max_players,
        'max_level', v_campaign.max_level,
        'status', v_campaign.status
      ),
      'character', jsonb_build_object(
        'id', v_character.id,
        'character_name', v_character.character_name,
        'image', v_character.image,
        'race', v_character.race,
        'class', v_character.class,
        'race_id', v_character.race_id,
        'class_id', v_character.class_id,
        'email', v_character.email,
        'contribution', v_character.contribution
      ),
      'races', v_races,
      'classes', v_classes
    );
  END IF;

  RETURN jsonb_build_object(
    'invite', jsonb_build_object(
      'id', v_invite.id,
      'slug', v_invite.slug,
      'status', v_invite.status,
      'expires_at', v_invite.expires_at
    ),
    'campaign', jsonb_build_object(
      'id', v_campaign.id,
      'name', v_campaign.name,
      'description', v_campaign.description,
      'max_players', v_campaign.max_players,
      'max_level', v_campaign.max_level,
      'status', v_campaign.status
    ),
    'character', NULL,
    'races', v_races,
    'classes', v_classes
  );
END;
$$;

DROP FUNCTION IF EXISTS public.submit_invite_character(text, text, text, text, text, text, text);

CREATE OR REPLACE FUNCTION public.submit_invite_character(
  p_slug text,
  p_character_name text,
  p_image text,
  p_race_id uuid,
  p_class_id uuid,
  p_email text,
  p_contribution text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite public.invites%ROWTYPE;
  v_campaign public.campaigns%ROWTYPE;
  v_race public.races%ROWTYPE;
  v_class public.classes%ROWTYPE;
  v_character public.characters%ROWTYPE;
BEGIN
  SELECT * INTO v_invite FROM public.invites WHERE slug = p_slug FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'not_found' USING ERRCODE = 'P0002';
  END IF;

  IF v_invite.status = 'revoked' OR v_invite.status = 'expired' THEN
    RAISE EXCEPTION 'not_found' USING ERRCODE = 'P0002';
  END IF;

  IF v_invite.status = 'pending' AND v_invite.expires_at <= now() THEN
    UPDATE public.invites SET status = 'expired', updated_at = now() WHERE id = v_invite.id;
    RAISE EXCEPTION 'not_found' USING ERRCODE = 'P0002';
  END IF;

  IF v_invite.status <> 'pending' THEN
    RAISE EXCEPTION 'already_completed' USING ERRCODE = 'P0001';
  END IF;

  IF p_character_name IS NULL OR length(trim(p_character_name)) = 0
     OR p_image IS NULL OR length(trim(p_image)) = 0
     OR p_race_id IS NULL
     OR p_class_id IS NULL
     OR p_email IS NULL OR length(trim(p_email)) = 0
     OR p_contribution IS NULL OR length(trim(p_contribution)) = 0 THEN
    RAISE EXCEPTION 'invalid_input' USING ERRCODE = 'P0001';
  END IF;

  SELECT * INTO v_campaign FROM public.campaigns WHERE id = v_invite.campaign_id;

  SELECT * INTO v_race
  FROM public.races
  WHERE id = p_race_id AND dm_id = v_campaign.dm_id AND is_active;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invalid_race' USING ERRCODE = 'P0001';
  END IF;

  SELECT * INTO v_class
  FROM public.classes
  WHERE id = p_class_id AND dm_id = v_campaign.dm_id AND is_active;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invalid_class' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.characters (
    invite_id,
    campaign_id,
    character_name,
    image,
    race,
    class,
    race_id,
    class_id,
    email,
    contribution
  ) VALUES (
    v_invite.id,
    v_invite.campaign_id,
    trim(p_character_name),
    trim(p_image),
    v_race.name,
    v_class.name,
    v_race.id,
    v_class.id,
    lower(trim(p_email)),
    trim(p_contribution)
  )
  RETURNING * INTO v_character;

  UPDATE public.invites
  SET status = 'completed', completed_at = now(), updated_at = now()
  WHERE id = v_invite.id;

  RETURN jsonb_build_object(
    'ok', true,
    'character_id', v_character.id
  );
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'email_taken' USING ERRCODE = 'P0001';
END;
$$;

REVOKE ALL ON FUNCTION public.fetch_invite_page(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fetch_invite_page(text) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.submit_invite_character(text, text, text, uuid, uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_invite_character(text, text, text, uuid, uuid, text, text) TO anon, authenticated;
