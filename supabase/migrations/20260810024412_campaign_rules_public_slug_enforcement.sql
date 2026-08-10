-- Campaign rules, duplicate race/class flags, public slug.
-- Seat/catalog enforcement in submit RPC. Public payloads omit email.
-- Additive only (ADD COLUMN / CREATE OR REPLACE FUNCTION).

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS rules text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS allow_duplicate_races boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_duplicate_classes boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS public_slug text;

-- Backfill unique public_slug for existing campaigns (a-z0-9 length 6 subset via hex).
DO $$
DECLARE
  r record;
  s text;
  attempts int;
BEGIN
  FOR r IN SELECT id FROM public.campaigns WHERE public_slug IS NULL LOOP
    attempts := 0;
    LOOP
      attempts := attempts + 1;
      s := substr(encode(gen_random_bytes(8), 'hex'), 1, 6);
      BEGIN
        UPDATE public.campaigns SET public_slug = s WHERE id = r.id;
        EXIT;
      EXCEPTION WHEN unique_violation THEN
        IF attempts > 20 THEN
          RAISE EXCEPTION 'could not allocate public_slug for campaign %', r.id;
        END IF;
      END;
    END LOOP;
  END LOOP;
END $$;

ALTER TABLE public.campaigns
  ALTER COLUMN public_slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS campaigns_public_slug_key
  ON public.campaigns (public_slug);

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
  v_seats_taken int;
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

  SELECT count(*)::int INTO v_seats_taken
  FROM public.characters
  WHERE campaign_id = v_campaign.id;

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
        'rules', v_campaign.rules,
        'max_players', v_campaign.max_players,
        'max_level', v_campaign.max_level,
        'status', v_campaign.status,
        'public_slug', v_campaign.public_slug,
        'allow_duplicate_races', v_campaign.allow_duplicate_races,
        'allow_duplicate_classes', v_campaign.allow_duplicate_classes,
        'seats_taken', v_seats_taken
      ),
      -- Public payload: never include email
      'character', jsonb_build_object(
        'id', v_character.id,
        'character_name', v_character.character_name,
        'image', v_character.image,
        'race', v_character.race,
        'class', v_character.class,
        'race_id', v_character.race_id,
        'class_id', v_character.class_id,
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
      'rules', v_campaign.rules,
      'max_players', v_campaign.max_players,
      'max_level', v_campaign.max_level,
      'status', v_campaign.status,
      'public_slug', v_campaign.public_slug,
      'allow_duplicate_races', v_campaign.allow_duplicate_races,
      'allow_duplicate_classes', v_campaign.allow_duplicate_classes,
      'seats_taken', v_seats_taken
    ),
    'character', NULL,
    'races', v_races,
    'classes', v_classes
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.fetch_campaign_page(p_slug text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_campaign public.campaigns%ROWTYPE;
  v_party jsonb;
  v_seats_taken int;
BEGIN
  IF p_slug IS NULL OR length(trim(p_slug)) = 0 THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_campaign FROM public.campaigns WHERE public_slug = p_slug;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT count(*)::int INTO v_seats_taken
  FROM public.characters
  WHERE campaign_id = v_campaign.id;

  SELECT coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', ch.id,
        'character_name', ch.character_name,
        'image', ch.image,
        'race', ch.race,
        'class', ch.class,
        'contribution', ch.contribution
      )
      ORDER BY ch.created_at
    ),
    '[]'::jsonb
  )
  INTO v_party
  FROM public.characters ch
  WHERE ch.campaign_id = v_campaign.id;

  RETURN jsonb_build_object(
    'campaign', jsonb_build_object(
      'id', v_campaign.id,
      'name', v_campaign.name,
      'description', v_campaign.description,
      'rules', v_campaign.rules,
      'max_players', v_campaign.max_players,
      'max_level', v_campaign.max_level,
      'status', v_campaign.status,
      'public_slug', v_campaign.public_slug,
      'seats_taken', v_seats_taken
    ),
    'party', v_party
  );
END;
$$;

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
  v_seats_taken int;
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

  SELECT * INTO v_campaign FROM public.campaigns WHERE id = v_invite.campaign_id FOR UPDATE;

  SELECT count(*)::int INTO v_seats_taken
  FROM public.characters
  WHERE campaign_id = v_campaign.id;

  IF v_seats_taken >= v_campaign.max_players THEN
    RAISE EXCEPTION 'campaign_full' USING ERRCODE = 'P0001';
  END IF;

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

  IF NOT v_campaign.allow_duplicate_races THEN
    IF EXISTS (
      SELECT 1 FROM public.characters
      WHERE campaign_id = v_campaign.id AND race_id = v_race.id
    ) THEN
      RAISE EXCEPTION 'duplicate_race' USING ERRCODE = 'P0001';
    END IF;
  END IF;

  IF NOT v_campaign.allow_duplicate_classes THEN
    IF EXISTS (
      SELECT 1 FROM public.characters
      WHERE campaign_id = v_campaign.id AND class_id = v_class.id
    ) THEN
      RAISE EXCEPTION 'duplicate_class' USING ERRCODE = 'P0001';
    END IF;
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

REVOKE ALL ON FUNCTION public.fetch_campaign_page(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fetch_campaign_page(text) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.submit_invite_character(text, text, text, uuid, uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_invite_character(text, text, text, uuid, uuid, text, text) TO anon, authenticated;
