import Link from 'next/link';
import { notFound } from 'next/navigation';
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
import { CharacterAdminCard } from '@/components/character-admin-card';
import { CopyLinkButton } from '@/components/copy-link-button';
import { PlayerCard } from '@/components/player-card';
import { getAvatarSrc } from '@/config/avatars';
import { requireUser } from '@/lib/auth';
import { getRequestOrigin } from '@/lib/request-origin';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CampaignDetailPage({ params }: Props) {
  const { id } = await params;
  const { supabase, userId } = await requireUser();
  const origin = await getRequestOrigin();

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

  return (
    <main className="stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div>
          <p className="muted">
            <Link href="/dashboard">← Campaigns</Link>
          </p>
          <h1>{campaign.name}</h1>
        </div>
        <form action={deleteCampaignAction.bind(null, id)}>
          <button type="submit" className="btn-danger">
            Delete campaign
          </button>
        </form>
      </div>

      <section className="stack card">
        <h2>Campaign settings</h2>
        <ActionForm action={updateCampaign} className="stack">
          <label className="field">
            <span>Name</span>
            <input
              name="name"
              required
              maxLength={120}
              defaultValue={campaign.name}
            />
          </label>
          <label className="field">
            <span>Description</span>
            <textarea
              name="description"
              required
              rows={4}
              maxLength={5000}
              defaultValue={campaign.description}
            />
          </label>
          <label className="field">
            <span>Rules</span>
            <textarea
              name="rules"
              rows={4}
              maxLength={10000}
              defaultValue={campaign.rules}
              placeholder="House rules, session zero notes, etc."
            />
          </label>
          <label className="field">
            <span>Max players</span>
            <input
              type="number"
              name="max_players"
              min={1}
              required
              defaultValue={campaign.max_players}
            />
          </label>
          <label className="field">
            <span>Max level</span>
            <input
              type="number"
              name="max_level"
              min={1}
              required
              defaultValue={campaign.max_level}
            />
          </label>
          <label className="field">
            <span>Status</span>
            <select name="status" defaultValue={campaign.status}>
              <option value="open">open</option>
              <option value="ongoing">ongoing</option>
              <option value="completed">completed</option>
            </select>
          </label>
          <label className="row" style={{ gap: '0.5rem' }}>
            <input
              type="checkbox"
              name="allow_duplicate_races"
              defaultChecked={campaign.allow_duplicate_races}
            />
            <span>Allow duplicated races</span>
          </label>
          <label className="row" style={{ gap: '0.5rem' }}>
            <input
              type="checkbox"
              name="allow_duplicate_classes"
              defaultChecked={campaign.allow_duplicate_classes}
            />
            <span>Allow duplicated classes</span>
          </label>
          <button type="submit" className="btn">
            Save campaign
          </button>
        </ActionForm>
      </section>

      <section className="stack card">
        <h2>Public campaign page</h2>
        <p className="muted">
          Roster público (sin emails). Comparte este enlace con la mesa.
        </p>
        <div className="row">
          <a
            href={`${origin}/c/${campaign.public_slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {origin}/c/{campaign.public_slug}
          </a>
          <CopyLinkButton url={`${origin}/c/${campaign.public_slug}`} />
        </div>
      </section>

      <section className="stack card">
        <h2>Invites</h2>
        <p className="muted">
          Characters: {characters?.length ?? 0} / {campaign.max_players}
          {' · '}
          Pending invites:{' '}
          {invites?.filter((invite) => invite.status === 'pending').length ?? 0}
        </p>
        <ActionForm action={createInvite} className="row">
          <label className="field">
            <span>TTL (days)</span>
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
            Generate invite
          </button>
        </ActionForm>

        {!invites?.length ? (
          <p className="muted">No invites yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Link</th>
                <th>Status</th>
                <th>Expires</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((invite) => {
                const inviteUrl = `${origin}/i/${invite.slug}`;
                return (
                  <tr key={invite.id}>
                    <td>
                      <div className="row">
                        <a
                          href={inviteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {inviteUrl}
                        </a>
                        <CopyLinkButton url={inviteUrl} />
                      </div>
                    </td>
                    <td>{invite.status}</td>
                    <td>{new Date(invite.expires_at).toLocaleString()}</td>
                    <td className="row">
                      {invite.status === 'pending' ? (
                        <form
                          action={revokeInviteAction.bind(
                            null,
                            invite.id,
                            campaign.id,
                          )}
                        >
                          <button type="submit" className="btn-secondary">
                            Revoke
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
                        <button type="submit" className="btn-danger">
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section className="stack card">
        <h2>Characters</h2>
        <div className="player-card-list">
          {dmProfile ? (
            (() => {
              const dmSrc = getAvatarSrc(dmProfile.image, 'sm');
              const dmName = (
                dmProfile.fictional_name || dmProfile.display_name
              ).trim();
              return (
                <PlayerCard layout="row" size="md" className="card">
                  {dmSrc ? (
                    <PlayerCard.Media
                      src={dmSrc}
                      alt=""
                      width={72}
                      height={72}
                    />
                  ) : (
                    <PlayerCard.Slot className="player-card__media-fallback" />
                  )}
                  <PlayerCard.Body>
                    <PlayerCard.Title>{dmName}</PlayerCard.Title>
                    <PlayerCard.Meta>Dungeon Master</PlayerCard.Meta>
                    {dmProfile.bio ? (
                      <PlayerCard.Details className="muted">
                        {dmProfile.bio}
                      </PlayerCard.Details>
                    ) : null}
                    <PlayerCard.Details className="muted">
                      <Link href="/dashboard/account">Edit profile</Link>
                    </PlayerCard.Details>
                  </PlayerCard.Body>
                </PlayerCard>
              );
            })()
          ) : null}

          {!characters?.length ? (
            <p className="muted">No player characters submitted yet.</p>
          ) : (
            characters.map((character) => (
              <CharacterAdminCard
                key={character.id}
                character={character}
                races={races ?? []}
                classes={classes ?? []}
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
    </main>
  );
}
