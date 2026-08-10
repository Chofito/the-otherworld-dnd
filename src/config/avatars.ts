import { FEMALE_STEMS, MALE_STEMS } from '@/config/avatars-stems';

export type AvatarGender = 'female' | 'male';
export type AvatarSize = 'sm' | 'lg';

export type AvatarOption = {
  id: string;
  gender: AvatarGender;
  folder: 'Female' | 'Male';
  stem: string;
};

export const DEFAULT_AVATAR_ID = 'Female/ElfF32';

export const AVATARS: AvatarOption[] = [
  ...FEMALE_STEMS.map((stem) => ({
    id: `Female/${stem}`,
    gender: 'female' as const,
    folder: 'Female' as const,
    stem,
  })),
  ...MALE_STEMS.map((stem) => ({
    id: `Male/${stem}`,
    gender: 'male' as const,
    folder: 'Male' as const,
    stem,
  })),
];

export const AVATAR_IDS = AVATARS.map((avatar) => avatar.id) as [
  string,
  ...string[],
];

export function getAvatarById(id: string): AvatarOption | undefined {
  return AVATARS.find((avatar) => avatar.id === id);
}

export function isAvatarId(value: string): boolean {
  return AVATARS.some((avatar) => avatar.id === value);
}

/** Resolve portrait URL. `sm` = circular cards; `lg` = picker modal. */
export function getAvatarSrc(
  id: string,
  size: AvatarSize = 'sm',
): string | null {
  const avatar = getAvatarById(id);
  if (!avatar) return null;
  return `/avatars/${avatar.folder}/${avatar.stem}_${size}.png`;
}

export function getAvatarsByGender(gender: AvatarGender): AvatarOption[] {
  return AVATARS.filter((avatar) => avatar.gender === gender);
}
