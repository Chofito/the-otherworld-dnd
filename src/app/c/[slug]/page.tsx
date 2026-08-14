import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BioExcerpt } from '@/components/bio-excerpt';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { getAvatarSrc } from '@/config/avatars';
import { getDictionary, getLocale } from '@/i18n/get-dictionary';
import { campaignStatusLabel } from '@/lib/campaign-status';
import type { Json } from '@/lib/database.types';
import type { PublicCampaignPagePayload } from '@/lib/invite-types';
import { rateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/request-ip';
import { createServiceClient } from '@/lib/supabase/service';
import { buildPublicMetadata, truncateOgText } from '@/lib/site-metadata';

function parsePayload(data: Json | null): PublicCampaignPagePayload | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const raw = data as Record<string, unknown>;
  const campaign = raw.campaign;
  if (!campaign || typeof campaign !== 'object' || Array.isArray(campaign)) {
    return null;
  }
  const camp = campaign as Record<string, unknown>;
  const partyRaw = Array.isArray(raw.party) ? raw.party : [];

  return {
    campaign: {
      id: String(camp.id ?? ''),
      name: String(camp.name ?? ''),
      description: String(camp.description ?? ''),
      rules: String(camp.rules ?? ''),
      max_players: Number(camp.max_players ?? 0),
      max_level: Number(camp.max_level ?? 0),
      status: String(camp.status ?? ''),
      public_slug: String(camp.public_slug ?? ''),
      seats_taken: Number(camp.seats_taken ?? 0),
    },
    party: partyRaw.map((item) => {
      const m = (item ?? {}) as Record<string, unknown>;
      const role = m.role === 'dm' ? 'dm' : 'player';
      return {
        id: String(m.id ?? ''),
        character_name: String(m.character_name ?? ''),
        image: String(m.image ?? ''),
        race: String(m.race ?? ''),
        class: String(m.class ?? ''),
        role,
        bio: role === 'dm' ? String(m.bio ?? '') : undefined,
        biography: role === 'player' ? String(m.biography ?? '') : undefined,
      };
    }),
  };
}

type Props = {
  params: Promise<{ slug: string }>;
};


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dict = await getDictionary();
  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc('fetch_campaign_page', {
    p_slug: slug,
  });

  if (error) {
    return buildPublicMetadata({
      title: dict.meta.clubTitle,
      description: dict.meta.description,
      path: `/c/${slug}`,
    });
  }

  const payload = parsePayload(data);
  const description = truncateOgText(
    payload?.campaign.description?.trim() || dict.meta.description,
  );

  return buildPublicMetadata({
    title: dict.meta.clubTitle,
    description,
    path: `/c/${slug}`,
  });
}

export default async function PublicCampaignPage({ params }: Props) {
  const { slug } = await params;
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const ip = (await getClientIp()) ?? 'unknown';
  const limited = rateLimit(`campaign-get:${ip}:${slug}`, 60, 60_000);
  if (!limited.ok) {
    notFound();
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc('fetch_campaign_page', {
    p_slug: slug,
  });

  if (error) notFound();
  const payload = parsePayload(data);
  if (!payload) notFound();

  const { campaign, party } = payload;

  return (
    <main className="saga">
      <header className="threshold-bar">
        <Link href="/" className="threshold-bar__brand">
          <span className="sigil" aria-hidden="true" />
          {dict.brand.name}
        </Link>
        <LocaleSwitcher
          locale={locale}
          label={dict.locale.label}
          esLabel={dict.locale.es}
          enLabel={dict.locale.en}
        />
      </header>

      <section className="saga__hero">
        <p className="eyebrow eyebrow--center">{dict.publicCampaign.eyebrow}</p>
        <h1 className="saga__title title-arc">{campaign.name}</h1>
        <p className="saga__lede">{campaign.description}</p>
        <dl className="inscriptions saga__facts">
          <div>
            <dt>{dict.common.status}</dt>
            <dd>{campaignStatusLabel(dict, campaign.status)}</dd>
          </div>
          <div>
            <dt>{dict.dashboard.players}</dt>
            <dd>
              {campaign.seats_taken ?? 0} / {campaign.max_players}
            </dd>
          </div>
          <div>
            <dt>{dict.common.maxLevel}</dt>
            <dd>{campaign.max_level}</dd>
          </div>
        </dl>
      </section>

      <div className="saga__body">
        {campaign.rules ? (
          <section className="stack">
            <h2 className="saga__section-title">{dict.common.rules}</h2>
            <div className="summons__rules">
              <p>{campaign.rules}</p>
            </div>
          </section>
        ) : null}

        <section className="stack" style={{ gap: '1.75rem' }}>
          <h2 className="saga__section-title">{dict.common.party}</h2>
          {!party.length ? (
            <p className="muted">{dict.publicCampaign.noParty}</p>
          ) : (
            <div className="procession">
              {party.map((member) => {
                const src = getAvatarSrc(member.image, 'lg');
                const meta =
                  member.role === 'dm'
                    ? dict.publicCampaign.dungeonMaster
                    : `${member.race} · ${member.class}`;
                return (
                  <figure className="procession__member" key={member.id}>
                    <div
                      className={
                        src
                          ? 'procession__door door door--portrait'
                          : 'procession__door door door--unlit'
                      }
                    >
                      {src ? (
                        <Image
                          src={src}
                          alt={member.character_name}
                          width={200}
                          height={300}
                        />
                      ) : (
                        <span className="sigil" aria-hidden="true" />
                      )}
                    </div>
                    <figcaption className="stack" style={{ gap: '0.25rem' }}>
                      <span className="procession__name">
                        {member.character_name}
                      </span>
                      <span className="procession__meta">{meta}</span>
                      {member.role === 'dm' && member.bio ? (
                        <BioExcerpt
                          className="procession__bio"
                          text={member.bio}
                          name={member.character_name}
                          title={dict.account.bio}
                          readMoreLabel={dict.common.readMoreAbout}
                          closeLabel={dict.common.close}
                        />
                      ) : null}
                      {member.role === 'player' && member.biography ? (
                        <BioExcerpt
                          className="procession__bio"
                          text={member.biography}
                          name={member.character_name}
                          title={dict.campaignDetail.biography}
                          readMoreLabel={dict.common.readMoreAbout}
                          closeLabel={dict.common.close}
                        />
                      ) : null}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <footer className="saga__footer">
        <span className="ornament" aria-hidden="true">
          <span className="sigil" />
        </span>
        <p className="muted">
          <Link href="/">{dict.brand.name}</Link>
        </p>
      </footer>
    </main>
  );
}
