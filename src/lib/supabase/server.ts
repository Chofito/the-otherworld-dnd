import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';
import { requireEnv } from '@/lib/env';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component; proxy refreshes sessions.
          }
        },
      },
    },
  );
}

/**
 * Login client that forwards the browser IP to Supabase Auth rate limits.
 * Requires SUPABASE_SECRET_KEY (sb_secret_...) and Auth → Rate Limits →
 * IP Address Forwarding enabled. Falls back to the publishable cookie client.
 * Docs: https://supabase.com/docs/guides/auth/rate-limits#ip-address-forwarding
 */
export async function createLoginClient(clientIp: string | null) {
  const cookieStore = await cookies();
  const secret = process.env.SUPABASE_SECRET_KEY;
  const canForward =
    Boolean(clientIp) &&
    typeof secret === 'string' &&
    secret.startsWith('sb_secret_');

  return createServerClient<Database>(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    canForward ? secret! : requireEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component; proxy refreshes sessions.
          }
        },
      },
      ...(canForward
        ? {
            global: {
              headers: {
                'sb-forwarded-for': clientIp!,
              },
            },
          }
        : {}),
    },
  );
}
