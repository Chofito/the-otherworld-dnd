'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { ActionForm } from '@/components/action-form';
import { AvatarSelect } from '@/components/avatar-select';
import { CatalogSelect } from '@/components/catalog-select';
import { BioExcerpt } from '@/components/bio-excerpt';
import { Modal } from '@/components/modal';
import { PlayerCard } from '@/components/player-card';
import type { ActionState } from '@/app/actions';
import { getAvatarSrc } from '@/config/avatars';

export type CatalogOption = {
  id: string;
  name: string;
  description?: string | null;
  is_active?: boolean;
};

export type CharacterCardData = {
  id: string;
  character_name: string;
  image: string;
  race: string;
  class: string;
  race_id: string | null;
  class_id: string | null;
  email: string;
  contribution: string;
  biography: string;
};

type Props = {
  character: CharacterCardData;
  races: CatalogOption[];
  classes: CatalogOption[];
  updateAction: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  deleteAction: () => void | Promise<void>;
  labels: {
    edit: string;
    delete: string;
    save: string;
    cancel: string;
    close: string;
    characterName: string;
    race: string;
    class: string;
    email: string;
    contribution: string;
    biography: string;
    chooseAvatar: string;
    selectPortrait: string;
    gender: string;
    female: string;
    male: string;
    selectOption: string;
    noOptions: string;
    readMoreAbout: string;
  };
};

export function CharacterAdminCard({
  character,
  races,
  classes,
  updateAction,
  deleteAction,
  labels,
}: Props) {
  const [editing, setEditing] = useState(false);
  const src = getAvatarSrc(character.image, 'sm');
  const formId = `character-edit-${character.id}`;

  const raceOptions = races.filter(
    (race) => race.is_active !== false || race.id === character.race_id,
  );
  const classOptions = classes.filter(
    (item) => item.is_active !== false || item.id === character.class_id,
  );

  return (
    <div className="admin-card-shell">
      <PlayerCard layout="stack" size="md" className="card">
        <PlayerCard.Actions>
          <button
            type="button"
            className="btn-secondary btn-icon"
            onClick={() => setEditing(true)}
            aria-label={labels.edit}
            title={labels.edit}
          >
            <Pencil aria-hidden="true" strokeWidth={2} />
          </button>
          <form action={deleteAction}>
            <button
              type="submit"
              className="btn-danger btn-icon"
              aria-label={labels.delete}
              title={labels.delete}
            >
              <Trash2 aria-hidden="true" strokeWidth={2} />
            </button>
          </form>
        </PlayerCard.Actions>
        {src ? (
          <PlayerCard.Media src={src} alt="" width={96} height={96} />
        ) : (
          <PlayerCard.Slot className="player-card__media-fallback" />
        )}
        <PlayerCard.Body>
          <PlayerCard.Title>{character.character_name}</PlayerCard.Title>
          <PlayerCard.Meta>
            {character.race} · {character.class}
          </PlayerCard.Meta>
          <PlayerCard.Details>{character.email}</PlayerCard.Details>
          {character.biography ? (
            <PlayerCard.Details>
              <span className="player-card__label">{labels.biography}</span>
              <BioExcerpt
                text={character.biography}
                name={character.character_name}
                title={labels.biography}
                readMoreLabel={labels.readMoreAbout}
                closeLabel={labels.close}
              />
            </PlayerCard.Details>
          ) : null}
          {character.contribution ? (
            <PlayerCard.Details>
              <span className="player-card__label">{labels.contribution}</span>
              {character.contribution}
            </PlayerCard.Details>
          ) : null}
        </PlayerCard.Body>
      </PlayerCard>

      <Modal
        open={editing}
        title={`${labels.edit} ${character.character_name}`}
        onClose={() => setEditing(false)}
        closeLabel={labels.close}
        footer={
          <>
            <button type="submit" className="btn" form={formId}>
              {labels.save}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setEditing(false)}
            >
              {labels.cancel}
            </button>
          </>
        }
      >
        <ActionForm id={formId} action={updateAction} className="stack">
          <label className="field">
            <span>{labels.characterName}</span>
            <input
              name="character_name"
              required
              defaultValue={character.character_name}
            />
          </label>
          <AvatarSelect
            name="image"
            defaultValue={character.image}
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
            options={raceOptions}
            defaultValue={character.race_id}
            required
            emptyLabel={labels.selectOption}
            noOptionsLabel={labels.noOptions}
          />
          <CatalogSelect
            name="class_id"
            label={labels.class}
            options={classOptions}
            defaultValue={character.class_id}
            required
            emptyLabel={labels.selectOption}
            noOptionsLabel={labels.noOptions}
          />
          <label className="field">
            <span>{labels.email}</span>
            <input
              type="email"
              name="email"
              required
              defaultValue={character.email}
            />
          </label>
          <label className="field">
            <span>{labels.biography}</span>
            <textarea
              name="biography"
              required
              rows={4}
              maxLength={4000}
              defaultValue={character.biography}
            />
          </label>
          <label className="field">
            <span>{labels.contribution}</span>
            <textarea
              name="contribution"
              required
              rows={3}
              defaultValue={character.contribution}
            />
          </label>
        </ActionForm>
      </Modal>
    </div>
  );
}
