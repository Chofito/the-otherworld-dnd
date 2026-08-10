import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PlayerCard } from '@/components/player-card';
import { getAvatarSrc } from '@/config/avatars';
import type { Json } from '@/lib/database.types';
import type { PublicCampaignPagePayload } from '@/lib/invite-types';
import { rateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/request-ip';
import { createServiceClient } from '@/lib/supabase/service';

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
      };
    }),
  };
}

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function PublicCampaignPage({ params }: Props) {
  const { slug } = await params;
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
    <main className="invite-flow stack">
      <p className="muted">The Otherworld · campaña pública</p>
      <header className="stack">
        <h1>{campaign.name}</h1>
        <p>{campaign.description}</p>
        <dl className="home__facts">
          <div>
            <dt>Status</dt>
            <dd>{campaign.status}</dd>
          </div>
          <div>
            <dt>Players</dt>
            <dd>
              {campaign.seats_taken ?? 0} / {campaign.max_players}
            </dd>
          </div>
          <div>
            <dt>Max level</dt>
            <dd>{campaign.max_level}</dd>
          </div>
        </dl>
      </header>

      {campaign.rules ? (
        <section className="stack card">
          <h2>Rules</h2>
          <p style={{ whiteSpace: 'pre-wrap' }}>{campaign.rules}</p>
        </section>
      ) : null}

      <section className="stack">
        <h2>Party</h2>
        {!party.length ? (
          <p className="muted">Aún no hay personajes inscritos.</p>
        ) : (
          <div className="player-card-list">
            {party.map((member) => {
              const src = getAvatarSrc(member.image, 'sm');
              const meta =
                member.role === 'dm'
                  ? 'Dungeon Master'
                  : `${member.race} · ${member.class}`;
              return (
                <PlayerCard
                  key={member.id}
                  layout="row"
                  size="md"
                  className="card"
                >
                  {src ? (
                    <PlayerCard.Media src={src} alt="" width={72} height={72} />
                  ) : (
                    <PlayerCard.Slot className="player-card__media-fallback" />
                  )}
                  <PlayerCard.Body>
                    <PlayerCard.Title>{member.character_name}</PlayerCard.Title>
                    <PlayerCard.Meta>{meta}</PlayerCard.Meta>
                    {member.role === 'dm' && member.bio ? (
                      <PlayerCard.Details className="muted">
                        {member.bio}
                      </PlayerCard.Details>
                    ) : null}
                  </PlayerCard.Body>
                </PlayerCard>
              );
            })}
          </div>
        )}
      </section>

      <p className="muted">
        <Link href="/">The Otherworld</Link>
      </p>
    </main>
  );
}
