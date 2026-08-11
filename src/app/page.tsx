import type { Metadata } from 'next';
import { ChevronDown } from 'lucide-react';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { CLUB_ADVENTURES } from '@/config/club-adventures';
import { getDictionary, getLocale } from '@/i18n/get-dictionary';
import { buildPublicMetadata } from '@/lib/site-metadata';

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return buildPublicMetadata({
    title: dict.meta.homeOgTitle,
    description: dict.meta.description,
    path: '/',
  });
}

export default async function HomePage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  const statusLabel = {
    playing: dict.home.statusPlaying,
    up_next: dict.home.statusUpNext,
    finished: dict.home.statusFinished,
  } as const;

  return (
    <main className="home">
      <header className="threshold-bar threshold-bar--overlay">
        <span className="threshold-bar__brand">
          <span className="sigil" aria-hidden="true" />
          {dict.brand.name}
        </span>
        <LocaleSwitcher
          locale={locale}
          label={dict.locale.label}
          esLabel={dict.locale.es}
          enLabel={dict.locale.en}
        />
      </header>

      <section className="hero">
        <div className="hero__text">
          <p className="eyebrow hero__eyebrow">{dict.home.eyebrow}</p>
          <h1 className="hero__brand title-arc">{dict.home.brand}</h1>
          <p className="hero__lede">{dict.home.lede}</p>
          <a className="hero__cue" href="#club">
            <span>{dict.home.scrollCue}</span>
            <ChevronDown
              className="hero__cue-glyph"
              aria-hidden="true"
              strokeWidth={2}
            />
          </a>
        </div>
        <div className="hero__doorframe" aria-hidden="true">
          <div className="hero__door door">
            <span className="sigil" />
          </div>
          <span className="hero__door-glow" />
        </div>
      </section>

      <div className="chronicle" id="club">
        <section className="chapter" aria-labelledby="home-welcome">
          <span className="chapter__numeral" aria-hidden="true">
            I
          </span>
          <div className="chapter__body">
            <h2 id="home-welcome">{dict.home.welcomeTitle}</h2>
            <p className="chapter__text">{dict.home.welcomeBody}</p>
          </div>
        </section>

        <section className="chapter" aria-labelledby="home-adventures">
          <span className="chapter__numeral" aria-hidden="true">
            II
          </span>
          <div className="chapter__body">
            <h2 id="home-adventures">{dict.home.adventuresTitle}</h2>
            <p className="chapter__text">{dict.home.adventuresBody}</p>
            <ul className="adventure-grid">
              {CLUB_ADVENTURES.map((adventure) => (
                <li key={adventure.id} className="adventure-card">
                  <p className="adventure-card__status">
                    {statusLabel[adventure.status]}
                  </p>
                  <h3 className="adventure-card__title">{adventure.title}</h3>
                  <p className="adventure-card__blurb">
                    {adventure.blurb[locale]}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="chapter" aria-labelledby="home-friends">
          <span className="chapter__numeral" aria-hidden="true">
            III
          </span>
          <div className="chapter__body">
            <h2 id="home-friends">{dict.home.friendsTitle}</h2>
            <p className="chapter__text">{dict.home.friendsBody}</p>
            <p className="chapter__note">{dict.home.friendsNote}</p>
          </div>
        </section>

        <section className="chapter" aria-labelledby="home-table">
          <span className="chapter__numeral" aria-hidden="true">
            IV
          </span>
          <div className="chapter__body">
            <h2 id="home-table">{dict.home.tableTitle}</h2>
            <dl className="inscriptions">
              <div>
                <dt>{dict.home.tableWhenLabel}</dt>
                <dd>{dict.home.tableWhenValue}</dd>
              </div>
              <div>
                <dt>{dict.home.tableWhereLabel}</dt>
                <dd>{dict.home.tableWhereValue}</dd>
              </div>
              <div>
                <dt>{dict.home.tableVibeLabel}</dt>
                <dd>{dict.home.tableVibeValue}</dd>
              </div>
            </dl>
          </div>
        </section>
      </div>

      <footer className="home__footer">
        <span className="ornament" aria-hidden="true">
          <span className="sigil" />
        </span>
        <p>{dict.home.footer}</p>
      </footer>
    </main>
  );
}
