# Architecture

## App layout

```
src/
  app/                 # App Router pages + server actions
    actions.ts         # Server actions (DM + invite submit)
    summon-dm/         # DM sign-in
    dashboard/         # Authenticated DM UI
    i/[slug]/         # Invite / permalink (service client)
    c/[slug]/         # Public campaign (service client)
  components/          # UI pieces (forms, cards, catalog)
  config/avatars.ts    # Allowed avatar ids + public paths
  lib/
    supabase/
      server.ts        # Cookie session client (publishable key)
      service.ts       # Elevated client (secret key) — server only
      proxy.ts         # Session refresh helpers
    validations.ts     # Zod schemas
    rate-limit.ts      # Best-effort in-memory limiter
    request-ip.ts      # x-forwarded-for / x-real-ip
  proxy.ts             # Next proxy: auth gate + /login redirect
supabase/migrations/   # Source of truth for schema + RPCs
```

## Supabase clients

| Client | Key | Use |
|--------|-----|-----|
| `createClient()` | Publishable | DM session, RLS-backed dashboard CRUD |
| `createLoginClient(ip)` | Secret (`sb_secret_…`) when forwarding IP | Login + `sb-forwarded-for` (see security docs) |
| `createServiceClient()` | Secret / legacy service role | Public RPCs only |

Never import `service.ts` into client components.

## Public data path

1. Browser hits `/i/...` or `/c/...` (or invite submit action).
2. Next server calls `createServiceClient().rpc(...)`.
3. SECURITY DEFINER RPC runs with locked grants (`EXECUTE` for `service_role` only).
4. JSON payload is shaped in SQL (emails stripped on public fetch).

## Domain tables (sketch)

- `profiles` — DM profile (`fictional_name`, `bio`, …)
- `campaigns` — owned by DM; `public_slug`, rules, seats, flags
- `invites` — slug, status, expiry, campaign FK
- `characters` — invite/campaign bound; race/class FKs; email + contribution
- `races` / `classes` — per-DM catalog

RLS: owner-scoped for authenticated DM. Anon has no useful table DML after lockdown migrations.

## Types

`src/lib/database.types.ts` should stay aligned with the remote schema (regenerate when migrations change).
