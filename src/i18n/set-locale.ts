'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import {
  isLocale,
  localeSwitcherEnabled,
  type Locale,
  localeCookieName,
} from '@/i18n/config';

export async function setLocaleAction(locale: Locale) {
  if (!localeSwitcherEnabled || !isLocale(locale)) return;

  const cookieStore = await cookies();
  cookieStore.set(localeCookieName, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });

  revalidatePath('/', 'layout');
}
