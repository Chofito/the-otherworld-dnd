import type { Dictionary } from '@/i18n/types';

export type CampaignStatus = 'open' | 'ongoing' | 'completed';

export function isCampaignStatus(value: string): value is CampaignStatus {
  return value === 'open' || value === 'ongoing' || value === 'completed';
}

export function campaignStatusLabel(
  dict: Dictionary,
  status: string,
): string {
  if (!isCampaignStatus(status)) return status;
  return dict.campaignStatus?.[status] ?? status;
}
