'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { localeSwitcherEnabled, type Locale } from '@/i18n/config';
import { setLocaleAction } from '@/i18n/set-locale';

type Props = {
  locale: Locale;
  label: string;
  esLabel: string;
  enLabel: string;
  className?: string;
};

export function LocaleSwitcher({
  locale,
  label,
  esLabel,
  enLabel,
  className,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (!localeSwitcherEnabled) return null;

  function choose(next: Locale) {
    if (next === locale || pending) return;
    startTransition(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  }

  return (
    <fieldset className={className ?? 'locale-switcher'} aria-label={label}>
      <legend>{label}</legend>
      <button
        type="button"
        className={
          locale === 'es'
            ? 'locale-switcher__btn is-active'
            : 'locale-switcher__btn'
        }
        aria-pressed={locale === 'es'}
        disabled={pending}
        onClick={() => choose('es')}
      >
        {esLabel}
      </button>
      <button
        type="button"
        className={
          locale === 'en'
            ? 'locale-switcher__btn is-active'
            : 'locale-switcher__btn'
        }
        aria-pressed={locale === 'en'}
        disabled={pending}
        onClick={() => choose('en')}
      >
        {enLabel}
      </button>
    </fieldset>
  );
}
