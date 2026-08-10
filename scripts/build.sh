#!/usr/bin/env bash
set -euo pipefail
export PATH="$HOME/.bun/bin:$PATH"
cd /home/chofito/the-otherworld-dnd
bun run build
