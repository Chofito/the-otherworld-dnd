import Image from 'next/image';
import { updateProfileAction } from '@/app/actions';
import { ActionForm } from '@/components/action-form';
import { AvatarSelect } from '@/components/avatar-select';
import { DEFAULT_AVATAR_ID, getAvatarSrc } from '@/config/avatars';
import { getDictionary } from '@/i18n/get-dictionary';
import { requireUser } from '@/lib/auth';

export default async function AccountPage() {
  const { supabase, userId } = await requireUser();
  const dict = await getDictionary();
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, fictional_name, bio, image')
    .eq('id', userId)
    .single();

  const imageId = profile?.image ?? DEFAULT_AVATAR_ID;
  const avatarSrc = getAvatarSrc(imageId, 'sm');

  return (
    <main className="stack" style={{ maxWidth: '28rem' }}>
      <p className="home__eyebrow">{dict.account.eyebrow}</p>
      <h1 className="page-title">{dict.account.title}</h1>
      <p className="muted">{dict.account.blurb}</p>
      {avatarSrc ? (
        <Image
          src={avatarSrc}
          alt=""
          className="avatar-preview-sm"
          width={96}
          height={96}
        />
      ) : null}
      <ActionForm action={updateProfileAction} className="stack card">
        <label className="field">
          <span>{dict.account.displayName}</span>
          <input
            name="display_name"
            required
            defaultValue={profile?.display_name ?? ''}
            maxLength={80}
          />
        </label>
        <label className="field">
          <span>{dict.account.fictionalName}</span>
          <input
            name="fictional_name"
            defaultValue={profile?.fictional_name ?? ''}
            maxLength={80}
          />
        </label>
        <label className="field">
          <span>{dict.account.bio}</span>
          <textarea
            name="bio"
            rows={4}
            maxLength={2000}
            defaultValue={profile?.bio ?? ''}
          />
        </label>
        <div className="field">
          <span>{dict.account.avatar}</span>
          <AvatarSelect
            name="image"
            defaultValue={imageId}
            labels={{
              choose: dict.invite.chooseAvatar,
              title: dict.invite.selectPortrait,
              gender: dict.invite.gender,
              female: dict.invite.female,
              male: dict.invite.male,
              close: dict.common.close,
            }}
          />
        </div>
        <button type="submit" className="btn">
          {dict.common.save}
        </button>
      </ActionForm>
    </main>
  );
}
