'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { ActionState } from '@/app/actions';
import { ActionForm } from '@/components/action-form';
import { Modal } from '@/components/modal';

export type CatalogItemRow = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
};

type Labels = {
  eyebrow: string;
  addNew: string;
  existing: string;
  name: string;
  description: string;
  sortOrder: string;
  activeHint: string;
  create: string;
  save: string;
  delete: string;
  empty: string;
  editItem: string;
  inactive: string;
  close: string;
  edit: string;
};

type Props = {
  title: string;
  description: string;
  labels: Labels;
  items: CatalogItemRow[];
  createAction: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  updateAction: (
    id: string,
    prev: ActionState,
    formData: FormData,
  ) => Promise<ActionState>;
  deleteAction: (id: string) => void | Promise<void>;
};

type ModalMode =
  | { kind: 'create' }
  | { kind: 'edit'; item: CatalogItemRow }
  | null;

function CatalogFields({
  labels,
  item,
}: {
  labels: Labels;
  item?: CatalogItemRow;
}) {
  return (
    <>
      <label className="field">
        <span>{labels.name}</span>
        <input
          name="name"
          required
          maxLength={80}
          defaultValue={item?.name ?? ''}
        />
      </label>
      <label className="field">
        <span>{labels.description}</span>
        <textarea
          name="description"
          rows={2}
          maxLength={2000}
          defaultValue={item?.description ?? ''}
        />
      </label>
      <label className="field">
        <span>{labels.sortOrder}</span>
        <input
          type="number"
          name="sort_order"
          min={0}
          max={9999}
          defaultValue={item?.sort_order ?? 0}
        />
      </label>
      <label className="row" style={{ gap: '0.5rem' }}>
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={item?.is_active ?? true}
        />
        <span>{labels.activeHint}</span>
      </label>
    </>
  );
}

export function CatalogManager({
  title,
  description,
  labels,
  items,
  createAction,
  updateAction,
  deleteAction,
}: Props) {
  const [modal, setModal] = useState<ModalMode>(null);
  const createFormId = 'catalog-create';
  const editFormId =
    modal?.kind === 'edit' ? `catalog-edit-${modal.item.id}` : 'catalog-edit';

  return (
    <main className="stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div>
          <p className="home__eyebrow">{labels.eyebrow}</p>
          <h1 className="page-title">{title}</h1>
          <p className="muted">{description}</p>
        </div>
        <button
          type="button"
          className="btn"
          onClick={() => setModal({ kind: 'create' })}
        >
          {labels.addNew}
        </button>
      </div>

      <section className="stack">
        <h2>{labels.existing}</h2>
        {!items.length ? (
          <p className="muted">{labels.empty}</p>
        ) : (
          <ul className="catalog-list">
            {items.map((item) => (
              <li key={item.id} className="catalog-card card">
                <div className="catalog-card__body">
                  <span className="catalog-card__name">{item.name}</span>
                  {item.description ? (
                    <span className="catalog-card__desc">{item.description}</span>
                  ) : null}
                  <span className="catalog-card__meta">
                    {item.is_active ? labels.activeHint : labels.inactive} · #
                    {item.sort_order}
                  </span>
                </div>
                <div className="catalog-card__actions">
                  <button
                    type="button"
                    className="btn-secondary btn-icon"
                    onClick={() => setModal({ kind: 'edit', item })}
                    aria-label={labels.edit}
                    title={labels.edit}
                  >
                    <Pencil aria-hidden="true" strokeWidth={2} />
                  </button>
                  <form action={deleteAction.bind(null, item.id)}>
                    <button
                      type="submit"
                      className="btn-danger btn-icon"
                      aria-label={labels.delete}
                      title={labels.delete}
                    >
                      <Trash2 aria-hidden="true" strokeWidth={2} />
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Modal
        open={modal?.kind === 'create'}
        title={labels.addNew}
        onClose={() => setModal(null)}
        closeLabel={labels.close}
        footer={
          <>
            <button type="submit" className="btn" form={createFormId}>
              {labels.create}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setModal(null)}
            >
              {labels.close}
            </button>
          </>
        }
      >
        <ActionForm
          id={createFormId}
          action={async (prev, formData) => {
            const result = await createAction(prev, formData);
            if (!result?.error) setModal(null);
            return result;
          }}
          className="stack"
        >
          <CatalogFields labels={labels} />
        </ActionForm>
      </Modal>

      <Modal
        open={modal?.kind === 'edit'}
        title={labels.editItem}
        onClose={() => setModal(null)}
        closeLabel={labels.close}
        footer={
          <>
            <button type="submit" className="btn" form={editFormId}>
              {labels.save}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setModal(null)}
            >
              {labels.close}
            </button>
          </>
        }
      >
        {modal?.kind === 'edit' ? (
          <ActionForm
            id={editFormId}
            key={modal.item.id}
            action={async (prev, formData) => {
              const result = await updateAction(modal.item.id, prev, formData);
              if (!result?.error) setModal(null);
              return result;
            }}
            className="stack"
          >
            <CatalogFields labels={labels} item={modal.item} />
          </ActionForm>
        ) : null}
      </Modal>
    </main>
  );
}
