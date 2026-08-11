# Local setup

## Prerequisites

- [Bun](https://bun.sh) (see `packageManager` in `package.json`)
- A Supabase project (cloud is fine; local `supabase start` optional)
- Node is not required if Bun is on `PATH`

## Environment

```bash
cp .env.example .env.local
```

Fill:

1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. `SUPABASE_SECRET_KEY` — Dashboard → Settings → API Keys → **Secret** (`sb_secret_...`)

Without (3), `/i` and `/c` throw at runtime.

Helper script (rewrites env only if elevated key missing):

```bash
bun run setup:local
# or: bash scripts/setup-local.sh
```

## Database

Apply migrations to your project (CLI or Supabase MCP / dashboard):

```bash
bunx supabase link --project-ref <your-ref>
bunx supabase db push
```

Schema lives in `supabase/migrations/`.

## Auth user

1. Dashboard → Authentication → Users → add DM (email + password).
2. Turn **Allow new users to sign up** OFF.
3. Profile row is created by `handle_new_user` on signup/create.

## Avatars

Place images under `public/avatars/` and register allow-listed ids in `src/config/avatars.ts` (generators under `scripts/` exist for stem lists).

## Run

```bash
bun install
bun run dev
```

Lint:

```bash
bun run lint
bun run format
```
