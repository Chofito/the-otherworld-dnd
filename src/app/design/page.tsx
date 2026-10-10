import { DesignLab } from '@/components/design-lab';
import { getDictionary, getLocale } from '@/i18n/get-dictionary';
import { getSiteThemeId } from '@/lib/site-theme';

export default async function DesignPage() {
  const [dict, locale, siteThemeId] = await Promise.all([
    getDictionary(),
    getLocale(),
    getSiteThemeId(),
  ]);

  return (
    <DesignLab
      locale={locale}
      localeLabels={dict.locale}
      labels={dict.design}
      themeLabels={dict.theme}
      siteThemeId={siteThemeId}
    />
  );
}
