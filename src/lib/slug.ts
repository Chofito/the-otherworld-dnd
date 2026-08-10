import { customAlphabet } from 'nanoid';

const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
const generate = customAlphabet(alphabet, 6);

export function createInviteSlug(): string {
  return generate();
}

export function createCampaignPublicSlug(): string {
  return generate();
}
