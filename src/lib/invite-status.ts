import type { Dictionary } from '@/i18n/types';

export type InviteStatus = 'pending' | 'completed' | 'expired' | 'revoked';

export function isInviteStatus(value: string): value is InviteStatus {
  return (
    value === 'pending' ||
    value === 'completed' ||
    value === 'expired' ||
    value === 'revoked'
  );
}

export function inviteStatusLabel(dict: Dictionary, status: string): string {
  if (!isInviteStatus(status)) return status;
  return dict.inviteStatus?.[status] ?? status;
}
