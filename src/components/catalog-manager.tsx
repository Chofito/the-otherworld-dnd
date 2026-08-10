import { ActionForm } from '@/components/action-form';
import type { ActionState } from '@/app/actions';

export type CatalogItemRow = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
};

type Props = {
  title: string;
  description: string;
  items: CatalogItemRow[];
  createAction: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  updateAction: (
    id: string,
  ) => (prev: ActionState, formData: FormData) => Promise<ActionState>;
  deleteAction: (id: string) => () => void | Promise<void>;
};

export function CatalogManager({
  title,
  description,
  items,
  createAction,
  updateAction,
  deleteAction,
}: Props) {
  return (
    <main className="stack">
      <div>
        <h1>{title}</h1>
        <p className="muted">{description}</p>
      </div>

      <section className="stack card">
        <h2>Add new</h2>
        <ActionForm action={createAction} className="stack">
          <label className="field">
            <span>Name</span>
            <input name="name" required maxLength={80} />
          </label>
          <label className="field">
            <span>Description</span>
            <textarea name="description" rows={2} maxLength={2000} />
          </label>
          <label className="field">
            <span>Sort order</span>
            <input
              type="number"
              name="sort_order"
              min={0}
              max={9999}
              defaultValue={0}
            />
          </label>
          <label className="row" style={{ gap: '0.5rem' }}>
            <input type="checkbox" name="is_active" defaultChecked />
            <span>Active (shown in character forms)</span>
          </label>
          <button type="submit" className="btn">
            Create
          </button>
        </ActionForm>
      </section>

      <section className="stack card">
        <h2>Your catalog</h2>
        {!items.length ? (
          <p className="muted">Nothing here yet.</p>
        ) : (
          <div className="stack">
            {items.map((item) => (
              <div key={item.id} className="stack" style={{ gap: '0.75rem' }}>
                <ActionForm action={updateAction(item.id)} className="stack">
                  <label className="field">
                    <span>Name</span>
                    <input
                      name="name"
                      required
                      maxLength={80}
                      defaultValue={item.name}
                    />
                  </label>
                  <label className="field">
                    <span>Description</span>
                    <textarea
                      name="description"
                      rows={2}
                      maxLength={2000}
                      defaultValue={item.description ?? ''}
                    />
                  </label>
                  <label className="field">
                    <span>Sort order</span>
                    <input
                      type="number"
                      name="sort_order"
                      min={0}
                      max={9999}
                      defaultValue={item.sort_order}
                    />
                  </label>
                  <label className="row" style={{ gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      name="is_active"
                      defaultChecked={item.is_active}
                    />
                    <span>Active</span>
                  </label>
                  <div className="row">
                    <button type="submit" className="btn">
                      Save
                    </button>
                  </div>
                </ActionForm>
                <form action={deleteAction(item.id)}>
                  <button type="submit" className="btn-danger">
                    Delete
                  </button>
                </form>
                <hr />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
