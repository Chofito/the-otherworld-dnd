import Link from 'next/link';
import { requireUser } from '@/lib/auth';

export default async function DashboardPage() {
  const { supabase, userId } = await requireUser();
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, name, status, max_players, max_level, created_at')
    .eq('dm_id', userId)
    .order('created_at', { ascending: false });

  return (
    <main className="stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1>Campaigns</h1>
        <Link href="/dashboard/campaigns/new" className="btn">
          New campaign
        </Link>
      </div>

      {!campaigns?.length ? (
        <p className="muted">No campaigns yet.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Players</th>
              <th>Max level</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.id}>
                <td>
                  <Link href={`/dashboard/campaigns/${campaign.id}`}>
                    {campaign.name}
                  </Link>
                </td>
                <td>{campaign.status}</td>
                <td>{campaign.max_players}</td>
                <td>{campaign.max_level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
