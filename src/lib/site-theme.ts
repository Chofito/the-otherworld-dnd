import 'server-only';

import { unstable_cache } from 'next/cache';
import {
  DEFAULT_THEME_ID,
  type DesignThemeId,
  isDesignThemeId,
} from '@/config/design-themes';
import { createServiceClient } from '@/lib/supabase/service';

export const SITE_THEME_TAG = 'site-theme';

// Errors throw so they are never cached; a missing row caches as null.
const readSiteTheme = unstable_cache(
  async (): Promise<string | null> => {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('theme')
      .eq('id', true)
      .maybeSingle();
    if (error) throw error;
    return data?.theme ?? null;
  },
  ['site-theme'],
  { tags: [SITE_THEME_TAG], revalidate: 3600 },
);

/**
 * Theme every visitor sees. Falls back to the default when the settings row,
 * the table or the elevated key is missing, so the shell never crashes on it.
 */
export async function getSiteThemeId(): Promise<DesignThemeId> {
  try {
    const theme = await readSiteTheme();
    return isDesignThemeId(theme) ? theme : DEFAULT_THEME_ID;
  } catch {
    return DEFAULT_THEME_ID;
  }
}
