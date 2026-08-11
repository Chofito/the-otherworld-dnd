'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Modal } from '@/components/modal';
import {
  type AvatarGender,
  type AvatarOption,
  DEFAULT_AVATAR_ID,
  getAvatarById,
  getAvatarSrc,
  getAvatarsByGender,
} from '@/config/avatars';

type Props = {
  name: string;
  defaultValue?: string;
  required?: boolean;
  labels?: {
    choose: string;
    title: string;
    gender: string;
    female: string;
    male: string;
    close: string;
  };
};

export function AvatarSelect({
  name,
  defaultValue = DEFAULT_AVATAR_ID,
  required = true,
  labels,
}: Props) {
  const initial = getAvatarById(defaultValue)?.id ?? DEFAULT_AVATAR_ID;
  const [value, setValue] = useState(initial);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<AvatarGender>(
    getAvatarById(initial)?.gender ?? 'female',
  );

  const selected = useMemo(() => getAvatarById(value), [value]);
  const options = useMemo(() => getAvatarsByGender(tab), [tab]);
  const previewSm = getAvatarSrc(value, 'sm');

  function pick(avatar: AvatarOption) {
    setValue(avatar.id);
    setOpen(false);
  }

  return (
    <div className="stack">
      <input type="hidden" name={name} value={value} required={required} />
      <div className="row">
        {previewSm ? (
          <Image
            src={previewSm}
            alt=""
            className="avatar-preview-sm"
            width={56}
            height={56}
          />
        ) : null}
        <div className="stack" style={{ gap: '0.25rem' }}>
          <span className="muted">{selected?.stem ?? value}</span>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setOpen(true)}
          >
            {labels?.choose ?? 'Choose image'}
          </button>
        </div>
      </div>

      <Modal
        open={open}
        title={labels?.title ?? 'Select portrait'}
        onClose={() => setOpen(false)}
        size="lg"
        variant="flush"
        closeLabel={labels?.close ?? 'Cerrar'}
      >
        <div className="avatar-picker">
          <div
            className="avatar-picker__tabs row"
            role="tablist"
            aria-label={labels?.gender ?? 'Gender'}
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'female'}
              className={tab === 'female' ? 'btn' : 'btn-secondary'}
              onClick={() => setTab('female')}
            >
              {labels?.female ?? 'Female'}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'male'}
              className={tab === 'male' ? 'btn' : 'btn-secondary'}
              onClick={() => setTab('male')}
            >
              {labels?.male ?? 'Male'}
            </button>
          </div>

          <div className="avatar-picker__grid">
            {options.map((avatar) => {
              const lg = getAvatarSrc(avatar.id, 'lg');
              const active = avatar.id === value;
              return (
                <button
                  key={avatar.id}
                  type="button"
                  className={
                    active
                      ? 'avatar-picker__item is-active'
                      : 'avatar-picker__item'
                  }
                  onClick={() => pick(avatar)}
                >
                  {lg ? (
                    <Image
                      src={lg}
                      alt={avatar.stem}
                      className="avatar-picker__lg"
                      width={200}
                      height={300}
                    />
                  ) : null}
                  <span className="muted">{avatar.stem}</span>
                </button>
              );
            })}
          </div>
        </div>
      </Modal>
    </div>
  );
}
