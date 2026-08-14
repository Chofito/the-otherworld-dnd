import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { submitInviteCharacterAction } from '@/app/actions';
import { InvitePermalinkView } from '@/components/invite-permalink-view';
import { InviteSignupFlow } from '@/components/invite-signup-flow';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { getDictionary, getLocale } from '@/i18n/get-dictionary';
import type { Json } from '@/lib/database.types';
import type { InvitePagePayload } from '@/lib/invite-types';
import { rateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/request-ip';
import { createServiceClient } from '@/lib/supabase/service';
import { buildPublicMetadata, truncateOgText } from '@/lib/site-metadata';

function parsePayload(data: Json | null): InvitePagePayload | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const raw = data as Record<string, unknown>;
  const campaign = raw.campaign;
  const invite = raw.invite;
  if (!campaign || typeof campaign !== 'object' || Array.isArray(campaign)) {
    return null;
  }
  if (!invite || typeof invite !== 'object' || Array.isArray(invite)) {
    return null;
  }

  const characterRaw = raw.character;
  let character: InvitePagePayload['character'] = null;
  if (
    characterRaw &&
    typeof characterRaw === 'object' &&
    !Array.isArray(characterRaw)
  ) {
    const c = characterRaw as Record<string, unknown>;
    character = {
      id: String(c.id ?? ''),
      character_name: String(c.character_name ?? ''),
      image: String(c.image ?? ''),
      race: String(c.race ?? ''),
      class: String(c.class ?? ''),
      race_id: (c.race_id as string | null | undefined) ?? null,
      class_id: (c.class_id as string | null | undefined) ?? null,
      contribution: String(c.contribution ?? ''),
      biography: String(c.biography ?? ''),
    };
  }

  const camp = campaign as Record<string, unknown>;
  const inv = invite as Record<string, unknown>;

  return {
    invite: {
      id: String(inv.id ?? ''),
      slug: String(inv.slug ?? ''),
      status: String(inv.status ?? ''),
      expires_at: String(inv.expires_at ?? ''),
      completed_at: (inv.completed_at as string | null | undefined) ?? null,
    },
    campaign: {
      id: String(camp.id ?? ''),
      name: String(camp.name ?? ''),
      description: String(camp.description ?? ''),
      rules: String(camp.rules ?? ''),
      max_players: Number(camp.max_players ?? 0),
      max_level: Number(camp.max_level ?? 0),
      status: String(camp.status ?? ''),
      public_slug: String(camp.public_slug ?? ''),
      allow_duplicate_races: Boolean(camp.allow_duplicate_races),
      allow_duplicate_classes: Boolean(camp.allow_duplicate_classes),
      seats_taken: Number(camp.seats_taken ?? 0),
    },
    character,
    races: Array.isArray(raw.races)
      ? (raw.races as InvitePagePayload['races'])
      : [],
    classes: Array.isArray(raw.classes)
      ? (raw.classes as InvitePagePayload['classes'])
      : [],
  };
}

type Props = {
  params: Promise<{ slug: string }>;
};


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dict = await getDictionary();
  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc('fetch_invite_page', {
    p_slug: slug,
  });

  if (error) {
    return buildPublicMetadata({
      title: dict.meta.clubTitle,
      description: dict.meta.description,
      path: `/i/${slug}`,
    });
  }

  const payload = parsePayload(data);
  const campaignName = payload?.campaign.name?.trim() || dict.meta.title;
  const description = truncateOgText(
    dict.meta.inviteOgDescription.replace('{name}', campaignName),
  );

  return buildPublicMetadata({
    title: dict.meta.clubTitle,
    description,
    path: `/i/${slug}`,
  });
}

export default async function InvitePage({ params }: Props) {
  const { slug } = await params;
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const inviteLabels = {
    ...dict.invite,
    rules: dict.common.rules,
    seats: dict.common.seats,
    status: dict.common.status,
    maxLevel: dict.common.maxLevel,
    email: dict.common.email,
    contribution: dict.invite.contribution,
    close: dict.common.close,
    readMoreAbout: dict.common.readMoreAbout,
  };

  const ip = (await getClientIp()) ?? 'unknown';
  const limited = rateLimit(`invite-get:${ip}:${slug}`, 60, 60_000);
  if (!limited.ok) {
    notFound();
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc('fetch_invite_page', {
    p_slug: slug,
  });

  if (error) notFound();
  const payload = parsePayload(data);
  if (!payload) notFound();

  const chrome = (
    <header className="threshold-bar">
      <span className="threshold-bar__brand">
        <span className="sigil" aria-hidden="true" />
        {dict.brand.name}
      </span>
      <LocaleSwitcher
        locale={locale}
        label={dict.locale.label}
        esLabel={dict.locale.es}
        enLabel={dict.locale.en}
      />
    </header>
  );

  // Step 3 forever: completed invite = read-only permalink.
  if (payload.invite.status === 'completed' && payload.character) {
    return (
      <div className="threshold">
        {chrome}
        <InvitePermalinkView
          campaign={payload.campaign}
          character={payload.character}
          labels={inviteLabels}
          statusLabels={dict}
        />
      </div>
    );
  }

  // Steps 1-2: pending invite signup flow.
  if (payload.invite.status === 'pending') {
    return (
      <div className="threshold">
        {chrome}
        <InviteSignupFlow
          campaign={payload.campaign}
          expiresAt={payload.invite.expires_at}
          races={payload.races ?? []}
          classes={payload.classes ?? []}
          submitAction={submitInviteCharacterAction.bind(null, slug)}
          labels={inviteLabels}
          statusLabels={dict}
        />
      </div>
    );
  }

  notFound();
}
