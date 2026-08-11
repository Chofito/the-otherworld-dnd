import type { Metadata } from 'next';
import Link from 'next/link';
import { loginAction } from '@/app/actions';
import { ActionForm } from '@/components/action-form';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { getDictionary, getLocale } from '@/i18n/get-dictionary';
import { buildPublicMetadata } from '@/lib/site-metadata';

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return buildPublicMetadata({
    title: `${dict.meta.clubTitle} · ${dict.auth.title}`,
    description: dict.meta.summonDmOgDescription,
    path: '/summon-dm',
    noIndex: true,
  });
}

export default async function SummonDmPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <main className="gate">
      <header className="threshold-bar threshold-bar--overlay">
        <Link href="/" className="threshold-bar__brand">
          <span className="sigil" aria-hidden="true" />
          {dict.brand.name}
        </Link>
        <LocaleSwitcher
          locale={locale}
          label={dict.locale.label}
          esLabel={dict.locale.es}
          enLabel={dict.locale.en}
        />
      </header>

      <div className="gate__door door">
        <p className="eyebrow eyebrow--center">{dict.auth.eyebrow}</p>
        <h1 className="gate__title title-arc">{dict.auth.title}</h1>
        <p className="gate__sub">{dict.auth.subtitle}</p>
        <ActionForm action={loginAction} className="gate__form">
          <label className="field">
            <span>{dict.common.email}</span>
            <input type="email" name="email" required autoComplete="email" />
          </label>
          <label className="field">
            <span>{dict.common.password}</span>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              autoComplete="current-password"
            />
          </label>
          <button type="submit" className="btn btn--wide">
            {dict.auth.submit}
          </button>
        </ActionForm>
      </div>
      <div className="gate__glow" aria-hidden="true" />
    </main>
  );
}
