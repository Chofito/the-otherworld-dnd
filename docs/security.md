# Security

## Keys

| Variable | Where | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + server | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Client + server | Session / RLS |
| `SUPABASE_SECRET_KEY` | **Server only** | Public RPCs + optional Auth IP forward |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only (legacy) | Fallback if secret key unset |

Never prefix the elevated key with `NEXT_PUBLIC_`. `.env*` is gitignored; commit only `.env.example`.

## Public surface

- Invite/campaign RPCs are **not** callable with the publishable key.
- Default privileges for `anon` / `authenticated` on future objects created by `postgres` are revoked (see latest lockdown migrations). Grant explicitly when needed.
- Public pages omit emails; `/c` also omits contributions.
- Invite URLs are capability tokens — treat slugs as secrets shared only with intended players.

## Auth

- Email/password for DM only; **disable public signup** in the hosted Auth settings.
- Entry path: `/summon-dm`. Prefer not advertising it on the landing page.
- Optional: enable **IP Address Forwarding** under Auth → Rate Limits so login can send `sb-forwarded-for` (requires `sb_secret_...` key). See [Supabase rate limits](https://supabase.com/docs/guides/auth/rate-limits).

## App-level limits

In-memory rate limiting on public GETs / invite submit is **best-effort** (per instance). Fine for a friend-group; for multi-instance production consider a shared store later.

## Ops checklist

- [ ] Signup OFF in cloud Auth
- [ ] Secret key set in `.env.local` and Vercel (not public)
- [ ] Auth Site URL / redirect allowlist includes production domain
- [ ] No elevated key in client bundles or committed files
- [ ] After schema changes: confirm RPC grants still service-role-only
