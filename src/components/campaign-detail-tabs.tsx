'use client';

import { useState, type ReactNode } from 'react';

type TabId = 'party' | 'invites' | 'settings';

type Props = {
  labels: {
    party: string;
    invites: string;
    settings: string;
  };
  party: ReactNode;
  invites: ReactNode;
  settings: ReactNode;
};

export function CampaignDetailTabs({
  labels,
  party,
  invites,
  settings,
}: Props) {
  const [tab, setTab] = useState<TabId>('party');

  const items: { id: TabId; label: string; panel: ReactNode }[] = [
    { id: 'party', label: labels.party, panel: party },
    { id: 'invites', label: labels.invites, panel: invites },
    { id: 'settings', label: labels.settings, panel: settings },
  ];

  return (
    <div className="stack">
      <nav className="waymarks" aria-label={labels.settings}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              tab === item.id ? 'waymarks__item is-active' : 'waymarks__item'
            }
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      {items.map((item) =>
        tab === item.id ? (
          <div key={item.id} className="stack">
            {item.panel}
          </div>
        ) : null,
      )}
    </div>
  );
}
