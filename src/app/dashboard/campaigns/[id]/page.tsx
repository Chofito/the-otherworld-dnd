import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Ban, Trash2 } from 'lucide-react';
import {
  createInviteAction,
  deleteCampaignAction,
  deleteCharacterAction,
  deleteInviteAction,
  revokeInviteAction,
  updateCampaignAction,
  updateCharacterAction,
} from '@/app/actions';
import { ActionForm } from '@/components/action-form';
import { CampaignDetailTabs } from '@/components/campaign-detail-tabs';
import { CharacterAdminCard } from '@/components/character-admin-card';
import { CopyLinkButton } from '@/components/copy-link-button';
import { BioExcerpt } from '@/components/bio-excerpt';
import { PlayerCard } from '@/components/player-card';
import { getAvatarSrc } from '@/config/avatars';
import { getDictionary } from '@/i18n/get-dictionary';
import { campaignStatusLabel } from '@/lib/campaign-status';
import { inviteStatusLabel } from '@/lib/invite-status';
import { requireUser } from '@/lib/auth';
import { getRequestOrigin } from '@/lib/request-origin';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CampaignDetailPage({ params }: Props) {
  const { id } = await params;
  const { supabase, userId } = await requireUser();
  const [origin, dict] = await Promise.all([
    getRequestOrigin(),
    getDictionary(),
  ]);

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .eq('dm_id', userId)
    .single();

  if (!campaign) notFound();

  const [
    { data: invites },
    { data: characters },
    { data: races },
    { data: classes },
    { data: dmProfile },
  ] = await Promise.all([
    supabase
      .from('invites')
      .select('*')
      .eq('campaign_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('characters')
      .select('*')
      .eq('campaign_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('races')
      .select('id, name, description, is_active')
      .eq('dm_id', userId)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true }),
    supabase
      .from('classes')
      .select('id, name, description, is_active')
      .eq('dm_id', userId)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true }),
    supabase
      .from('profiles')
      .select('id, display_name, fictional_name, bio, image')
      .eq('id', userId)
      .single(),
  ]);

  const createInvite = createInviteAction.bind(null, id);
  const updateCampaign = updateCampaignAction.bind(null, id);
  const characterLabels = {
    edit: dict.campaignDetail.edit,
    delete: dict.common.delete,
    save: dict.common.save,
    cancel: dict.common.cancel,
    close: dict.common.close,
    characterName: dict.invite.characterName,
    race: dict.invite.race,
    class: dict.invite.class,
    email: dict.common.email,
    contribution: dict.campaignDetail.contribution,
    biography: dict.campaignDetail.biography,
    chooseAvatar: dict.invite.chooseAvatar,
    selectPortrait: dict.invite.selectPortrait,
    gender: dict.invite.gender,
    female: dict.invite.female,
    male: dict.invite.male,
    selectOption: dict.invite.selectOption,
    noOptions: dict.invite.noOptions,
    readMoreAbout: dict.common.readMoreAbout,
  };

  const settingsPanel = (
    <div className="stack">
      <section className="stack card">
        <h2>{dict.campaignDetail.settings}</h2>
        <ActionForm action={updateCampaign} className="stack">
          <label className="field">
            <span>{dict.common.name}</span>
            <input
              name="name"
              required
              maxLength={120}
              defaultValue={campaign.name}
            />
          </label>
          <label className="field">
            <span>{dict.common.description}</span>
            <textarea
              name="description"
              required
              rows={4}
              maxLength={5000}
              defaultValue={campaign.description}
            />
          </label>
          <label className="field">
            <span>{dict.common.rules}</span>
            <textarea
              name="rules"
              rows={4}
              maxLength={10000}
              defaultValue={campaign.rules}
              placeholder={dict.campaignDetail.rulesPlaceholder}
            />
          </label>
          <label className="field">
            <span>{dict.campaignNew.maxPlayers}</span>
            <input
              type="number"
              name="max_players"
              min={1}
              required
              defaultValue={campaign.max_players}
            />
          </label>
          <label className="field">
            <span>{dict.common.maxLevel}</span>
            <input
              type="number"
              name="max_level"
              min={1}
              required
              defaultValue={campaign.max_level}
            />
          </label>
          <label className="field">
            <span>{dict.common.status}</span>
            <select name="status" defaultValue={campaign.status}>
              <option value="open">{dict.campaignStatus.open}</option>
              <option value="ongoing">{dict.campaignStatus.ongoing}</option>
              <option value="completed">
                {dict.campaignStatus.completed}
              </option>
            </select>
          </label>
          <label className="row" style={{ gap: '0.5rem' }}>
            <input
              type="checkbox"
              name="allow_duplicate_races"
              defaultChecked={campaign.allow_duplicate_races}
            />
            <span>{dict.campaignNew.allowDuplicateRaces}</span>
          </label>
          <label className="row" style={{ gap: '0.5rem' }}>
            <input
              type="checkbox"
              name="allow_duplicate_classes"
              defaultChecked={campaign.allow_duplicate_classes}
            />
            <span>{dict.campaignNew.allowDuplicateClasses}</span>
          </label>
          <button type="submit" className="btn">
            {dict.common.save}
          </button>
        </ActionForm>
      </section>
    </div>
  );

  const invitesPanel = (
    <section className="stack">
      <div className="stack" style={{ gap: '0.35rem' }}>
        <h2>{dict.campaignDetail.invites}</h2>
        <p className="muted">
          {dict.campaignDetail.characters}: {characters?.length ?? 0} /{' '}
          {campaign.max_players}
        </p>
      </div>

      <ActionForm action={createInvite} className="invite-create">
        <label className="field invite-create__ttl">
          <span>{dict.common.ttl}</span>
          <input
            type="number"
            name="ttl_days"
            min={1}
            max={365}
            defaultValue={14}
            required
          />
        </label>
        <button
          type="submit"
          className="btn"
          disabled={
            (characters?.length ?? 0) +
              (invites?.filter((invite) => invite.status === 'pending')
                .length ?? 0) >=
            campaign.max_players
          }
        >
          {dict.campaignDetail.createInvite}
        </button>
      </ActionForm>

      {!invites?.length ? (
        <p className="muted">{dict.campaignDetail.noInvites}</p>
      ) : (
        <ul className="invite-grid">
          {invites.map((invite) => {
            const inviteUrl = `${origin}/i/${invite.slug}`;
            const statusLabel = inviteStatusLabel(dict, invite.status);
            return (
              <li key={invite.id} className="invite-card card">
                <div className="invite-card__top">
                  <span
                    className={`badge badge--invite badge--${invite.status}`}
                  >
                    {statusLabel}
                  </span>
                  <div className="invite-card__actions">
                    <CopyLinkButton
                      url={inviteUrl}
                      copyLabel={dict.campaignDetail.copyLink}
                      copiedLabel={dict.campaignDetail.copiedLink}
                      variant="icon"
                    />
                    {invite.status === 'pending' ? (
                      <form
                        action={revokeInviteAction.bind(
                          null,
                          invite.id,
                          campaign.id,
                        )}
                      >
                        <button
                          type="submit"
                          className="btn-secondary btn-icon"
                          aria-label={dict.campaignDetail.revoke}
                          title={dict.campaignDetail.revoke}
                        >
                          <Ban aria-hidden="true" strokeWidth={2} />
                        </button>
                      </form>
                    ) : null}
                    <form
                      action={deleteInviteAction.bind(
                        null,
                        invite.id,
                        campaign.id,
                      )}
                    >
                      <button
                        type="submit"
                        className="btn-danger btn-icon"
                        aria-label={dict.common.delete}
                        title={dict.common.delete}
                      >
                        <Trash2 aria-hidden="true" strokeWidth={2} />
                      </button>
                    </form>
                  </div>
                </div>
                <a
                  className="invite-card__link"
                  href={inviteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  /i/{invite.slug}
                </a>
                <p className="invite-card__meta">
                  <span className="player-card__label">
                    {dict.common.expires}
                  </span>
                  {new Date(invite.expires_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );

  const partyPanel = (
    <section className="stack">
      <h2>{dict.campaignDetail.characters}</h2>
      <div className="player-card-list">
        {dmProfile
          ? (() => {
              const dmSrc = getAvatarSrc(dmProfile.image, 'sm');
              const dmName = (
                dmProfile.fictional_name || dmProfile.display_name
              ).trim();
              return (
                <div className="admin-card-shell">
                  <PlayerCard layout="stack" size="md" className="card">
                    {dmSrc ? (
                      <PlayerCard.Media
                        src={dmSrc}
                        alt=""
                        width={96}
                        height={96}
                      />
                    ) : (
                      <PlayerCard.Slot className="player-card__media-fallback" />
                    )}
                    <PlayerCard.Body>
                      <PlayerCard.Title>{dmName}</PlayerCard.Title>
                      <PlayerCard.Meta>
                        {dict.publicCampaign.dungeonMaster}
                      </PlayerCard.Meta>
                      {dmProfile.bio ? (
                        <PlayerCard.Details>
                          <span className="player-card__label">
                            {dict.account.bio}
                          </span>
                          <BioExcerpt
                            text={dmProfile.bio}
                            name={dmName}
                            title={dict.account.bio}
                            readMoreLabel={dict.common.readMoreAbout}
                            closeLabel={dict.common.close}
                          />
                        </PlayerCard.Details>
                      ) : null}
                      <PlayerCard.Details>
                        <Link href="/dashboard/account">
                          {dict.campaignDetail.editProfile}
                        </Link>
                      </PlayerCard.Details>
                    </PlayerCard.Body>
                  </PlayerCard>
                </div>
              );
            })()
          : null}

        {!characters?.length ? (
          <p className="muted">{dict.campaignDetail.noCharacters}</p>
        ) : (
          characters.map((character) => (
            <CharacterAdminCard
              key={character.id}
              character={character}
              races={races ?? []}
              classes={classes ?? []}
              labels={characterLabels}
              updateAction={updateCharacterAction.bind(
                null,
                character.id,
                campaign.id,
              )}
              deleteAction={deleteCharacterAction.bind(
                null,
                character.id,
                campaign.id,
              )}
            />
          ))
        )}
      </div>
    </section>
  );

  return (
    <main className="stack">
      <div className="campaign-heading">
        <div className="campaign-heading__main">
          <p className="muted">
            <Link href="/dashboard">{dict.campaignDetail.back}</Link>
          </p>
          <p className="home__eyebrow">{dict.campaignDetail.eyebrow}</p>
          <h1 className="page-title">{campaign.name}</h1>
          <div className="campaign-heading__meta">
            <span className="badge">
              {campaignStatusLabel(dict, campaign.status)}
            </span>
            <a
              className="campaign-heading__public"
              href={`${origin}/c/${campaign.public_slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              /c/{campaign.public_slug}
            </a>
            <CopyLinkButton
              url={`${origin}/c/${campaign.public_slug}`}
              copyLabel={dict.campaignDetail.copyLink}
              copiedLabel={dict.campaignDetail.copiedLink}
              variant="icon"
            />
          </div>
        </div>
        <form action={deleteCampaignAction.bind(null, id)}>
          <button type="submit" className="btn-danger">
            {dict.campaignDetail.deleteCampaign}
          </button>
        </form>
      </div>

      <CampaignDetailTabs
        labels={{
          party: dict.campaignDetail.tabParty,
          invites: dict.campaignDetail.tabInvites,
          settings: dict.campaignDetail.tabSettings,
        }}
        party={partyPanel}
        invites={invitesPanel}
        settings={settingsPanel}
      />
    </main>
  );
}
