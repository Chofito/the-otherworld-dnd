#!/usr/bin/env bash
export PATH="$HOME/.bun/bin:$PATH"
cd /home/chofito/the-otherworld-dnd
bun scripts/gen-avatar-stems.mjs
wc -l src/config/avatars-stems.ts
head -20 src/config/avatars-stems.ts
