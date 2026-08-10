import {
  createRaceAction,
  deleteRaceAction,
  updateRaceAction,
} from '@/app/actions';
import { CatalogManager } from '@/components/catalog-manager';
import { requireUser } from '@/lib/auth';

export default async function RacesPage() {
  const { supabase, userId } = await requireUser();
  const { data: races } = await supabase
    .from('races')
    .select('id, name, description, is_active, sort_order')
    .eq('dm_id', userId)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  return (
    <CatalogManager
      title="Races"
      description="Catalog shared across all your campaigns. Only active races appear in character forms."
      items={races ?? []}
      createAction={createRaceAction}
      updateAction={(id) => updateRaceAction.bind(null, id)}
      deleteAction={(id) => deleteRaceAction.bind(null, id)}
    />
  );
}
