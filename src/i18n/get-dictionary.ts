import es from '@/i18n/dictionaries/es';
import en from '@/i18n/dictionaries/en';
import {
  defaultLocale,
  isLocale,
  type Locale,
  localeCookieName,
  resolveLocale,
} from '@/i18n/config';
import type { Dictionary } from '@/i18n/types';
import { cookies, headers } from 'next/headers';

const dictionaries: Record<Locale, Dictionary> = {
  es,
  en,
};

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const headerStore = await headers();
  return resolveLocale(
    cookieStore.get(localeCookieName)?.value,
    headerStore.get('accept-language'),
  );
}

export async function getDictionary(locale?: Locale): Promise<Dictionary> {
  const resolved = locale ?? (await getLocale());
  return dictionaries[resolved] ?? dictionaries[defaultLocale];
}

export function localeFromCookieValue(value: string | undefined): Locale {
  return isLocale(value) ? value : defaultLocale;
}
