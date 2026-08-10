'use client';

import { useState } from 'react';
import { ActionForm } from '@/components/action-form';
import { AvatarSelect } from '@/components/avatar-select';
import { CatalogSelect } from '@/components/catalog-select';
import type { ActionState } from '@/app/actions';
import type { InviteCampaignInfo, InviteCatalogOption } from '@/lib/invite-types';

type Step = 1 | 2;

type Props = {
  campaign: InviteCampaignInfo;
  expiresAt: string;
  races: InviteCatalogOption[];
  classes: InviteCatalogOption[];
  submitAction: (prev: ActionState, formData: FormData) => Promise<ActionState>;
};

export function InviteSignupFlow({
  campaign,
  expiresAt,
  races,
  classes,
  submitAction,
}: Props) {
  const [step, setStep] = useState<Step>(1);
  const catalogReady = races.length > 0 && classes.length > 0;

  return (
    <main className="invite-flow">
      <p className="muted">The Otherworld · inscripción</p>

      <nav className="invite-steps" aria-label="Pasos de inscripción">
        <span className={step === 1 ? 'invite-steps__item is-active' : 'invite-steps__item'}>
          1. Campaña
        </span>
        <span className={step === 2 ? 'invite-steps__item is-active' : 'invite-steps__item'}>
          2. Personaje
        </span>
        <span className="invite-steps__item">3. Tu ficha</span>
      </nav>

      {step === 1 ? (
        <section className="stack card" aria-labelledby="invite-campaign-title">
          <h1 id="invite-campaign-title">{campaign.name}</h1>
          <p>{campaign.description}</p>
          {campaign.rules ? (
            <div className="stack">
              <h2>Rules</h2>
              <p style={{ whiteSpace: 'pre-wrap' }}>{campaign.rules}</p>
            </div>
          ) : null}
          <dl className="home__facts">
            <div>
              <dt>Max level</dt>
              <dd>{campaign.max_level}</dd>
            </div>
            <div>
              <dt>Seats</dt>
              <dd>
                {campaign.seats_taken ?? 0} / {campaign.max_players}
              </dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{campaign.status}</dd>
            </div>
            <div>
              <dt>Invite expires</dt>
              <dd>{new Date(expiresAt).toLocaleString()}</dd>
            </div>
          </dl>
          {campaign.public_slug ? (
            <p>
              <a href={`/c/${campaign.public_slug}`}>
                Ver página pública de la campaña
              </a>
            </p>
          ) : null}
          <button
            type="button"
            className="btn"
            onClick={() => setStep(2)}
            disabled={
              !catalogReady ||
              (campaign.seats_taken ?? 0) >= campaign.max_players
            }
          >
            Continuar a crear personaje
          </button>
          {(campaign.seats_taken ?? 0) >= campaign.max_players ? (
            <p className="form-error">Esta campaña ya está llena.</p>
          ) : null}
          {!catalogReady ? (
            <p className="form-error">
              El DM aún no configuró razas y clases para esta campaña.
            </p>
          ) : null}
        </section>
      ) : null}

      {step === 2 ? (
        <section className="stack" aria-labelledby="invite-form-title">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h1 id="invite-form-title">Tu personaje</h1>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setStep(1)}
            >
              Volver a campaña
            </button>
          </div>
          <p className="muted">{campaign.name}</p>

          <ActionForm action={submitAction} className="stack card">
            <label className="field">
              <span>Character name</span>
              <input name="character_name" required maxLength={80} />
            </label>
            <AvatarSelect name="image" />
            <CatalogSelect name="race_id" label="Race" options={races} />
            <CatalogSelect name="class_id" label="Class" options={classes} />
            <label className="field">
              <span>Email</span>
              <input type="email" name="email" required maxLength={254} />
            </label>
            <label className="field">
              <span>Contribution</span>
              <textarea
                name="contribution"
                required
                rows={4}
                maxLength={2000}
                placeholder="What are you bringing to the session?"
              />
            </label>
            <button type="submit" className="btn">
              Enviar y ver mi ficha
            </button>
          </ActionForm>
        </section>
      ) : null}
    </main>
  );
}
