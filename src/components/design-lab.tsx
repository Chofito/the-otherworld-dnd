'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LocaleSwitcher } from '@/components/locale-switcher';
import {
  DEFAULT_THEME_ID,
  DESIGN_THEMES,
  type DesignThemeId,
  getDesignTheme,
} from '@/config/design-themes';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/types';

const SWATCHES: Array<{
  key: keyof ReturnType<typeof getDesignTheme>['colors'];
  label: string;
}> = [
  { key: 'background', label: 'background' },
  { key: 'surface', label: 'surface' },
  { key: 'foreground', label: 'foreground' },
  { key: 'muted', label: 'muted' },
  { key: 'border', label: 'border' },
  { key: 'accent', label: 'accent' },
  { key: 'highlight', label: 'highlight' },
  { key: 'danger', label: 'danger' },
  { key: 'ok', label: 'ok' },
];

type Props = {
  locale: Locale;
  localeLabels: Dictionary['locale'];
  labels: Dictionary['design'];
};

export function DesignLab({ locale, localeLabels, labels }: Props) {
  const [themeId, setThemeId] = useState<DesignThemeId>(DEFAULT_THEME_ID);
  const theme = getDesignTheme(themeId);

  useEffect(() => {
    document.documentElement.dataset.theme = themeId;
    return () => {
      document.documentElement.dataset.theme = DEFAULT_THEME_ID;
    };
  }, [themeId]);

  return (
    <div className="design-lab">
      <aside className="design-lab__sidebar">
        <p className="home__eyebrow">{labels.eyebrow}</p>
        <h1>{labels.title}</h1>
        <p className="muted" style={{ fontSize: '0.9rem' }}>
          {labels.intro}
        </p>
        <LocaleSwitcher
          locale={locale}
          label={localeLabels.label}
          esLabel={localeLabels.es}
          enLabel={localeLabels.en}
        />
        {DESIGN_THEMES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              item.id === themeId
                ? 'design-lab__theme is-active'
                : 'design-lab__theme'
            }
            onClick={() => setThemeId(item.id)}
          >
            <strong>{item.label}</strong>
            <span>{item.pitch}</span>
          </button>
        ))}
        <Link
          href="/dashboard"
          className="btn-secondary"
          style={{ marginTop: '0.5rem' }}
        >
          {labels.backDashboard}
        </Link>
      </aside>

      <main className="design-lab__main">
        <header className="stack" style={{ gap: '0.4rem' }}>
          <p className="home__eyebrow">{theme.license}</p>
          <h2 className="page-title">{theme.label}</h2>
          <p className="muted">
            Display <strong>{theme.displayFont}</strong> · Body{' '}
            <strong>{theme.bodyFont}</strong>
          </p>
        </header>

        <section className="stack">
          <h3>{labels.palette}</h3>
          <div className="design-lab__swatches">
            {SWATCHES.map(({ key, label }) => (
              <figure key={key} className="design-lab__swatch">
                <div
                  className="design-lab__swatch-chip"
                  style={{ background: theme.colors[key] }}
                />
                <figcaption>
                  <div>{label}</div>
                  <code>{theme.colors[key]}</code>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="stack card">
          <h3>{labels.typography}</h3>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.4rem',
              margin: 0,
            }}
          >
            The Otherworld
          </p>
          <p style={{ fontSize: '1.15rem' }}>{labels.typeSample}</p>
          <p className="muted">{labels.cardSample}</p>
        </section>

        <section className="row">
          <button type="button" className="btn">
            {labels.primaryCta}
          </button>
          <button type="button" className="btn-secondary">
            {labels.secondary}
          </button>
          <button type="button" className="btn-danger">
            {labels.danger}
          </button>
          <span className="badge">open</span>
        </section>

        <section className="card stack">
          <h3>{labels.sampleField}</h3>
          <label className="field">
            <span>{labels.characterName}</span>
            <input defaultValue="Lyra Nightveil" readOnly />
          </label>
        </section>

        <section className="stack">
          <h3>{labels.futureArt}</h3>
          <div className="design-lab__art-slot">{labels.futureArtLabel}</div>
        </section>
      </main>
    </div>
  );
}
