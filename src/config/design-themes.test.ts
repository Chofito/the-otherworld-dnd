import { describe, expect, test } from 'bun:test';
import { file } from 'bun';
import { DESIGN_THEMES } from '@/config/design-themes';

// The picker and lab swatches mirror tokens from the theme CSS files.
// If a palette is retuned in CSS, update `swatches` too (or vice versa).
const REQUIRED_TOKENS = [
  'background',
  'ink-deep',
  'surface',
  'surface-elevated',
  'foreground',
  'muted',
  'border',
  'accent',
  'accent-fg',
  'accent-text',
  'highlight',
  'ember',
  'danger',
  'ok',
  'star-rgb',
  'star-warm-rgb',
  'shadow-rgb',
  'title-from',
  'title-mid',
  'title-to',
  'font-display',
  'font-body',
  'display-style',
  'display-transform',
  'display-tracking',
  'radius',
  'arch',
];

async function readThemeTokens(id: string) {
  const css = await file(
    new URL(`../styles/themes/${id}.css`, import.meta.url),
  ).text();
  const block = css.match(
    new RegExp(`\\[data-theme="${id}"\\]\\s*\\{([\\s\\S]*?)\\n\\}`),
  );
  if (!block) throw new Error(`No [data-theme="${id}"] block in ${id}.css`);
  const tokens = new Map<string, string>();
  for (const match of block[1].matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    tokens.set(match[1], match[2].trim().toLowerCase());
  }
  return tokens;
}

describe('design themes', () => {
  for (const theme of DESIGN_THEMES) {
    test(`${theme.id} defines the full token contract`, async () => {
      const tokens = await readThemeTokens(theme.id);
      const missing = REQUIRED_TOKENS.filter((token) => !tokens.has(token));
      expect(missing).toEqual([]);
    });

    test(`${theme.id} swatches match its CSS`, async () => {
      const tokens = await readThemeTokens(theme.id);
      for (const [name, hex] of Object.entries(theme.swatches)) {
        expect(tokens.get(name)).toBe(hex.toLowerCase());
      }
    });
  }
});
