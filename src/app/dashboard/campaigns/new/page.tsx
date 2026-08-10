import { ActionForm } from '@/components/action-form';
import { createCampaignAction } from '@/app/actions';

export default function NewCampaignPage() {
  return (
    <main className="stack" style={{ maxWidth: '36rem' }}>
      <h1>New campaign</h1>
      <ActionForm action={createCampaignAction} className="stack card">
        <label className="field">
          <span>Name</span>
          <input name="name" required maxLength={120} />
        </label>
        <label className="field">
          <span>Description</span>
          <textarea name="description" required rows={5} maxLength={5000} />
        </label>
        <label className="field">
          <span>Rules</span>
          <textarea
            name="rules"
            rows={4}
            maxLength={10000}
            placeholder="House rules, session zero notes, etc."
          />
        </label>
        <label className="field">
          <span>Max players</span>
          <input
            type="number"
            name="max_players"
            min={1}
            defaultValue={4}
            required
          />
        </label>
        <label className="field">
          <span>Max level</span>
          <input
            type="number"
            name="max_level"
            min={1}
            defaultValue={4}
            required
          />
        </label>
        <label className="field">
          <span>Status</span>
          <select name="status" defaultValue="open">
            <option value="open">open</option>
            <option value="ongoing">ongoing</option>
            <option value="completed">completed</option>
          </select>
        </label>
        <label className="row" style={{ gap: '0.5rem' }}>
          <input type="checkbox" name="allow_duplicate_races" defaultChecked />
          <span>Allow duplicated races</span>
        </label>
        <label className="row" style={{ gap: '0.5rem' }}>
          <input type="checkbox" name="allow_duplicate_classes" defaultChecked />
          <span>Allow duplicated classes</span>
        </label>
        <button type="submit" className="btn">
          Create
        </button>
      </ActionForm>
    </main>
  );
}
