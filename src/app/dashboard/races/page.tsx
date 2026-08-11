import {
  createRaceAction,
  deleteRaceAction,
  updateRaceAction,
} from '@/app/actions';
import { CatalogManager } from '@/components/catalog-manager';
import { getDictionary } from '@/i18n/get-dictionary';
import { requireUser } from '@/lib/auth';

export default async function RacesPage() {
  const { supabase, userId } = await requireUser();
  const dict = await getDictionary();
  const { data: races } = await supabase
    .from('races')
    .select('id, name, description, is_active, sort_order')
    .eq('dm_id', userId)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  return (
    <CatalogManager
      title={dict.catalog.racesTitle}
      description={dict.catalog.racesDescription}
      labels={{
        eyebrow: dict.catalog.eyebrow,
        addNew: dict.catalog.addNew,
        existing: dict.catalog.existing,
        name: dict.common.name,
        description: dict.common.description,
        sortOrder: dict.common.sortOrder,
        activeHint: dict.catalog.activeHint,
        create: dict.common.create,
        save: dict.common.save,
        delete: dict.common.delete,
        empty: dict.catalog.empty,
        editItem: dict.catalog.editItem,
        inactive: dict.catalog.inactive,
        close: dict.common.close,
        edit: dict.common.edit,
      }}
      items={races ?? []}
      createAction={createRaceAction}
      updateAction={updateRaceAction}
      deleteAction={deleteRaceAction}
    />
  );
}
