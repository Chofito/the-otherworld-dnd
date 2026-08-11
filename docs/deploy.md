# Deploy

## Supabase (backend)

The app expects a hosted Supabase project with migrations applied.

1. Confirm migrations match `supabase/migrations/` (or `bunx supabase db push`).
2. Auth → disable public signup.
3. Auth → URL configuration: set **Site URL** and redirect allowlist to the Vercel domain (`https://your-app.vercel.app/**`).
4. Optional: Auth → Rate Limits → enable **IP Address Forwarding**.
5. Copy URL, publishable key, and secret key for Vercel.

## Vercel (frontend)

### Dashboard

1. Import the Git repo (or deploy without Git via CLI).
2. Framework preset: Next.js.
3. **Settings → Environment Variables** (Production + Preview as needed):

| Name | Notes |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable |
| `SUPABASE_SECRET_KEY` | `sb_secret_...`, never `NEXT_PUBLIC_` |

4. Deploy. Redeploy after changing env vars.

### CLI (Bun)

```bash
bunx vercel login
bunx vercel link

bunx vercel env add NEXT_PUBLIC_SUPABASE_URL
bunx vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
bunx vercel env add SUPABASE_SECRET_KEY

bunx vercel          # preview
bunx vercel --prod   # production
```

## Smoke test after go-live

- `/` loads
- `/summon-dm` signs the DM in
- Dashboard campaign create + invite copy
- `/i/{slug}` loads and can submit (needs secret key)
- `/c/{slug}` shows party without emails
- Public signup still rejected if someone hits Auth signup APIs
