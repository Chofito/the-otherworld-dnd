# Product

## Intent

Help a DM onboard friends to a first D&D campaign: create the table, send invites, collect light character info, and show a public party page. **Not** a VTT — no combat, dice, or session tools.

## Roles

| Role | Accounts | Primary surfaces |
|------|----------|------------------|
| DM | Email/password (Supabase Auth) | `/summon-dm`, `/dashboard/*` |
| Player | None | `/i/[slug]`, `/c/[slug]` |

## DM capabilities

- Create / edit campaigns (name, description, rules, seats, max level, status, duplicate race/class flags).
- Maintain personal race & class catalogs.
- Create invite links, copy them, revoke them, delete them.
- View, edit, and delete submitted characters (emails + contributions visible only here).
- Profile: fictional name + bio (appears on the public party as the DM seat).

## Player capabilities

1. Open `/i/{slug}` while the invite is pending and the campaign has seats.
2. Complete the character form (avatar, name, race, class, email, contribution).
3. After submit, the **same URL** becomes a read-only permalink of their character.
4. Optionally open `/c/{public_slug}` to see campaign blurb + party (no emails, no contributions).

## Locked decisions

- No public signup; DM users are created in the Auth dashboard (or admin tooling).
- No DM “accept” step for characters; submit is final for the player.
- Invite expired or revoked → treat as not found (no soft error page required).
- Home page has **no** login marketing CTA; DM path is obscured (`/summon-dm`).
- UI/branding can evolve; product perimeter above should stay stable unless explicitly revisited.

## Out of scope (for now)

Session management, calendars, full character sheets, multi-DM orgs, player accounts, real-time presence.
