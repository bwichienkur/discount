import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import type { OfferWithBusiness } from "./types";

const dataDir = path.join(process.cwd(), "data");
const dbPath = process.env.DATABASE_PATH
  ? path.join(/* turbopackIgnore: true */ process.cwd(), process.env.DATABASE_PATH)
  : path.join(dataDir, "opendoor.db");

let dbInstance: Database.Database | null = null;

function ensureSchema(db: Database.Database) {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS regions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS businesses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      region_id INTEGER NOT NULL REFERENCES regions(id),
      address_line1 TEXT NOT NULL,
      address_line2 TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL DEFAULT 'GA',
      zip TEXT NOT NULL,
      lat REAL,
      lng REAL,
      phone TEXT,
      website TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS offers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      is_free INTEGER NOT NULL DEFAULT 0,
      discount_percent REAL,
      discount_details TEXT,
      starts_at TEXT,
      ends_at TEXT,
      eligibility_notes TEXT,
      proof_required TEXT,
      source_url TEXT,
      verified_at TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

function seedIfEmpty(db: Database.Database) {
  const count = db.prepare("SELECT COUNT(*) AS c FROM regions").get() as {
    c: number;
  };
  if (count.c > 0) return;

  const insertRegion = db.prepare(
    "INSERT INTO regions (name, slug) VALUES (?, ?)",
  );
  const regions = [
    ["Metro Atlanta", "metro-atlanta"],
    ["North Georgia", "north-georgia"],
    ["Middle Georgia", "middle-georgia"],
    ["Coastal / Southeast", "coastal"],
    ["Southwest Georgia", "southwest"],
    ["Statewide", "statewide"],
  ] as const;

  const regionIds: Record<string, number> = {};
  for (const [name, slug] of regions) {
    const info = insertRegion.run(name, slug);
    regionIds[slug] = Number(info.lastInsertRowid);
  }

  const insertBusiness = db.prepare(`
    INSERT INTO businesses (
      name, category, region_id, address_line1, city, state, zip,
      lat, lng, phone, website, active
    ) VALUES (
      @name, @category, @region_id, @address_line1, @city, @state, @zip,
      @lat, @lng, @phone, @website, 1
    )
  `);

  const insertOffer = db.prepare(`
    INSERT INTO offers (
      business_id, title, description, is_free, discount_percent,
      discount_details, starts_at, ends_at, eligibility_notes,
      proof_required, source_url, verified_at, active
    ) VALUES (
      @business_id, @title, @description, @is_free, @discount_percent,
      @discount_details, @starts_at, @ends_at, @eligibility_notes,
      @proof_required, @source_url, @verified_at, 1
    )
  `);

  const seed = [
    {
      business: {
        name: "Savannah Children's Museum",
        category: "museum",
        region_id: regionIds.coastal,
        address_line1: "655 W. Boundary St",
        city: "Savannah",
        state: "GA",
        zip: "31401",
        lat: 32.0817,
        lng: -81.0998,
        phone: null,
        website: "https://www.chsgeorgia.org/scm",
      },
      offer: {
        title: "50% off admission for foster families",
        description:
          "Foster and kinship families receive half-price admission when visiting Savannah Children's Museum as part of Georgia Kids Belong Foster Friendly support.",
        is_free: 0,
        discount_percent: 50,
        discount_details: "50% off general admission",
        starts_at: null,
        ends_at: null,
        eligibility_notes:
          "Licensed foster or kinship families in Georgia. Confirm current offer details with the venue.",
        proof_required: "Foster parent ID or Foster Friendly card",
        source_url:
          "http://www.southernmamas.com/2023/50-discount-for-foster-families-savannah-childrens-museum/",
        verified_at: "2026-01-15",
      },
    },
    {
      business: {
        name: "Demo Metro Grill",
        category: "restaurant",
        region_id: regionIds["metro-atlanta"],
        address_line1: "100 Peachtree St NE",
        city: "Atlanta",
        state: "GA",
        zip: "30303",
        lat: 33.7557,
        lng: -84.3884,
        phone: "(404) 555-0100",
        website: null,
      },
      offer: {
        title: "Free kids meal with foster ID",
        description:
          "DEMO OFFER for development: one free kids meal per foster child with a qualifying foster parent ID. Replace with verified local partners.",
        is_free: 1,
        discount_percent: null,
        discount_details: "Free kids meal",
        starts_at: null,
        ends_at: null,
        eligibility_notes: "Demo listing — verify before publishing publicly.",
        proof_required: "Foster parent ID",
        source_url: null,
        verified_at: "2026-03-01",
      },
    },
    {
      business: {
        name: "North Georgia Family Y",
        category: "gym",
        region_id: regionIds["north-georgia"],
        address_line1: "200 Main St",
        city: "Gainesville",
        state: "GA",
        zip: "30501",
        lat: 34.2979,
        lng: -83.8241,
        phone: "(770) 555-0142",
        website: null,
      },
      offer: {
        title: "25% off family membership",
        description:
          "DEMO OFFER: discounted family membership for licensed foster households. Confirm rates and eligibility with the branch.",
        is_free: 0,
        discount_percent: 25,
        discount_details: "25% off standard family membership",
        starts_at: null,
        ends_at: null,
        eligibility_notes: "Demo listing — replace with a verified YMCA partner.",
        proof_required: "Foster license",
        source_url: null,
        verified_at: "2026-02-20",
      },
    },
    {
      business: {
        name: "Coastal Splash Adventure Park",
        category: "attraction",
        region_id: regionIds.coastal,
        address_line1: "450 Ocean Hwy",
        city: "Brunswick",
        state: "GA",
        zip: "31520",
        lat: 31.1499,
        lng: -81.4915,
        phone: null,
        website: null,
      },
      offer: {
        title: "Free admission Saturdays in April",
        description:
          "DEMO OFFER: free general admission for foster kids on Saturdays during April. Caregivers pay standard rates.",
        is_free: 1,
        discount_percent: null,
        discount_details: "Free child admission on promo Saturdays",
        starts_at: "2026-04-01",
        ends_at: "2026-04-30",
        eligibility_notes: "Demo timed promo — date-bound offer for UI testing.",
        proof_required: "Foster parent ID",
        source_url: null,
        verified_at: "2026-03-10",
      },
    },
  ] as const;

  const tx = db.transaction(() => {
    for (const item of seed) {
      const biz = insertBusiness.run(item.business);
      insertOffer.run({
        ...item.offer,
        business_id: Number(biz.lastInsertRowid),
      });
    }
  });
  tx();
}

export function getDb() {
  if (dbInstance) return dbInstance;
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  dbInstance = new Database(dbPath);
  dbInstance.pragma("journal_mode = WAL");
  ensureSchema(dbInstance);
  seedIfEmpty(dbInstance);
  return dbInstance;
}

export function listRegions() {
  return getDb()
    .prepare("SELECT id, name, slug FROM regions ORDER BY name ASC")
    .all() as { id: number; name: string; slug: string }[];
}

export function listActiveOffers(filters?: {
  region?: string;
  category?: string;
  q?: string;
  freeOnly?: boolean;
}) {
  const clauses: string[] = [
    "o.active = 1",
    "b.active = 1",
    "(o.ends_at IS NULL OR date(o.ends_at) >= date('now'))",
  ];
  const params: Record<string, string | number> = {};

  if (filters?.region) {
    clauses.push("r.slug = @region");
    params.region = filters.region;
  }
  if (filters?.category) {
    clauses.push("b.category = @category");
    params.category = filters.category;
  }
  if (filters?.freeOnly) {
    clauses.push("o.is_free = 1");
  }
  if (filters?.q) {
    clauses.push(
      "(b.name LIKE @q OR o.title LIKE @q OR o.description LIKE @q OR b.city LIKE @q)",
    );
    params.q = `%${filters.q}%`;
  }

  const sql = `
    SELECT
      o.*,
      b.name AS business_name,
      b.category,
      b.region_id,
      r.name AS region_name,
      r.slug AS region_slug,
      b.address_line1,
      b.address_line2,
      b.city,
      b.state,
      b.zip,
      b.lat,
      b.lng,
      b.phone,
      b.website,
      b.active AS business_active
    FROM offers o
    JOIN businesses b ON b.id = o.business_id
    JOIN regions r ON r.id = b.region_id
    WHERE ${clauses.join(" AND ")}
    ORDER BY o.is_free DESC, o.verified_at DESC, b.name ASC
  `;

  return getDb().prepare(sql).all(params) as OfferWithBusiness[];
}

export function getOfferById(id: number) {
  return getDb()
    .prepare(
      `
      SELECT
        o.*,
        b.name AS business_name,
        b.category,
        b.region_id,
        r.name AS region_name,
        r.slug AS region_slug,
        b.address_line1,
        b.address_line2,
        b.city,
        b.state,
        b.zip,
        b.lat,
        b.lng,
        b.phone,
        b.website,
        b.active AS business_active
      FROM offers o
      JOIN businesses b ON b.id = o.business_id
      JOIN regions r ON r.id = b.region_id
      WHERE o.id = ?
    `,
    )
    .get(id) as OfferWithBusiness | undefined;
}
