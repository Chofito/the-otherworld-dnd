import { ThemePicker } from '@/components/theme-picker';
import { getDictionary } from '@/i18n/get-dictionary';
import { requireUser } from '@/lib/auth';
import { getSiteThemeId } from '@/lib/site-theme';

export default async function ThemePage() {
  await requireUser();
  const [dict, current] = await Promise.all([
    getDictionary(),
    getSiteThemeId(),
  ]);

  return (
    <main className="stack">
      <div className="stack" style={{ gap: '0.35rem' }}>
        <p className="home__eyebrow">{dict.theme.eyebrow}</p>
        <h1 className="page-title">{dict.theme.title}</h1>
      </div>
      <p className="muted">{dict.theme.blurb}</p>
      <ThemePicker current={current} labels={dict.theme} />
    </main>
  );
}
