import Image from 'next/image';
import Link from 'next/link';
import { getAvatarSrc } from '@/config/avatars';
import type { Dictionary } from '@/i18n/types';
import { campaignStatusLabel } from '@/lib/campaign-status';
import type {
  InviteCampaignInfo,
  InviteCharacterInfo,
} from '@/lib/invite-types';

type Props = {
  campaign: InviteCampaignInfo;
  character: InviteCharacterInfo;
  labels: Dictionary['invite'] & {
    contribution: string;
    biography: string;
    maxLevel: string;
    status: string;
  };
  statusLabels: Dictionary;
};

export function InvitePermalinkView({
  campaign,
  character,
  labels,
  statusLabels,
}: Props) {
  const src = getAvatarSrc(character.image, 'lg');
  const publicHref = campaign.public_slug ? `/c/${campaign.public_slug}` : null;

  return (
    <main className="invite-flow">
      <p className="eyebrow eyebrow--center">{labels.eyebrowPermalink}</p>

      <figure className="plaque">
        <div className="plaque__door door door--portrait">
          {src ? (
            <Image
              src={src}
              alt={character.character_name}
              width={200}
              height={300}
            />
          ) : null}
        </div>
        <figcaption className="stack" style={{ gap: '0.9rem' }}>
          <h1 className="plaque__name title-arc">{character.character_name}</h1>
          <p className="plaque__lineage">
            {character.race} · {character.class}
          </p>
          <blockquote className="plaque__oath">
            <strong>{labels.biography}</strong>
            {character.biography}
          </blockquote>
          <blockquote className="plaque__oath">
            <strong>{labels.contribution}</strong>
            {character.contribution}
          </blockquote>
          <p className="plaque__campaign">
            {campaign.name} · {labels.maxLevel} {campaign.max_level} ·{' '}
            {labels.status} {campaignStatusLabel(statusLabels, campaign.status)}
          </p>
        </figcaption>
      </figure>

      <span className="ornament" aria-hidden="true">
        <span className="sigil" />
      </span>

      <p className="muted" style={{ textAlign: 'center' }}>
        {labels.permalinkNote}
        {publicHref ? (
          <>
            {' '}
            <Link href={publicHref}>{labels.publicCampaign}</Link>
          </>
        ) : null}
      </p>
    </main>
  );
}
