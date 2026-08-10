#!/usr/bin/env bash
set -euo pipefail
export PATH="$HOME/.bun/bin:$PATH"

RESP=$(curl -s -w "\nHTTP:%{http_code}" -X POST \
  "https://onobvugjuhejwvepsytk.supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: sb_publishable_7wY0iQm7JD334GZqafS_sQ_33wJjFQf" \
  -H "Content-Type: application/json" \
  -d '{"email":"rjroblesq@gmail.com","password":"123456"}')

echo "$RESP"
