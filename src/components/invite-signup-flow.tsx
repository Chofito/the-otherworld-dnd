'use client';

import { useState } from 'react';
import type { ActionState } from '@/app/actions';
import { ActionForm } from '@/components/action-form';
import { AvatarSelect } from '@/components/avatar-select';
import { CatalogSelect } from '@/components/catalog-select';
import type { Dictionary } from '@/i18n/types';
import { campaignStatusLabel } from '@/lib/campaign-status';
import type {
  InviteCampaignInfo,
  InviteCatalogOption,
} from '@/lib/invite-types';

type Step = 1 | 2;

type Props = {
  campaign: InviteCampaignInfo;
  expiresAt: string;
  races: InviteCatalogOption[];
  classes: InviteCatalogOption[];
  submitAction: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  labels: Dictionary['invite'] & {
    rules: string;
    seats: string;
    status: string;
    maxLevel: string;
    email: string;
    close: string;
  };
  statusLabels: Dictionary;
};

export function InviteSignupFlow({
  campaign,
  expiresAt,
  races,
  classes,
  submitAction,
  labels,
  statusLabels,
}: Props) {
  const [step, setStep] = useState<Step>(1);
  const catalogReady = races.length > 0 && classes.length > 0;
  const isFull = (campaign.seats_taken ?? 0) >= campaign.max_players;

  return (
    <main className="invite-flow">
      <p className="eyebrow eyebrow--center">{labels.eyebrowSignup}</p>

      <nav className="waymarks" aria-label={labels.stepCampaign}>
        {step === 2 ? (
          <button
            type="button"
            className="waymarks__item"
            onClick={() => setStep(1)}
          >
            {labels.stepCampaign}
          </button>
        ) : (
          <span className="waymarks__item is-active">{labels.stepCampaign}</span>
        )}
        <span
          className={step === 2 ? 'waymarks__item is-active' : 'waymarks__item'}
          aria-current={step === 2 ? 'step' : undefined}
        >
          {labels.stepCharacter}
        </span>
        <span className="waymarks__item is-locked" aria-disabled="true">
          {labels.stepSheet}
        </span>
      </nav>

      {step === 1 ? (
        <section className="summons" aria-labelledby="invite-campaign-title">
          <h1 id="invite-campaign-title" className="summons__title title-arc">
            {campaign.name}
          </h1>
          <p className="summons__lede">{campaign.description}</p>

          {campaign.rules ? (
            <div className="summons__rules">
              <h2>{labels.rules}</h2>
              <p>{campaign.rules}</p>
            </div>
          ) : null}

          <dl className="inscriptions">
            <div>
              <dt>{labels.maxLevel}</dt>
              <dd>{campaign.max_level}</dd>
            </div>
            <div>
              <dt>{labels.seats}</dt>
              <dd>
                {campaign.seats_taken ?? 0} / {campaign.max_players}
              </dd>
            </div>
            <div>
              <dt>{labels.status}</dt>
              <dd>{campaignStatusLabel(statusLabels, campaign.status)}</dd>
            </div>
            <div>
              <dt>{labels.inviteExpires}</dt>
              <dd>{new Date(expiresAt).toLocaleDateString()}</dd>
            </div>
          </dl>

          <div className="summons__actions">
            <button
              type="button"
              className="btn"
              onClick={() => setStep(2)}
              disabled={!catalogReady || isFull}
            >
              {labels.continueCharacter}
            </button>
            {isFull ? <p className="form-error">{labels.full}</p> : null}
            {!catalogReady ? (
              <p className="form-error">{labels.catalogMissing}</p>
            ) : null}
            {campaign.public_slug ? (
              <a href={`/c/${campaign.public_slug}`}>{labels.publicCampaign}</a>
            ) : null}
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="stack" aria-labelledby="invite-form-title">
          <div className="stack" style={{ gap: '0.2rem' }}>
            <h1 id="invite-form-title" className="title-arc">
              {labels.yourCharacter}
            </h1>
            <p className="muted">{campaign.name}</p>
          </div>

          <ActionForm action={submitAction} className="stack panel">
            <label className="field">
              <span>{labels.characterName}</span>
              <input name="character_name" required maxLength={80} />
            </label>
            <AvatarSelect
              name="image"
              required
              labels={{
                choose: labels.chooseAvatar,
                title: labels.selectPortrait,
                gender: labels.gender,
                female: labels.female,
                male: labels.male,
                close: labels.close,
              }}
            />
            <CatalogSelect
              name="race_id"
              label={labels.race}
              options={races}
              required
              emptyLabel={labels.selectOption}
              noOptionsLabel={labels.noOptions}
            />
            <CatalogSelect
              name="class_id"
              label={labels.class}
              options={classes}
              required
              emptyLabel={labels.selectOption}
              noOptionsLabel={labels.noOptions}
            />
            <label className="field">
              <span>{labels.email}</span>
              <input type="email" name="email" required maxLength={254} />
            </label>
            <label className="field">
              <span>{labels.biography}</span>
              <textarea
                name="biography"
                required
                rows={5}
                maxLength={4000}
                placeholder={labels.biographyPlaceholder}
              />
            </label>
            <label className="field">
              <span>{labels.contribution}</span>
              <textarea
                name="contribution"
                required
                rows={4}
                maxLength={2000}
                placeholder={labels.contributionPlaceholder}
              />
            </label>
            <button type="submit" className="btn">
              {labels.submit}
            </button>
          </ActionForm>
        </section>
      ) : null}
    </main>
  );
}
