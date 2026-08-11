export const locales = ['es', 'en'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'es';

/** When false, UI stays on defaultLocale and the switcher is hidden. */
export const localeSwitcherEnabled = false;

export const localeCookieName = 'ow_locale';

export function isLocale(value: string | undefined | null): value is Locale {
  return value === 'es' || value === 'en';
}

export function resolveLocale(
  cookieValue: string | undefined,
  acceptLanguage: string | null,
): Locale {
  if (!localeSwitcherEnabled) return defaultLocale;

  if (isLocale(cookieValue)) return cookieValue;

  if (acceptLanguage) {
    const preferred = acceptLanguage
      .split(',')
      .map((part) => part.trim().split(';')[0]?.toLowerCase() ?? '')
      .find((tag) => tag.startsWith('es') || tag.startsWith('en'));
    if (preferred?.startsWith('es')) return 'es';
    if (preferred?.startsWith('en')) return 'en';
  }

  return defaultLocale;
}
