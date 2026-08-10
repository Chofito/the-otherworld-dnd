-- Public invite RPCs (SECURITY DEFINER, intentional anon execute for /i/[slug])
-- Applied remotely via Supabase MCP as version 20260806060728.

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
        'email', v_character.email,
        'contribution', v_character.contribution
      )
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
    'character', NULL
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_invite_character(
  p_slug text,
  p_character_name text,
  p_image text,
  p_race text,
  p_class text,
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
     OR p_race IS NULL OR length(trim(p_race)) = 0
     OR p_class IS NULL OR length(trim(p_class)) = 0
     OR p_email IS NULL OR length(trim(p_email)) = 0
     OR p_contribution IS NULL OR length(trim(p_contribution)) = 0 THEN
    RAISE EXCEPTION 'invalid_input' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.characters (
    invite_id, campaign_id, character_name, image, race, class, email, contribution
  ) VALUES (
    v_invite.id,
    v_invite.campaign_id,
    trim(p_character_name),
    trim(p_image),
    trim(p_race),
    trim(p_class),
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

REVOKE ALL ON FUNCTION public.submit_invite_character(text, text, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_invite_character(text, text, text, text, text, text, text) TO anon, authenticated;
