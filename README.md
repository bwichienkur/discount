# Open Door GA

Georgia directory of free and discounted experiences for foster and kinship families.

## What it does

- Public map + list of offers across Georgia
- Filters by region, category, free-only, and search
- Offer detail pages with discount %, free flag, promo dates, eligibility, and proof required
- Password-protected admin to manually add/edit businesses and offers
- Auto-geocoding via OpenStreetMap Nominatim when lat/lng are omitted
- Seeded demo listings so the map works out of the box

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- JSON file store (Vercel-compatible; no native SQLite module)
- Leaflet / OpenStreetMap for the map
- Cookie session auth for admin (`jose` JWT)

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin: [http://localhost:3000/admin](http://localhost:3000/admin)  
Default password from `.env.example`: `opendoor-admin`

## Vercel deploy

This app is configured to deploy on Vercel without a database service:

1. Connect the GitHub repo to Vercel
2. Set environment variables (recommended):
   - `AUTH_SECRET` — long random string
   - `ADMIN_PASSWORD` — admin login password
3. Deploy from `main`

### If you don’t see the site after deploy

1. Open the Vercel project → **Deployments** and confirm the latest **Production** deploy is green (not an older failed one).
2. Click **Visit** on that Production deployment (do not use `discount.vercel.app` — that is a different site).
3. If the URL asks you to log in to Vercel, turn off **Deployment Protection** for Production:  
   Project Settings → Deployment Protection → disable protection / SSO for Production (or add a public custom domain).
4. Optionally set `AUTH_SECRET` and `ADMIN_PASSWORD` in Project Settings → Environment Variables, then Redeploy.

On Vercel, data is seeded automatically. Admin writes use `/tmp` (ephemeral across cold starts). For durable production storage later, swap the JSON store for Postgres (Neon) or Turso.

## Environment

| Variable | Purpose |
|----------|---------|
| `AUTH_SECRET` | Signs admin session cookies |
| `ADMIN_PASSWORD` | Password for `/admin` |
| `DATABASE_PATH` | Optional JSON store path (default `data/opendoor-store.json`, or `/tmp/...` on Vercel) |

## Data model

- **regions** — Metro Atlanta, North Georgia, Middle Georgia, Coastal / Southeast, Southwest Georgia, Statewide
- **businesses** — name, category, address, coords, contact, region
- **offers** — title, description, free / discount %, dates, eligibility, proof, source, verified date

## Data strategy

There is no reliable public API for foster-specific discounts. This app is **manual-first**:

1. Enter offers you have verified with the business
2. Optionally geocode addresses automatically
3. Do **not** scrape the Foster Friendly App or other proprietary directories

## Scripts

```bash
npm run dev      # development
npm run build    # production build
npm run start    # run production server
npm run lint     # eslint
```
