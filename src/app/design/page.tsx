import { DesignLab } from '@/components/design-lab';
import { getDictionary, getLocale } from '@/i18n/get-dictionary';

export default async function DesignPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <DesignLab
      locale={locale}
      localeLabels={dict.locale}
      labels={dict.design}
    />
  );
}
