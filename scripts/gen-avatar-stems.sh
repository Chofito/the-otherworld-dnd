#!/usr/bin/env bash
# Generates src/config/avatars-stems.ts from public/avatars file listing logic
set -euo pipefail
cd /home/chofito/the-otherworld-dnd

OUT="src/config/avatars-stems.ts"

female=$(find public/avatars/Female -type f \( -name '*_lg.png' -o -name '*_lg.jpg' \) 2>/dev/null | sed 's|.*/||; s/_lg\..*//' | sort -V | uniq)
male=$(find public/avatars/Male -type f \( -name '*_lg.png' -o -name '*_lg.jpg' \) 2>/dev/null | sed 's|.*/||; s/_lg\..*//' | sort -V | uniq)

{
  echo '// Auto-generated from public/avatars - do not edit by hand'
  echo 'export const FEMALE_STEMS = ['
  while IFS= read -r s; do
    [ -n "$s" ] && echo "  '$s',"
  done <<< "$female"
  echo '] as const;'
  echo
  echo 'export const MALE_STEMS = ['
  while IFS= read -r s; do
    [ -n "$s" ] && echo "  '$s',"
  done <<< "$male"
  echo '] as const;'
} > "$OUT"

echo "Wrote $OUT"
echo "Female: $(echo "$female" | grep -c . || true)"
echo "Male: $(echo "$male" | grep -c . || true)"
