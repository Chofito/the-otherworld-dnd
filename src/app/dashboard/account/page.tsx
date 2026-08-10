import Image from 'next/image';
import { updateProfileAction } from '@/app/actions';
import { ActionForm } from '@/components/action-form';
import { AvatarSelect } from '@/components/avatar-select';
import { DEFAULT_AVATAR_ID, getAvatarSrc } from '@/config/avatars';
import { requireUser } from '@/lib/auth';

export default async function AccountPage() {
  const { supabase, userId } = await requireUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, fictional_name, bio, image')
    .eq('id', userId)
    .single();

  const imageId = profile?.image ?? DEFAULT_AVATAR_ID;
  const avatarSrc = getAvatarSrc(imageId, 'sm');

  return (
    <main className="stack" style={{ maxWidth: '28rem' }}>
      <h1>Account</h1>
      <p className="muted">
        Tu perfil de DM. El nombre ficticio y la bio aparecen en el roster
        público de tus campañas.
      </p>
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
          <span>Display name</span>
          <input
            name="display_name"
            required
            defaultValue={profile?.display_name ?? ''}
            maxLength={80}
          />
        </label>
        <label className="field">
          <span>Nombre ficticio</span>
          <input
            name="fictional_name"
            defaultValue={profile?.fictional_name ?? ''}
            maxLength={80}
            placeholder="Cómo te ven en la mesa"
          />
        </label>
        <label className="field">
          <span>Bio</span>
          <textarea
            name="bio"
            rows={4}
            maxLength={2000}
            defaultValue={profile?.bio ?? ''}
            placeholder="Quién eres en el mundo de la campaña"
          />
        </label>
        <div className="field">
          <span>Image</span>
          <AvatarSelect name="image" defaultValue={imageId} />
        </div>
        <button type="submit" className="btn">
          Save
        </button>
      </ActionForm>
    </main>
  );
}
