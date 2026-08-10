import { headers } from 'next/headers';

/**
 * Client IP as seen by the edge (Vercel sets x-forwarded-for / x-real-ip).
 * First x-forwarded-for hop is the original client when the platform appends proxies.
 */
export async function getClientIp(): Promise<string | null> {
  const h = await headers();
  const forwarded = h.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return h.get('x-real-ip')?.trim() || null;
}
