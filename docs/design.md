# Design system

Dark-only visual foundation for **The Otherworld**, tuned like a game menu / [D&D Beyond](https://www.dndbeyond.com/) shell: deep ink backgrounds, saturated accents, amber/gold highlights, high contrast for future full-bleed art.

## Active default

**Arcane Violet** (`data-theme="arcane"`)

| Token | Hex |
|-------|-----|
| background | `#100E18` |
| surface | `#1A1626` |
| foreground | `#F0EBF8` |
| muted | `#A69BB8` |
| border | `#322A45` |
| accent | `#8B5CF6` |
| highlight | `#F59E0B` |
| danger | `#F07178` |
| ok | `#34D399` |

- Display: **Cormorant Garamond** (SIL OFL)
- Body: **Nunito Sans** (SIL OFL)

Loaded via `next/font/google` in [`src/app/layout.tsx`](../src/app/layout.tsx). Theme definitions live in [`src/config/design-themes.ts`](../src/config/design-themes.ts).

## Alternate directions (style lab)

Preview at **`/design`** (linked from the DM dashboard):

1. **Crimson Banner** — navy + red CTA + gold (DDB-like)
2. **Arcane Violet** — default
3. **Azure Ember** — blue + orange

Switching themes on `/design` sets `document.documentElement.dataset.theme` temporarily; leaving the page restores Arcane.

## Visual rules

- No light mode.
- Cards / modals use `--surface` / `--surface-elevated`, never white.
- Primary CTAs use `--accent`; brand emphasis and focus cues lean on `--highlight`.
- Brand / H1 → `--font-display`; UI and card body → `--font-body`.
- “Future art” slots are dashed panels for contrast checks until real imagery lands.

## Related products (UX inspiration)

| Product | Takeaway |
|---------|----------|
| D&D Beyond | Dark shell, strong CTA, invite → join |
| Campaign Tracker | Player portal via invite (we stay pre-session) |
| Grimoire | Single invite + campaign preview |

See also [product.md](product.md) and [architecture.md](architecture.md).
