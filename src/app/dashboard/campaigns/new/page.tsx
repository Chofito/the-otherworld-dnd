import { createCampaignAction } from '@/app/actions';
import { ActionForm } from '@/components/action-form';
import { getDictionary } from '@/i18n/get-dictionary';

export default async function NewCampaignPage() {
  const dict = await getDictionary();

  return (
    <main className="stack" style={{ maxWidth: '36rem' }}>
      <p className="home__eyebrow">{dict.campaignNew.eyebrow}</p>
      <h1 className="page-title">{dict.campaignNew.title}</h1>
      <ActionForm action={createCampaignAction} className="stack card">
        <label className="field">
          <span>{dict.common.name}</span>
          <input name="name" required maxLength={120} />
        </label>
        <label className="field">
          <span>{dict.common.description}</span>
          <textarea name="description" required rows={5} maxLength={5000} />
        </label>
        <label className="field">
          <span>{dict.common.rules}</span>
          <textarea name="rules" rows={4} maxLength={10000} />
        </label>
        <label className="field">
          <span>{dict.campaignNew.maxPlayers}</span>
          <input
            type="number"
            name="max_players"
            min={1}
            defaultValue={4}
            required
          />
        </label>
        <label className="field">
          <span>{dict.common.maxLevel}</span>
          <input
            type="number"
            name="max_level"
            min={1}
            defaultValue={4}
            required
          />
        </label>
        <label className="field">
          <span>{dict.common.status}</span>
          <select name="status" defaultValue="open">
            <option value="open">{dict.campaignStatus.open}</option>
            <option value="ongoing">{dict.campaignStatus.ongoing}</option>
            <option value="completed">{dict.campaignStatus.completed}</option>
          </select>
        </label>
        <label className="row" style={{ gap: '0.5rem' }}>
          <input type="checkbox" name="allow_duplicate_races" defaultChecked />
          <span>{dict.campaignNew.allowDuplicateRaces}</span>
        </label>
        <label className="row" style={{ gap: '0.5rem' }}>
          <input
            type="checkbox"
            name="allow_duplicate_classes"
            defaultChecked
          />
          <span>{dict.campaignNew.allowDuplicateClasses}</span>
        </label>
        <button type="submit" className="btn">
          {dict.common.create}
        </button>
      </ActionForm>
    </main>
  );
}
