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
- SQLite (`better-sqlite3`) for local persistence
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

## Environment

| Variable | Purpose |
|----------|---------|
| `AUTH_SECRET` | Signs admin session cookies |
| `ADMIN_PASSWORD` | Password for `/admin` |
| `DATABASE_PATH` | Optional SQLite path (default `data/opendoor.db`) |

## Data model

- **regions** — Metro Atlanta, North Georgia, Middle Georgia, Coastal / Southeast, Southwest Georgia, Statewide
- **businesses** — name, category, address, coords, contact, region
- **offers** — title, description, free / discount %, dates, eligibility, proof, source, verified date

## Data strategy

There is no reliable public API for foster-specific discounts. This app is **manual-first**:

1. Enter offers you have verified with the business
2. Optionally geocode addresses automatically
3. Do **not** scrape the Foster Friendly App or other proprietary directories
4. Later you can seed adjacent public programs (e.g. Museums for All SNAP access) as a clearly labeled separate offer type

## Scripts

```bash
npm run dev      # development
npm run build    # production build
npm run start    # run production server
npm run lint     # eslint
```
