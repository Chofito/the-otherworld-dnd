-- Biography on characters + filter taken race/class in invite catalog + submit biography.

ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS biography text NOT NULL DEFAULT '';

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
  WHERE r.dm_id = v_campaign.dm_id
    AND r.is_active
    AND (
      v_campaign.allow_duplicate_races
      OR NOT EXISTS (
        SELECT 1 FROM public.characters ch
        WHERE ch.campaign_id = v_campaign.id AND ch.race_id = r.id
      )
    );

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
  WHERE c.dm_id = v_campaign.dm_id
    AND c.is_active
    AND (
      v_campaign.allow_duplicate_classes
      OR NOT EXISTS (
        SELECT 1 FROM public.characters ch
        WHERE ch.campaign_id = v_campaign.id AND ch.class_id = c.id
      )
    );

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
      'character', jsonb_build_object(
        'id', v_character.id,
        'character_name', v_character.character_name,
        'image', v_character.image,
        'race', v_character.race,
        'class', v_character.class,
        'race_id', v_character.race_id,
        'class_id', v_character.class_id,
        'contribution', v_character.contribution,
        'biography', v_character.biography
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
  v_dm public.profiles%ROWTYPE;
  v_party jsonb;
  v_dm_member jsonb;
  v_seats_taken int;
BEGIN
  IF p_slug IS NULL OR length(trim(p_slug)) = 0 THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_campaign FROM public.campaigns WHERE public_slug = p_slug;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_dm FROM public.profiles WHERE id = v_campaign.dm_id;

  SELECT count(*)::int INTO v_seats_taken
  FROM public.characters
  WHERE campaign_id = v_campaign.id;

  v_dm_member := jsonb_build_object(
    'id', v_dm.id,
    'character_name', CASE
      WHEN length(trim(v_dm.fictional_name)) > 0 THEN trim(v_dm.fictional_name)
      ELSE v_dm.display_name
    END,
    'image', v_dm.image,
    'race', '',
    'class', 'Dungeon Master',
    'role', 'dm',
    'bio', v_dm.bio
  );

  SELECT coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', ch.id,
        'character_name', ch.character_name,
        'image', ch.image,
        'race', ch.race,
        'class', ch.class,
        'role', 'player',
        'biography', ch.biography
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
    'party', jsonb_build_array(v_dm_member) || v_party
  );
END;
$$;

DROP FUNCTION IF EXISTS public.submit_invite_character(text, text, text, uuid, uuid, text, text);

CREATE FUNCTION public.submit_invite_character(
  p_slug text,
  p_character_name text,
  p_image text,
  p_race_id uuid,
  p_class_id uuid,
  p_email text,
  p_contribution text,
  p_biography text
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
     OR p_contribution IS NULL OR length(trim(p_contribution)) = 0
     OR p_biography IS NULL OR length(trim(p_biography)) = 0 THEN
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
    contribution,
    biography
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
    trim(p_contribution),
    trim(p_biography)
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
REVOKE ALL ON FUNCTION public.fetch_invite_page(text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fetch_invite_page(text) TO service_role;

REVOKE ALL ON FUNCTION public.fetch_campaign_page(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fetch_campaign_page(text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fetch_campaign_page(text) TO service_role;

REVOKE ALL ON FUNCTION public.submit_invite_character(text, text, text, uuid, uuid, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_invite_character(text, text, text, uuid, uuid, text, text, text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_invite_character(text, text, text, uuid, uuid, text, text, text) TO service_role;
