-- Additive: DM profile bio + fictional_name; public party omits contribution; include DM in roster.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS fictional_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS bio text NOT NULL DEFAULT '';

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
        'role', 'player'
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

REVOKE ALL ON FUNCTION public.fetch_campaign_page(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fetch_campaign_page(text) TO anon, authenticated;
