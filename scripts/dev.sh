#!/usr/bin/env bash
set -euo pipefail

export PATH="$HOME/.bun/bin:$PATH"
cd /home/chofito/the-otherworld-dnd

if [ ! -f .env.local ]; then
  echo "Missing .env.local — run: bash scripts/setup-local.sh"
  exit 1
fi

if [ ! -d node_modules ]; then
  bun install
fi

echo "Starting The Otherworld at http://localhost:3000"
exec bun run dev
