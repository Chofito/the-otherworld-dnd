import Link from 'next/link';
import { logoutAction } from '@/app/actions';
import { requireUser } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();

  return (
    <div className="container">
      <nav className="nav">
        <strong>The Otherworld</strong>
        <Link href="/dashboard">Campaigns</Link>
        <Link href="/dashboard/races">Races</Link>
        <Link href="/dashboard/classes">Classes</Link>
        <Link href="/dashboard/account">Account</Link>
        <form action={logoutAction}>
          <button type="submit" className="btn-secondary">
            Log out
          </button>
        </form>
      </nav>
      {children}
    </div>
  );
}
