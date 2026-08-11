import Link from 'next/link';
import { logoutAction } from '@/app/actions';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { getDictionary, getLocale } from '@/i18n/get-dictionary';
import { requireUser } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <div className="container">
      <nav className="nav">
        <strong>
          <Link href="/dashboard" style={{ color: 'inherit' }}>
            {dict.brand.name}
          </Link>
        </strong>
        <Link href="/dashboard">{dict.nav.campaigns}</Link>
        <Link href="/dashboard/races">{dict.nav.races}</Link>
        <Link href="/dashboard/classes">{dict.nav.classes}</Link>
        <Link href="/dashboard/account">{dict.nav.account}</Link>
        <Link href="/design">{dict.common.design}</Link>
        <LocaleSwitcher
          locale={locale}
          label={dict.locale.label}
          esLabel={dict.locale.es}
          enLabel={dict.locale.en}
        />
        <form action={logoutAction} style={{ marginLeft: 'auto' }}>
          <button type="submit" className="btn-secondary">
            {dict.common.logOut}
          </button>
        </form>
      </nav>
      {children}
    </div>
  );
}
