# Design system

Dark-only, built around one motif: a doorway left ajar in the night. The DM picks a **site theme** that every visitor sees; each theme re-skins the same pages.

## Themes

| Id | Name (es / en) | Evokes | Display / body font |
|----|----------------|--------|---------------------|
| `arcane` | The Otherworld | Base brand (default) | Cormorant Garamond / Nunito Sans |
| `keep` | El Fuerte / The Keep | *Heroes of the Borderlands*: Keep on the Borderlands | Cinzel / Alegreya Sans |
| `wilderness` | El Yermo / The Wilderness | *Heroes of the Borderlands*: Wilderness | Cormorant Garamond / Alegreya Sans |
| `caves` | Las Cuevas / The Caves | *Heroes of the Borderlands*: Caves of Chaos | Grenze Gotisch / Nunito Sans |

All fonts are SIL OFL via `next/font/google` in [`src/app/layout.tsx`](../src/app/layout.tsx). Only the arcane fonts are preloaded; the others download when a theme uses them.

## How the active theme is chosen

1. The DM opens **`/dashboard/theme`** and applies a theme (`updateSiteThemeAction`, user client, RLS).
2. The value lives in `public.site_settings.theme` (single row, migration `20261010003153_site_settings_theme.sql`).
3. The root layout reads it with `getSiteThemeId()` ([`src/lib/site-theme.ts`](../src/lib/site-theme.ts)): service client, cached with `unstable_cache` under the `site-theme` tag; the action calls `updateTag('site-theme')`.
4. It is stamped as `<html data-theme="…">`. Everything else is CSS.

If the table, row or secret key is missing, the site falls back to `arcane` instead of crashing.

## Where styles live

```
src/app/globals.css        imports only (order matters)
src/styles/tokens.css      token contract, derived tokens, atmosphere knobs, type scale
src/styles/base.css        night plane, type, layout primitives
src/styles/motifs.css      the door, its mist, the emblem variant
src/styles/components.css  cards, fields, buttons, badges, modal, player cards…
src/styles/pages/*.css     per-page layout
src/styles/themes/*.css    one file per theme: tokens + skin
src/styles/motion.css      reduced-motion overrides (last)
```

### A theme file has two parts

- **Tokens** in `[data-theme="<id>"] { … }`. The required list is at the top of `tokens.css`; `src/config/design-themes.test.ts` (`bun test`) fails if one is missing or if `swatches` in [`src/config/design-themes.ts`](../src/config/design-themes.ts) drift from the CSS.
- **Skin**: `[data-theme="<id>"] .door`, `.card`, `.btn`, `.badge`, `.sigil`, `.ornament`… That is where frames, borders, state shapes and dividers change.

| Theme | Door / hero art | Cards | States | Divider | Sigil |
|-------|-----------------|-------|--------|---------|-------|
| arcane | Arch with mist | Corner ticks | Pills | Gradient line | Diamond |
| keep | Gatehouse with portcullis | Riveted plate, heraldic band | Swallowtail pennants | Battlements | Shield |
| wilderness | Moonlit spring between tamaracks | Leaf corners with vine | Trail stones | Dotted trail | Crescent |
| caves | Cave mouth with the Chaos Bell | Torn parchment | Chalk scrawls | Claw marks | Bell |

The hero art is [`src/components/theme-emblem.tsx`](../src/components/theme-emblem.tsx). All emblems render; each theme flips its `--emblem-<id>` token to `block`.

### Atmosphere knobs

`--mist`, `--stars`, `--grain` (0–1) and `--glow` (0–2) scale the door mist, drifting stars, grain/vignette and ember glows. Themes override them in their token block (e.g. caves has fewer stars and more glow). Tune them live in **`/design`** and use **Copy tokens** to paste the values into the theme file.

### Type scale

Use `--step--3 … --step-3` for font sizes, `--track-label / --track-wide / --track-widest` for small-caps tracking and `--weight-strong` for bold. Display sizes stay as `clamp()` per component.

## Adding a theme

1. Add `src/styles/themes/<id>.css` (copy one, keep the full token block) and import it in `globals.css` before `motion.css`.
2. Add the id and swatches to `DESIGN_THEMES`, names to both dictionaries (`theme.names`).
3. Optional: an emblem in `theme-emblem.tsx` plus `--emblem-<id>` in `tokens.css`.
4. `bun test`, then check it in `/design`. No migration needed: `site_settings.theme` accepts any slug and unknown ids fall back to `arcane`.

## Visual rules

- No light mode.
- Cards and modals use `--surface` / `--surface-elevated`, never white.
- Primary CTAs use `--accent` with `--accent-fg` (AA ≥ 4.5:1 in every theme); emphasis and focus use `--highlight`.
- Headings and brand use `--font-display`; UI text uses `--font-body`.
- Every animation and hover lift yields to `prefers-reduced-motion`.

See also [product.md](product.md) and [architecture.md](architecture.md).
