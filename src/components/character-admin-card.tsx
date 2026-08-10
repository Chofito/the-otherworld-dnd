'use client';

import { useState } from 'react';
import { ActionForm } from '@/components/action-form';
import { AvatarSelect } from '@/components/avatar-select';
import { CatalogSelect } from '@/components/catalog-select';
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
};

type Props = {
  character: CharacterCardData;
  races: CatalogOption[];
  classes: CatalogOption[];
  updateAction: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  deleteAction: () => void | Promise<void>;
};

export function CharacterAdminCard({
  character,
  races,
  classes,
  updateAction,
  deleteAction,
}: Props) {
  const [editing, setEditing] = useState(false);
  const src = getAvatarSrc(character.image, 'sm');

  const raceOptions = races.filter(
    (race) => race.is_active !== false || race.id === character.race_id,
  );
  const classOptions = classes.filter(
    (item) => item.is_active !== false || item.id === character.class_id,
  );

  return (
    <>
      <PlayerCard layout="row" size="md" className="card">
        {src ? (
          <PlayerCard.Media src={src} alt="" width={72} height={72} />
        ) : (
          <PlayerCard.Slot className="player-card__media-fallback" />
        )}
        <PlayerCard.Body>
          <PlayerCard.Title>{character.character_name}</PlayerCard.Title>
          <PlayerCard.Meta>
            {character.race} · {character.class}
          </PlayerCard.Meta>
          <PlayerCard.Details>{character.email}</PlayerCard.Details>
          {character.contribution ? (
            <PlayerCard.Details className="muted">
              {character.contribution}
            </PlayerCard.Details>
          ) : null}
        </PlayerCard.Body>
        <PlayerCard.Actions>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
          <form action={deleteAction}>
            <button type="submit" className="btn-danger">
              Delete
            </button>
          </form>
        </PlayerCard.Actions>
      </PlayerCard>

      <Modal
        open={editing}
        title={`Edit ${character.character_name}`}
        onClose={() => setEditing(false)}
      >
        <ActionForm action={updateAction} className="stack">
          <label className="field">
            <span>Character name</span>
            <input
              name="character_name"
              required
              defaultValue={character.character_name}
            />
          </label>
          <AvatarSelect name="image" defaultValue={character.image} />
          <CatalogSelect
            name="race_id"
            label="Race"
            options={raceOptions}
            defaultValue={character.race_id}
          />
          <CatalogSelect
            name="class_id"
            label="Class"
            options={classOptions}
            defaultValue={character.class_id}
          />
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              required
              defaultValue={character.email}
            />
          </label>
          <label className="field">
            <span>Contribution</span>
            <textarea
              name="contribution"
              required
              rows={3}
              defaultValue={character.contribution}
            />
          </label>
          <div className="row">
            <button type="submit" className="btn">
              Save character
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        </ActionForm>
      </Modal>
    </>
  );
}
