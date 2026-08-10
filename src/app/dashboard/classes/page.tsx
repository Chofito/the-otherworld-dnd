import {
  createClassAction,
  deleteClassAction,
  updateClassAction,
} from '@/app/actions';
import { CatalogManager } from '@/components/catalog-manager';
import { requireUser } from '@/lib/auth';

export default async function ClassesPage() {
  const { supabase, userId } = await requireUser();
  const { data: classes } = await supabase
    .from('classes')
    .select('id, name, description, is_active, sort_order')
    .eq('dm_id', userId)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  return (
    <CatalogManager
      title="Classes"
      description="Catalog shared across all your campaigns. Only active classes appear in character forms."
      items={classes ?? []}
      createAction={createClassAction}
      updateAction={(id) => updateClassAction.bind(null, id)}
      deleteAction={(id) => deleteClassAction.bind(null, id)}
    />
  );
}
