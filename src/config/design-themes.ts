/**
 * Visual themes. The DM picks one for the whole site (`site_settings.theme`);
 * the server stamps it on `<html data-theme>` and CSS does the rest.
 *
 * Tokens + skin for each theme live in `src/styles/themes/<id>.css`.
 * `swatches` mirror a few of those tokens for pickers and the /design lab;
 * `design-themes.test.ts` fails if they drift from the CSS.
 */
export const DESIGN_THEME_IDS = [
  'arcane',
  'keep',
  'wilderness',
  'caves',
] as const;

export type DesignThemeId = (typeof DESIGN_THEME_IDS)[number];

export const DEFAULT_THEME_ID: DesignThemeId = 'arcane';

export type DesignThemeSwatches = {
  background: string;
  surface: string;
  foreground: string;
  accent: string;
  highlight: string;
};

export type DesignTheme = {
  id: DesignThemeId;
  /** Heroes of the Borderlands booklet the theme evokes, if any. */
  booklet: string | null;
  displayFont: string;
  bodyFont: string;
  swatches: DesignThemeSwatches;
};

export const DESIGN_THEMES: DesignTheme[] = [
  {
    id: 'arcane',
    booklet: null,
    displayFont: 'Cormorant Garamond',
    bodyFont: 'Nunito Sans',
    swatches: {
      background: '#0c0a14',
      surface: '#161225',
      foreground: '#f1ecf9',
      accent: '#6d45d8',
      highlight: '#f0a93e',
    },
  },
  {
    id: 'keep',
    booklet: 'Keep on the Borderlands',
    displayFont: 'Cinzel',
    bodyFont: 'Alegreya Sans',
    swatches: {
      background: '#14110f',
      surface: '#1f1a17',
      foreground: '#f2e6d0',
      accent: '#a3262f',
      highlight: '#e0a943',
    },
  },
  {
    id: 'wilderness',
    booklet: 'Wilderness',
    displayFont: 'Cormorant Garamond',
    bodyFont: 'Alegreya Sans',
    swatches: {
      background: '#08100d',
      surface: '#0f1a15',
      foreground: '#e6efe4',
      accent: '#7cb784',
      highlight: '#e8cf6a',
    },
  },
  {
    id: 'caves',
    booklet: 'Caves of Chaos',
    displayFont: 'Grenze Gotisch',
    bodyFont: 'Nunito Sans',
    swatches: {
      background: '#0e0c0b',
      surface: '#191614',
      foreground: '#ece4d6',
      accent: '#d8692a',
      highlight: '#d9a23e',
    },
  },
];

export function isDesignThemeId(value: unknown): value is DesignThemeId {
  return (
    typeof value === 'string' &&
    (DESIGN_THEME_IDS as readonly string[]).includes(value)
  );
}

export function getDesignTheme(id: DesignThemeId): DesignTheme {
  return DESIGN_THEMES.find((t) => t.id === id) ?? DESIGN_THEMES[0];
}
