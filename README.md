# The Otherworld

Functional v1: DM dashboard + invite permalinks for character signup.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind 4
- Supabase Auth (email/password) + Postgres + RLS
- Zod validation, nanoid invite slugs

## Setup

1. Copy `.env.example` → `.env.local` and fill Supabase URL, publishable key, and **`SUPABASE_SECRET_KEY`** (`sb_secret_...` from Settings → API Keys). Server-only; never expose to the browser. Legacy `SUPABASE_SERVICE_ROLE_KEY` still works as fallback.
2. Create your DM user in Supabase Dashboard → Authentication → Users (email + password). If a bootstrap DM was seeded during setup, rotate its password immediately in the Dashboard.
3. Disable public signups in Auth settings (Allow new users to sign up = OFF).
4. Profile row is created automatically by `handle_new_user`.
5. Put avatar files in `public/avatars/` and register them in `src/config/avatars.ts`.

```bash
bun install
bun run dev
```

## Routes

| Path | Access |
|------|--------|
| `/` | Landing (no auth links) |
| `/summon-dm` | DM access only (obscured entry) |
| `/dashboard` | Campaigns |
| `/dashboard/account` | DM profile |
| `/dashboard/races` | Race catalog |
| `/dashboard/classes` | Class catalog |
| `/dashboard/campaigns/new` | Create campaign |
| `/dashboard/campaigns/[id]` | Manage campaign / invites / characters |
| `/i/[slug]` | Invite / permalink (server-side RPC only) |
| `/c/[slug]` | Public campaign roster (no emails / no contributions) |

## Deploy

Host on Vercel. Set the same env vars. Point Supabase Auth redirect URLs to your Vercel domain.
