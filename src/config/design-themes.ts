export type DesignThemeId = 'crimson' | 'arcane' | 'azure';

export type DesignTheme = {
  id: DesignThemeId;
  label: string;
  pitch: string;
  displayFont: string;
  bodyFont: string;
  license: string;
  colors: {
    background: string;
    surface: string;
    foreground: string;
    muted: string;
    border: string;
    accent: string;
    accentFg: string;
    highlight: string;
    danger: string;
    ok: string;
  };
};

export const DEFAULT_THEME_ID: DesignThemeId = 'arcane';

export const DESIGN_THEMES: DesignTheme[] = [
  {
    id: 'crimson',
    label: 'Crimson Banner',
    pitch: 'Menú tipo D&D Beyond: ink navy, CTA rojo, oro.',
    displayFont: 'Cinzel',
    bodyFont: 'Source Sans 3',
    license: 'SIL OFL (Google Fonts)',
    colors: {
      background: '#0B0E14',
      surface: '#151A24',
      foreground: '#F4F1EA',
      muted: '#9AA3B5',
      border: '#2A3344',
      accent: '#C41E3A',
      accentFg: '#F4F1EA',
      highlight: '#E0B84A',
      danger: '#FF6B5A',
      ok: '#3DDC97',
    },
  },
  {
    id: 'arcane',
    label: 'Arcane Violet',
    pitch: 'Spellbook / menú arcano: violeta + ámbar.',
    displayFont: 'Cormorant Garamond',
    bodyFont: 'Nunito Sans',
    license: 'SIL OFL (Google Fonts)',
    colors: {
      background: '#100E18',
      surface: '#1A1626',
      foreground: '#F0EBF8',
      muted: '#A69BB8',
      border: '#322A45',
      accent: '#8B5CF6',
      accentFg: '#F0EBF8',
      highlight: '#F59E0B',
      danger: '#F07178',
      ok: '#34D399',
    },
  },
  {
    id: 'azure',
    label: 'Azure Ember',
    pitch: 'Menú de mapa: azul profundo + naranja.',
    displayFont: 'Marcellus',
    bodyFont: 'IBM Plex Sans',
    license: 'SIL OFL (Google Fonts)',
    colors: {
      background: '#070B12',
      surface: '#101826',
      foreground: '#E8EEF7',
      muted: '#8B9BB0',
      border: '#1E2A3C',
      accent: '#3B82F6',
      accentFg: '#E8EEF7',
      highlight: '#FB923C',
      danger: '#F87171',
      ok: '#4ADE80',
    },
  },
];

export function getDesignTheme(id: DesignThemeId): DesignTheme {
  return DESIGN_THEMES.find((t) => t.id === id) ?? DESIGN_THEMES[1];
}
