import fs from "node:fs";
import path from "node:path";
import type { Business, Offer, OfferWithBusiness } from "./types";
import {
  createSeedStore,
  CURRENT_SEED_VERSION,
  isOfferCurrent,
  joinOffer,
  type Region,
  type StoreData,
} from "./seed";

declare global {
  // eslint-disable-next-line no-var
  var __opendoorStore: StoreData | undefined;
}

function storePath() {
  if (process.env.DATABASE_PATH) {
    return path.isAbsolute(process.env.DATABASE_PATH)
      ? process.env.DATABASE_PATH
      : path.join(/* turbopackIgnore: true */ process.cwd(), process.env.DATABASE_PATH);
  }
  // Vercel serverless FS is read-only except /tmp
  if (process.env.VERCEL) {
    return path.join("/tmp", "opendoor-store.json");
  }
  return path.join(/* turbopackIgnore: true */ process.cwd(), "data", "opendoor-store.json");
}

function readStoreFromDisk(): StoreData | null {
  const file = storePath();
  try {
    if (!fs.existsSync(/* turbopackIgnore: true */ file)) return null;
    const raw = fs.readFileSync(/* turbopackIgnore: true */ file, "utf8");
    return JSON.parse(raw) as StoreData;
  } catch {
    return null;
  }
}

function writeStoreToDisk(store: StoreData) {
  const file = storePath();
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(store, null, 2), "utf8");
  } catch (error) {
    // On read-only filesystems, keep in-memory store for this instance
    console.warn("Unable to persist store to disk:", error);
  }
}

export function getStore(): StoreData {
  if (globalThis.__opendoorStore) {
    return globalThis.__opendoorStore;
  }

  const fromDisk = readStoreFromDisk();
  const needsReseed =
    !fromDisk ||
    typeof fromDisk.seedVersion !== "number" ||
    fromDisk.seedVersion < CURRENT_SEED_VERSION;

  const store = needsReseed ? createSeedStore() : fromDisk;
  if (needsReseed) {
    writeStoreToDisk(store);
  }
  globalThis.__opendoorStore = store;
  return store;
}

export function saveStore(mutator: (store: StoreData) => void) {
  const store = getStore();
  mutator(store);
  writeStoreToDisk(store);
  globalThis.__opendoorStore = store;
  return store;
}

export function listRegions(): Region[] {
  return [...getStore().regions].sort((a, b) => a.name.localeCompare(b.name));
}

export function listActiveOffers(filters?: {
  region?: string;
  category?: string;
  q?: string;
  freeOnly?: boolean;
}): OfferWithBusiness[] {
  const store = getStore();
  const regionById = new Map(store.regions.map((r) => [r.id, r]));
  const businessById = new Map(store.businesses.map((b) => [b.id, b]));

  let rows = store.offers
    .filter((o) => o.active === 1 && isOfferCurrent(o))
    .map((o) => {
      const business = businessById.get(o.business_id);
      if (!business || business.active !== 1) return null;
      const region = regionById.get(business.region_id);
      if (!region) return null;
      return joinOffer(o, business, region);
    })
    .filter((row): row is OfferWithBusiness => row != null);

  if (filters?.region) {
    rows = rows.filter((r) => r.region_slug === filters.region);
  }
  if (filters?.category) {
    rows = rows.filter((r) => r.category === filters.category);
  }
  if (filters?.freeOnly) {
    rows = rows.filter((r) => r.is_free === 1);
  }
  if (filters?.q) {
    const q = filters.q.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.business_name.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q),
    );
  }

  return rows.sort((a, b) => {
    if (a.is_free !== b.is_free) return b.is_free - a.is_free;
    const av = a.verified_at ?? "";
    const bv = b.verified_at ?? "";
    if (av !== bv) return bv.localeCompare(av);
    return a.business_name.localeCompare(b.business_name);
  });
}

export function getOfferById(id: number): OfferWithBusiness | undefined {
  const store = getStore();
  const offer = store.offers.find((o) => o.id === id);
  if (!offer) return undefined;
  const business = store.businesses.find((b) => b.id === offer.business_id);
  if (!business) return undefined;
  const region = store.regions.find((r) => r.id === business.region_id);
  if (!region) return undefined;
  return joinOffer(offer, business, region);
}

export function listBusinesses() {
  const store = getStore();
  const regionById = new Map(store.regions.map((r) => [r.id, r]));
  return [...store.businesses]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((b) => ({
      ...b,
      region_name: regionById.get(b.region_id)?.name ?? "",
      region_slug: regionById.get(b.region_id)?.slug ?? "",
    }));
}

export function getBusinessById(id: number): Business | undefined {
  return getStore().businesses.find((b) => b.id === id);
}

export function createBusiness(
  input: Omit<Business, "id" | "created_at" | "updated_at">,
): Business {
  const now = new Date().toISOString();
  let created!: Business;
  saveStore((store) => {
    created = {
      ...input,
      id: store.nextBusinessId++,
      created_at: now,
      updated_at: now,
    };
    store.businesses.push(created);
  });
  return created;
}

export function updateBusiness(
  id: number,
  input: Omit<Business, "id" | "created_at" | "updated_at">,
): Business | undefined {
  let updated: Business | undefined;
  saveStore((store) => {
    const idx = store.businesses.findIndex((b) => b.id === id);
    if (idx < 0) return;
    updated = {
      ...store.businesses[idx],
      ...input,
      id,
      updated_at: new Date().toISOString(),
    };
    store.businesses[idx] = updated;
  });
  return updated;
}

export function deleteBusiness(id: number) {
  saveStore((store) => {
    store.businesses = store.businesses.filter((b) => b.id !== id);
    store.offers = store.offers.filter((o) => o.business_id !== id);
  });
}

export function listAllOffersAdmin() {
  const store = getStore();
  const businessById = new Map(store.businesses.map((b) => [b.id, b]));
  const regionById = new Map(store.regions.map((r) => [r.id, r]));
  return [...store.offers]
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .map((o) => {
      const business = businessById.get(o.business_id);
      const region = business
        ? regionById.get(business.region_id)
        : undefined;
      return {
        ...o,
        business_name: business?.name ?? "Unknown",
        category: business?.category,
        region_name: region?.name,
        region_slug: region?.slug,
      };
    });
}

export function getOfferRecord(id: number): Offer | undefined {
  return getStore().offers.find((o) => o.id === id);
}

export function createOffer(
  input: Omit<Offer, "id" | "created_at" | "updated_at">,
): Offer {
  const now = new Date().toISOString();
  let created!: Offer;
  saveStore((store) => {
    created = {
      ...input,
      id: store.nextOfferId++,
      created_at: now,
      updated_at: now,
    };
    store.offers.push(created);
  });
  return created;
}

export function updateOffer(
  id: number,
  input: Omit<Offer, "id" | "created_at" | "updated_at">,
): Offer | undefined {
  let updated: Offer | undefined;
  saveStore((store) => {
    const idx = store.offers.findIndex((o) => o.id === id);
    if (idx < 0) return;
    updated = {
      ...store.offers[idx],
      ...input,
      id,
      updated_at: new Date().toISOString(),
    };
    store.offers[idx] = updated;
  });
  return updated;
}

export function deleteOffer(id: number) {
  saveStore((store) => {
    store.offers = store.offers.filter((o) => o.id !== id);
  });
}
