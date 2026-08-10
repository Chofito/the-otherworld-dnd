import 'server-only';

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import { requireEnv } from '@/lib/env';

function getElevatedKey(): string {
  // Prefer modern secret keys (sb_secret_...). Legacy service_role JWT still works.
  // Docs: https://supabase.com/docs/guides/api/api-keys
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (secret) return secret;

  const legacy = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (legacy) return legacy;

  throw new Error(
    'Missing elevated Supabase key. Set SUPABASE_SECRET_KEY (preferred, sb_secret_...) or SUPABASE_SERVICE_ROLE_KEY (legacy). Never expose these to the browser.',
  );
}

/**
 * Elevated server-only client for SECURITY DEFINER RPCs that must not be
 * callable with the publishable key.
 *
 * Uses the Postgres `service_role` (BYPASSRLS). Safe only on the server.
 * Prefer SUPABASE_SECRET_KEY (sb_secret_...) over legacy service_role JWT.
 * Never import into client components.
 */
export function createServiceClient() {
  return createClient<Database>(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getElevatedKey(),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}
