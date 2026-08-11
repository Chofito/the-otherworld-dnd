# The Otherworld

> A small, thematic home for your first D&D table — the DM builds the campaign, friends arrive through invite links, and the party gathers before the first session.

**The Otherworld** is a Next.js + Supabase app for dungeon masters who want to onboard players without building a full VTT. Create campaigns, share invite permalinks, collect character sheets (light), and publish a public party page.

---

## What you get

| For the DM | For players |
|------------|-------------|
| Private dashboard | Open an invite link — no account |
| Campaigns, rules, seats | Pick avatar, race, class, name |
| Race & class catalogs | See a permalink of what they sent |
| Invite create / revoke | Browse the public campaign party |
| Edit / remove characters | |

No dice rollers, initiative trackers, or in-session tools — by design. This is the **lobby before the adventure**.

---

## Stack

- **Next.js 16** (App Router) · React 19 · TypeScript
- **Supabase** Auth + Postgres + RLS
- **Zod** validation · **nanoid** invite slugs
- **Tailwind CSS 4** · **Biome** lint/format
- Package manager: **Bun**

---

## Quick start

```bash
bun install
cp .env.example .env.local
# Fill Supabase URL, publishable key, and SUPABASE_SECRET_KEY
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Required:** `SUPABASE_SECRET_KEY` (`sb_secret_...`) is server-only. Public routes `/i` and `/c` will fail without it.

More detail: [docs/local-setup.md](docs/local-setup.md)

---

## Routes

| Path | Who | Purpose |
|------|-----|---------|
| `/` | Everyone | Landing |
| `/summon-dm` | DM | Sign in (obscured entry; no public CTA) |
| `/dashboard` | DM | Campaigns |
| `/dashboard/account` | DM | Profile (fictional name + bio) |
| `/dashboard/races` · `/classes` | DM | Catalog |
| `/dashboard/campaigns/[id]` | DM | Campaign, invites, characters |
| `/i/[slug]` | Players | Invite + character signup + permalink |
| `/c/[slug]` | Public | Campaign page + party (no emails) |

---

## Docs

| Doc | Contents |
|-----|----------|
| [Product](docs/product.md) | Scope, flows, locked decisions |
| [Architecture](docs/architecture.md) | App layout, Supabase clients, RPCs |
| [Design](docs/design.md) | Arcane Violet, fonts, `/design` lab |
| [i18n](docs/i18n.md) | ES / EN cookie locale |
| [Security](docs/security.md) | Keys, RLS, public surface |
| [Local setup](docs/local-setup.md) | Env, Auth, avatars |
| [Deploy](docs/deploy.md) | Vercel + Supabase cloud |

Agent guidance: [`AGENTS.md`](AGENTS.md) · [`CLAUDE.md`](CLAUDE.md)

---

## Deploy (short)

1. Supabase project with migrations applied; signup **OFF**
2. Vercel project with the three env vars from `.env.example`
3. Auth redirect URLs → your Vercel domain

```bash
bunx vercel login
bunx vercel env add NEXT_PUBLIC_SUPABASE_URL
bunx vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
bunx vercel env add SUPABASE_SECRET_KEY
bunx vercel --prod
```

Full guide: [docs/deploy.md](docs/deploy.md)

---

## License / use

Built for a private friend-group campaign table. Fork and adapt freely for your own party — keep secret keys off the client and treat invite links as capability URLs.
