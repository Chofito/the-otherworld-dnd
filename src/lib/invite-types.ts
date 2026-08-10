export type InviteCampaignInfo = {
  id: string;
  name: string;
  description: string;
  rules?: string;
  max_players: number;
  max_level: number;
  status: string;
  public_slug?: string;
  allow_duplicate_races?: boolean;
  allow_duplicate_classes?: boolean;
  seats_taken?: number;
};

export type InviteCatalogOption = {
  id: string;
  name: string;
  description: string | null;
};

/** Public character payload — never includes email. */
export type InviteCharacterInfo = {
  id: string;
  character_name: string;
  image: string;
  race: string;
  class: string;
  race_id?: string | null;
  class_id?: string | null;
  contribution: string;
};

export type InvitePagePayload = {
  invite: {
    id: string;
    slug: string;
    status: string;
    expires_at: string;
    completed_at?: string | null;
  };
  campaign: InviteCampaignInfo;
  character: InviteCharacterInfo | null;
  races: InviteCatalogOption[];
  classes: InviteCatalogOption[];
};

export type PublicCampaignPartyMember = {
  id: string;
  character_name: string;
  image: string;
  race: string;
  class: string;
  role: 'dm' | 'player';
  bio?: string;
};

export type PublicCampaignPagePayload = {
  campaign: InviteCampaignInfo;
  party: PublicCampaignPartyMember[];
};
