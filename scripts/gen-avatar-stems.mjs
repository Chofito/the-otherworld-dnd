import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const list = readFileSync(resolve(root, 'scripts/portrait-lg-list.txt'), 'utf8');

const female = [];
const male = [];

for (const line of list.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed) continue;
  const match = trimmed.match(/^\.\/(Female|Male)\/(.+)_lg\.(png|jpg)$/);
  if (!match) continue;
  const [, folder, stem] = match;
  if (folder === 'Female') female.push(stem);
  else male.push(stem);
}

const fmt = (arr) => arr.map((s) => `  '${s}',`).join('\n');

const out = `// Auto-generated from scripts/portrait-lg-list.txt
export const FEMALE_STEMS = [
${fmt(female)}
] as const;

export const MALE_STEMS = [
${fmt(male)}
] as const;
`;

writeFileSync(resolve(root, 'src/config/avatars-stems.ts'), out);
console.log(`female=${female.length} male=${male.length}`);
