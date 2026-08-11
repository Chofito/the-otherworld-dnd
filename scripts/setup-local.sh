#!/usr/bin/env bash
set -euo pipefail

export PATH="$HOME/.bun/bin:$PATH"
cd /home/chofito/the-otherworld-dnd

echo "==> PATH bun: $(command -v bun || true)"
echo "==> bun version: $(bun --version 2>/dev/null || echo MISSING)"

if ! command -v bun >/dev/null 2>&1; then
  echo "ERROR: bun not found. Install from https://bun.sh"
  exit 1
fi

echo "==> Installing deps"
bun install

# Remote Supabase project (schema already applied)
ENV_FILE=".env.local"
if [[ -f "$ENV_FILE" ]] && { grep -q '^SUPABASE_SECRET_KEY=.' "$ENV_FILE" || grep -q '^SUPABASE_SERVICE_ROLE_KEY=.' "$ENV_FILE"; }; then
  echo "==> Keeping existing $ENV_FILE (elevated key already set)"
else
  cat > "$ENV_FILE" <<'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://onobvugjuhejwvepsytk.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_7wY0iQm7JD334GZqafS_sQ_33wJjFQf
# Preferred: Dashboard → Settings → API Keys → Secret key (sb_secret_...)
# Never expose to the browser. Do not commit.
SUPABASE_SECRET_KEY=REPLACE_WITH_SB_SECRET
EOF
  echo "==> Wrote $ENV_FILE - replace SUPABASE_SECRET_KEY before running"
fi

echo "==> Env keys:"
cut -d= -f1 "$ENV_FILE"

echo "==> Docker check"
if docker info >/dev/null 2>&1; then
  echo "DOCKER_OK"
else
  echo "DOCKER_MISSING (ok for remote Supabase; needed only for supabase start)"
fi

echo "==> Setup complete"
echo ""
echo "Start the app with:"
echo "  bun run dev"
echo ""
echo "Then open: http://localhost:3000"
echo "DM access: /summon-dm  (Auth → disable public signup in Supabase Dashboard)"
