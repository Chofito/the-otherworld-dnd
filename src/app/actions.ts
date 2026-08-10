'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { createCampaignPublicSlug, createInviteSlug } from '@/lib/slug';
import { createClient, createLoginClient } from '@/lib/supabase/server';
import { getClientIp } from '@/lib/request-ip';
import { createServiceClient } from '@/lib/supabase/service';
import {
  campaignFormSchema,
  catalogItemFormSchema,
  characterFormSchema,
  inviteTtlSchema,
  loginSchema,
  profileFormSchema,
} from '@/lib/validations';

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export type ActionState = {
  error?: string;
  success?: string;
};

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { error: 'Invalid email or password.' };
  }

  const clientIp = await getClientIp();
  const supabase = await createLoginClient(clientIp);
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: 'Invalid email or password.' };
  }

  redirect('/dashboard');
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/summon-dm');
}

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, userId } = await requireUser();
  const parsed = profileFormSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { error: 'Check display name, fictional name, bio, and avatar.' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: parsed.data.display_name,
      fictional_name: parsed.data.fictional_name,
      bio: parsed.data.bio,
      image: parsed.data.image,
    })
    .eq('id', userId);

  if (error) {
    return { error: 'Could not update profile.' };
  }

  return { success: 'Profile updated.' };
}

export async function createCampaignAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, userId } = await requireUser();
  const parsed = campaignFormSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { error: 'Invalid campaign data.' };
  }

  const maxAttempts = 8;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const publicSlug = createCampaignPublicSlug();
    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        dm_id: userId,
        name: parsed.data.name,
        description: parsed.data.description,
        rules: parsed.data.rules,
        max_players: parsed.data.max_players,
        max_level: parsed.data.max_level,
        status: parsed.data.status,
        allow_duplicate_races: parsed.data.allow_duplicate_races,
        allow_duplicate_classes: parsed.data.allow_duplicate_classes,
        public_slug: publicSlug,
      })
      .select('id')
      .single();

    if (!error && data) {
      redirect(`/dashboard/campaigns/${data.id}`);
    }

    if (error?.code !== '23505') {
      return { error: 'Could not create campaign.' };
    }
  }

  return { error: 'Could not allocate public campaign slug.' };
}

export async function updateCampaignAction(
  campaignId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireUser();
  const parsed = campaignFormSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { error: 'Invalid campaign data.' };
  }

  const { error } = await supabase
    .from('campaigns')
    .update({
      name: parsed.data.name,
      description: parsed.data.description,
      rules: parsed.data.rules,
      max_players: parsed.data.max_players,
      max_level: parsed.data.max_level,
      status: parsed.data.status,
      allow_duplicate_races: parsed.data.allow_duplicate_races,
      allow_duplicate_classes: parsed.data.allow_duplicate_classes,
    })
    .eq('id', campaignId);

  if (error) {
    return { error: 'Could not update campaign.' };
  }

  revalidatePath(`/dashboard/campaigns/${campaignId}`);
  return { success: 'Campaign updated.' };
}

export async function deleteCampaignAction(campaignId: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', campaignId);
  if (error) {
    redirect(`/dashboard/campaigns/${campaignId}?error=delete`);
  }
  redirect('/dashboard');
}

export async function createInviteAction(
  campaignId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireUser();
  const parsed = inviteTtlSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { error: 'Invalid TTL.' };
  }

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('max_players')
    .eq('id', campaignId)
    .single();

  if (!campaign) {
    return { error: 'Campaign not found.' };
  }

  const [{ count: seatsTaken }, { count: pendingInvites }] = await Promise.all([
    supabase
      .from('characters')
      .select('id', { count: 'exact', head: true })
      .eq('campaign_id', campaignId),
    supabase
      .from('invites')
      .select('id', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('status', 'pending'),
  ]);

  const occupied = (seatsTaken ?? 0) + (pendingInvites ?? 0);
  if (occupied >= campaign.max_players) {
    return {
      error:
        'No seats left. Delete a pending invite or a character, or raise max players.',
    };
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + parsed.data.ttl_days);

  const maxAttempts = 8;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const slug = createInviteSlug();
    const { error } = await supabase.from('invites').insert({
      campaign_id: campaignId,
      slug,
      expires_at: expiresAt.toISOString(),
      status: 'pending',
    });

    if (!error) {
      revalidatePath(`/dashboard/campaigns/${campaignId}`);
      return { success: 'Invite created.' };
    }

    // Unique violation on slug — retry without a pre-SELECT.
    if (error.code !== '23505') {
      return { error: 'Could not create invite.' };
    }
  }

  return { error: 'Could not allocate invite slug.' };
}

export async function revokeInviteAction(inviteId: string, campaignId: string) {
  const { supabase } = await requireUser();
  await supabase
    .from('invites')
    .update({ status: 'revoked' })
    .eq('id', inviteId)
    .eq('status', 'pending');
  redirect(`/dashboard/campaigns/${campaignId}`);
}

export async function deleteInviteAction(inviteId: string, campaignId: string) {
  const { supabase } = await requireUser();
  await supabase.from('invites').delete().eq('id', inviteId);
  redirect(`/dashboard/campaigns/${campaignId}`);
}

export async function updateCharacterAction(
  characterId: string,
  campaignId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, userId } = await requireUser();
  const parsed = characterFormSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { error: 'Invalid character data.' };
  }

  const [{ data: race }, { data: characterClass }] = await Promise.all([
    supabase
      .from('races')
      .select('id, name, is_active')
      .eq('id', parsed.data.race_id)
      .eq('dm_id', userId)
      .maybeSingle(),
    supabase
      .from('classes')
      .select('id, name, is_active')
      .eq('id', parsed.data.class_id)
      .eq('dm_id', userId)
      .maybeSingle(),
  ]);

  if (!race || !characterClass) {
    return { error: 'Select a valid race and class.' };
  }

  const { data: existing } = await supabase
    .from('characters')
    .select('race_id, class_id, campaign_id')
    .eq('id', characterId)
    .maybeSingle();

  if (!existing || existing.campaign_id !== campaignId) {
    return { error: 'Character not found in this campaign.' };
  }

  const raceAllowed = race.is_active || existing.race_id === race.id;
  const classAllowed =
    characterClass.is_active || existing.class_id === characterClass.id;

  if (!raceAllowed || !classAllowed) {
    return { error: 'Select a valid race and class.' };
  }

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('allow_duplicate_races, allow_duplicate_classes')
    .eq('id', campaignId)
    .single();

  if (!campaign) {
    return { error: 'Campaign not found.' };
  }

  if (!campaign.allow_duplicate_races) {
    const { count } = await supabase
      .from('characters')
      .select('id', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('race_id', race.id)
      .neq('id', characterId);
    if ((count ?? 0) > 0) {
      return { error: 'That race is already taken in this campaign.' };
    }
  }

  if (!campaign.allow_duplicate_classes) {
    const { count } = await supabase
      .from('characters')
      .select('id', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('class_id', characterClass.id)
      .neq('id', characterId);
    if ((count ?? 0) > 0) {
      return { error: 'That class is already taken in this campaign.' };
    }
  }

  const { error } = await supabase
    .from('characters')
    .update({
      character_name: parsed.data.character_name,
      image: parsed.data.image,
      race: race.name,
      class: characterClass.name,
      race_id: race.id,
      class_id: characterClass.id,
      email: parsed.data.email.toLowerCase(),
      contribution: parsed.data.contribution,
    })
    .eq('id', characterId);

  if (error) {
    if (error.code === '23505') {
      return { error: 'That email is already used in this campaign.' };
    }
    return { error: 'Could not update character.' };
  }

  redirect(`/dashboard/campaigns/${campaignId}`);
}

export async function deleteCharacterAction(
  characterId: string,
  campaignId: string,
) {
  const { supabase } = await requireUser();

  const { data: character, error: lookupError } = await supabase
    .from('characters')
    .select('invite_id')
    .eq('id', characterId)
    .single();

  if (lookupError || !character) {
    redirect(`/dashboard/campaigns/${campaignId}?error=delete-character`);
  }

  // Deleting the invite cascades the character and frees the seat.
  const { error } = await supabase
    .from('invites')
    .delete()
    .eq('id', character.invite_id);

  if (error) {
    redirect(`/dashboard/campaigns/${campaignId}?error=delete-character`);
  }

  revalidatePath(`/dashboard/campaigns/${campaignId}`);
  redirect(`/dashboard/campaigns/${campaignId}`);
}

export async function submitInviteCharacterAction(
  slug: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const limited = rateLimit(`invite-submit:${slug}`, 10, 60_000);
  if (!limited.ok) {
    return { error: 'Too many attempts. Try again shortly.' };
  }

  const parsed = characterFormSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { error: 'Check the form fields and try again.' };
  }

  const supabase = createServiceClient();
  const { error } = await supabase.rpc('submit_invite_character', {
    p_slug: slug,
    p_character_name: parsed.data.character_name,
    p_image: parsed.data.image,
    p_race_id: parsed.data.race_id,
    p_class_id: parsed.data.class_id,
    p_email: parsed.data.email.toLowerCase(),
    p_contribution: parsed.data.contribution,
  });

  if (error) {
    const message = error.message ?? '';
    if (message.includes('email_taken')) {
      return { error: 'That email is already used in this campaign.' };
    }
    if (message.includes('already_completed')) {
      return { error: 'This invite was already completed.' };
    }
    if (message.includes('not_found')) {
      return { error: 'Invite not found.' };
    }
    if (message.includes('invalid_race') || message.includes('invalid_class')) {
      return { error: 'Select a valid race and class.' };
    }
    if (message.includes('campaign_full')) {
      return { error: 'This campaign is full.' };
    }
    if (message.includes('duplicate_race')) {
      return { error: 'That race is already taken in this campaign.' };
    }
    if (message.includes('duplicate_class')) {
      return { error: 'That class is already taken in this campaign.' };
    }
    return { error: 'Could not submit character.' };
  }

  redirect(`/i/${slug}`);
}

type CatalogTable = 'races' | 'classes';

async function createCatalogItem(
  table: CatalogTable,
  revalidatePathname: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, userId } = await requireUser();
  const parsed = catalogItemFormSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { error: 'Check name and fields.' };
  }

  const { error } = await supabase.from(table).insert({
    dm_id: userId,
    name: parsed.data.name,
    description: parsed.data.description,
    is_active: parsed.data.is_active,
    sort_order: parsed.data.sort_order,
  });

  if (error) {
    if (error.code === '23505') {
      return { error: 'That name already exists.' };
    }
    return { error: 'Could not create item.' };
  }

  revalidatePath(revalidatePathname);
  return { success: 'Created.' };
}

async function updateCatalogItem(
  table: CatalogTable,
  id: string,
  revalidatePathname: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, userId } = await requireUser();
  const parsed = catalogItemFormSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { error: 'Check name and fields.' };
  }

  const { error } = await supabase
    .from(table)
    .update({
      name: parsed.data.name,
      description: parsed.data.description,
      is_active: parsed.data.is_active,
      sort_order: parsed.data.sort_order,
    })
    .eq('id', id)
    .eq('dm_id', userId);

  if (error) {
    if (error.code === '23505') {
      return { error: 'That name already exists.' };
    }
    return { error: 'Could not update item.' };
  }

  revalidatePath(revalidatePathname);
  return { success: 'Updated.' };
}

async function deleteCatalogItem(
  table: CatalogTable,
  id: string,
  redirectTo: string,
) {
  const { supabase, userId } = await requireUser();
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)
    .eq('dm_id', userId);

  if (error) {
    redirect(`${redirectTo}?error=delete`);
  }
  redirect(redirectTo);
}

export async function createRaceAction(
  prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return createCatalogItem('races', '/dashboard/races', prev, formData);
}

export async function updateRaceAction(
  id: string,
  prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return updateCatalogItem('races', id, '/dashboard/races', prev, formData);
}

export async function deleteRaceAction(id: string) {
  return deleteCatalogItem('races', id, '/dashboard/races');
}

export async function createClassAction(
  prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return createCatalogItem('classes', '/dashboard/classes', prev, formData);
}

export async function updateClassAction(
  id: string,
  prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return updateCatalogItem('classes', id, '/dashboard/classes', prev, formData);
}

export async function deleteClassAction(id: string) {
  return deleteCatalogItem('classes', id, '/dashboard/classes');
}
