import Link from 'next/link';
import { getDictionary } from '@/i18n/get-dictionary';
import { campaignStatusLabel } from '@/lib/campaign-status';
import { requireUser } from '@/lib/auth';

export default async function DashboardPage() {
  const { supabase, userId } = await requireUser();
  const dict = await getDictionary();
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, name, status, max_players, max_level, created_at')
    .eq('dm_id', userId)
    .order('created_at', { ascending: false });

  const campaignIds = (campaigns ?? []).map((campaign) => campaign.id);
  const seatCounts = new Map<string, number>();
  if (campaignIds.length) {
    const { data: characters } = await supabase
      .from('characters')
      .select('campaign_id')
      .in('campaign_id', campaignIds);
    for (const row of characters ?? []) {
      seatCounts.set(
        row.campaign_id,
        (seatCounts.get(row.campaign_id) ?? 0) + 1,
      );
    }
  }

  return (
    <main className="stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="stack" style={{ gap: '0.35rem' }}>
          <p className="home__eyebrow">{dict.dashboard.eyebrow}</p>
          <h1 className="page-title">{dict.dashboard.title}</h1>
        </div>
        <Link href="/dashboard/campaigns/new" className="btn">
          {dict.dashboard.newCampaign}
        </Link>
      </div>

      {!campaigns?.length ? (
        <div className="card stack">
          <p className="muted">{dict.dashboard.empty}</p>
          <Link href="/dashboard/campaigns/new" className="btn">
            {dict.dashboard.createFirst}
          </Link>
        </div>
      ) : (
        <div className="ledger">
          {campaigns.map((campaign) => (
            <Link
              key={campaign.id}
              href={`/dashboard/campaigns/${campaign.id}`}
              className="ledger__card"
            >
              <span className="badge">
                {campaignStatusLabel(dict, campaign.status)}
              </span>
              <span className="ledger__name">{campaign.name}</span>
              <dl className="ledger__meta">
                <div>
                  <dt>{dict.dashboard.players}</dt>
                  <dd>
                    {seatCounts.get(campaign.id) ?? 0}/{campaign.max_players}
                  </dd>
                </div>
                <div>
                  <dt>{dict.common.maxLevel}</dt>
                  <dd>{campaign.max_level}</dd>
                </div>
              </dl>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
