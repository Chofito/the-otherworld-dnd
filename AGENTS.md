<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# The Otherworld — agent notes

Human-oriented product/docs live in [`README.md`](README.md) and [`docs/`](docs/). Prefer those over outdated notes in `PROJECT_CONTEXT.md` (historical brainstorm).

## Product locks (do not casually reverse)

- **Players have no accounts.** Only the DM authenticates.
- DM entry is **`/summon-dm`** (not a public login CTA on home). `/login` may redirect there.
- Invite permalinks: `/i/{slug}` (nanoid `a-z0-9`, length 6). Completed invite = permanent read-only. Expired/revoked → `notFound()`.
- No DM “accept character” gate; player cannot edit after submit; DM can edit/delete.
- Campaign status: `open` | `ongoing` | `completed`.
- Public campaign page `/c/[slug]`: party visible; **no emails**, **no player contributions**.
- Catalog races/classes are per-DM; characters reference `race_id` / `class_id`.

## Security locks

- Public RPCs (`fetch_invite_page`, `fetch_campaign_page`, `submit_invite_character`) are **`service_role` / secret-key only**. Call them via `createServiceClient()` on the server (`src/lib/supabase/service.ts`).
- Never grant those RPCs to `anon` / `authenticated`. Prefer `SUPABASE_SECRET_KEY` (`sb_secret_...`) over legacy service role JWT.
- Publishable key only for cookie session client (`createClient` in `server.ts` / proxy). No browser Supabase client with elevated keys.
- Do not invent exploits, PoCs, or attack tooling. Local defensive fixes only.
- Signup should stay closed (Dashboard + `config.toml`).

## Code conventions

- Package manager: **Bun** (`bun install`, `bun run …`, `bunx …`).
- Validation at action boundaries with **Zod** (`src/lib/validations.ts`).
- Server actions in `src/app/actions.ts`; keep DM mutations on the user client so **RLS** enforces ownership.
- Prefer `supabase migration new` / MCP `apply_migration` for schema; keep local `supabase/migrations/` filenames synced to remote versions.
- Lint/format: Biome (`bun run lint`).
- UI work: follow existing patterns first; when designing marketing/landing surfaces, respect the project’s frontend design rules (brand-first, no generic AI purple/cream tropes).

## Env

See `.env.example`. Without `SUPABASE_SECRET_KEY`, `/i` and `/c` crash by design.
