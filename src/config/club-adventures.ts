export type ClubAdventureStatus = 'playing' | 'up_next' | 'finished';

export type ClubAdventure = {
  id: string;
  /** Official / display title (proper names stay in English) */
  title: string;
  status: ClubAdventureStatus;
  blurb: {
    es: string;
    en: string;
  };
};

/**
 * Static club adventures for the public homepage.
 * Edit here. Not a SaaS feature list.
 */
export const CLUB_ADVENTURES: ClubAdventure[] = [
  {
    id: 'heroes-of-the-borderlands',
    title: 'Heroes of the Borderlands',
    status: 'playing',
    blurb: {
      es: 'Un fuerte al límite del reino, el yermo alrededor y las Cuevas del Caos, donde mercaderes, soldados y aventureros se cruzan antes de entrar en lo desconocido.',
      en: 'A keep at the edge of the realm, the wilds beyond, and the Caves of Chaos, where merchants, soldiers, and adventurers cross paths before heading into the unknown.',
    },
  },
  {
    id: 'dragon-of-icespire-peak',
    title: 'Dragon of Icespire Peak',
    status: 'up_next',
    blurb: {
      es: 'Phandalin bajo la sombra de Cryovain, un dragón blanco que ha reclamado Icespire Peak. Pueblos, ruinas y la amenaza que baja de la montaña helada.',
      en: 'Phandalin under the shadow of Cryovain, a white dragon who has claimed Icespire Peak. Towns, ruins, and the threat that descends from the icy mountain.',
    },
  },
];
