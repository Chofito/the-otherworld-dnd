import Link from 'next/link';
import { PlayerCard } from '@/components/player-card';
import { getAvatarSrc } from '@/config/avatars';
import type {
  InviteCampaignInfo,
  InviteCharacterInfo,
} from '@/lib/invite-types';

type Props = {
  campaign: InviteCampaignInfo;
  character: InviteCharacterInfo;
};

export function InvitePermalinkView({ campaign, character }: Props) {
  const src = getAvatarSrc(character.image, 'sm');
  const publicHref = campaign.public_slug ? `/c/${campaign.public_slug}` : null;

  return (
    <main className="invite-flow">
      <p className="muted">The Otherworld · tu ficha</p>
      <header className="invite-flow__header stack">
        <h1>{campaign.name}</h1>
        <p>{campaign.description}</p>
        {publicHref ? (
          <p>
            <Link href={publicHref}>Ver página pública de la campaña</Link>
          </p>
        ) : null}
      </header>

      <PlayerCard layout="stack" size="lg" className="card">
        {src ? <PlayerCard.Media src={src} alt="" /> : null}
        <PlayerCard.Body>
          <PlayerCard.Title>{character.character_name}</PlayerCard.Title>
          <PlayerCard.Meta>
            {character.race} · {character.class}
          </PlayerCard.Meta>
          <PlayerCard.Details>
            <strong>Contribution:</strong> {character.contribution}
          </PlayerCard.Details>
          <PlayerCard.Details className="muted">
            Max level {campaign.max_level} · Campaign {campaign.status}
          </PlayerCard.Details>
        </PlayerCard.Body>
      </PlayerCard>

      <p className="muted">
        Este enlace es permanente. Guárdalo para volver a tu personaje.
      </p>
    </main>
  );
}
