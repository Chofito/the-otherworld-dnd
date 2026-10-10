'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { ThemeEmblem } from '@/components/theme-emblem';
import {
  DESIGN_THEMES,
  type DesignThemeId,
  getDesignTheme,
} from '@/config/design-themes';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/types';

// Read live from the CSS, so the lab always shows what the theme file says.
const SWATCH_TOKENS = [
  'background',
  'surface',
  'surface-elevated',
  'foreground',
  'muted',
  'border',
  'accent',
  'accent-text',
  'highlight',
  'danger',
  'ok',
] as const;

const KNOBS = ['mist', 'stars', 'grain', 'glow'] as const;
type Knob = (typeof KNOBS)[number];
type KnobValues = Record<Knob, number>;

type Props = {
  locale: Locale;
  localeLabels: Dictionary['locale'];
  labels: Dictionary['design'];
  themeLabels: Dictionary['theme'];
  siteThemeId: DesignThemeId;
};

function readKnobs(): KnobValues {
  const style = getComputedStyle(document.documentElement);
  return Object.fromEntries(
    KNOBS.map((knob) => [
      knob,
      Number.parseFloat(style.getPropertyValue(`--${knob}`)) || 0,
    ]),
  ) as KnobValues;
}

function clearKnobs() {
  for (const knob of KNOBS) {
    document.documentElement.style.removeProperty(`--${knob}`);
  }
}

export function DesignLab({
  locale,
  localeLabels,
  labels,
  themeLabels,
  siteThemeId,
}: Props) {
  const [themeId, setThemeId] = useState<DesignThemeId>(siteThemeId);
  const [swatches, setSwatches] = useState<Record<string, string>>({});
  const [knobs, setKnobs] = useState<KnobValues | null>(null);
  const [defaults, setDefaults] = useState<KnobValues | null>(null);
  const [copied, setCopied] = useState(false);
  const theme = getDesignTheme(themeId);

  // Switching theme drops slider overrides and re-reads the theme's tokens.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = themeId;
    clearKnobs();
    const style = getComputedStyle(root);
    setSwatches(
      Object.fromEntries(
        SWATCH_TOKENS.map((token) => [
          token,
          style.getPropertyValue(`--${token}`).trim(),
        ]),
      ),
    );
    const values = readKnobs();
    setKnobs(values);
    setDefaults(values);
    setCopied(false);
  }, [themeId]);

  // Leaving the lab restores what the whole site is wearing.
  useEffect(
    () => () => {
      clearKnobs();
      document.documentElement.dataset.theme = siteThemeId;
    },
    [siteThemeId],
  );

  const setKnob = useCallback((knob: Knob, value: number) => {
    document.documentElement.style.setProperty(`--${knob}`, String(value));
    setKnobs((prev) => (prev ? { ...prev, [knob]: value } : prev));
    setCopied(false);
  }, []);

  function resetKnobs() {
    clearKnobs();
    setKnobs(readKnobs());
    setCopied(false);
  }

  async function copyTokens() {
    if (!knobs) return;
    const body = KNOBS.map((knob) => `  --${knob}: ${knobs[knob]};`).join('\n');
    await navigator.clipboard.writeText(
      `[data-theme="${themeId}"] {\n${body}\n}`,
    );
    setCopied(true);
  }

  const knobLabels: Record<Knob, string> = {
    mist: labels.mist,
    stars: labels.stars,
    grain: labels.grain,
    glow: labels.glow,
  };

  return (
    <div className="design-lab">
      <aside className="design-lab__sidebar">
        <p className="home__eyebrow">{labels.eyebrow}</p>
        <h1>{labels.title}</h1>
        <p className="muted" style={{ fontSize: 'var(--step-0)' }}>
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
            aria-pressed={item.id === themeId}
            className={
              item.id === themeId
                ? 'design-lab__theme is-active'
                : 'design-lab__theme'
            }
            onClick={() => setThemeId(item.id)}
          >
            <strong>{themeLabels.names[item.id].name}</strong>
            <span>{themeLabels.names[item.id].pitch}</span>
            {item.id === siteThemeId ? (
              <em className="design-lab__site">{labels.siteTheme}</em>
            ) : null}
          </button>
        ))}

        {knobs && defaults ? (
          <section className="design-lab__knobs" aria-label={labels.atmosphere}>
            <h2 className="design-lab__knobs-title">{labels.atmosphere}</h2>
            {KNOBS.map((knob) => (
              <label key={knob} className="design-lab__knob">
                <span>{knobLabels[knob]}</span>
                <input
                  type="range"
                  min={0}
                  max={knob === 'glow' ? 2 : 1}
                  step={0.05}
                  value={knobs[knob]}
                  onChange={(event) =>
                    setKnob(knob, Number(event.currentTarget.value))
                  }
                />
                <output>{knobs[knob].toFixed(2)}</output>
              </label>
            ))}
            <div className="row" style={{ gap: '0.5rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={resetKnobs}
              >
                {labels.reset}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={copyTokens}
              >
                {copied ? labels.copied : labels.copyTokens}
              </button>
            </div>
          </section>
        ) : null}

        <Link
          href="/dashboard/theme"
          className="btn-secondary"
          style={{ marginTop: '0.5rem' }}
        >
          {labels.backDashboard}
        </Link>
      </aside>

      <main className="design-lab__main">
        <header className="stack" style={{ gap: '0.4rem' }}>
          <p className="home__eyebrow">
            {labels.previewing}
            {theme.booklet ? ` · ${theme.booklet}` : ''}
          </p>
          <h2 className="page-title">{themeLabels.names[themeId].name}</h2>
          <p className="muted">
            Display <strong>{theme.displayFont}</strong> · Body{' '}
            <strong>{theme.bodyFont}</strong>
          </p>
        </header>

        <section className="design-lab__stage">
          <div className="design-lab__door door door--emblem">
            <span className="sigil" />
            <ThemeEmblem idPrefix="lab" />
          </div>
          <div className="stack">
            <p className="eyebrow">{labels.typography}</p>
            <p className="design-lab__brand title-arc">The Otherworld</p>
            <p style={{ fontSize: 'var(--step-1)' }}>{labels.typeSample}</p>
            <p className="muted">{labels.cardSample}</p>
            <span className="ornament">
              <span className="sigil" />
            </span>
          </div>
        </section>

        <section className="stack">
          <h3>{labels.palette}</h3>
          <div className="design-lab__swatches">
            {SWATCH_TOKENS.map((token) => (
              <figure key={token} className="design-lab__swatch">
                <div
                  className="design-lab__swatch-chip"
                  style={{ background: `var(--${token})` }}
                />
                <figcaption>
                  <div>{token}</div>
                  <code>{swatches[token]}</code>
                </figcaption>
              </figure>
            ))}
          </div>
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
          <span className="badge badge--pending">pending</span>
          <span className="badge badge--completed">completed</span>
          <span className="badge badge--revoked">revoked</span>
        </section>

        <section className="design-lab__cards">
          <article className="adventure-card">
            <p className="adventure-card__status">En mesa</p>
            <h3 className="adventure-card__title">Heroes of the Borderlands</h3>
            <p className="adventure-card__blurb">{labels.cardSample}</p>
          </article>
          <div className="card stack">
            <h2>{labels.sampleField}</h2>
            <label className="field">
              <span>{labels.characterName}</span>
              <input defaultValue="Lyra Nightveil" />
            </label>
          </div>
        </section>

        <section className="stack">
          <h3>{labels.futureArt}</h3>
          <div className="design-lab__art-slot">{labels.futureArtLabel}</div>
        </section>
      </main>
    </div>
  );
}
