import type { Business, Category, Offer, OfferWithBusiness, RegionSlug } from "./types";

export interface Region {
  id: number;
  name: string;
  slug: RegionSlug;
}

export interface StoreData {
  regions: Region[];
  businesses: Business[];
  offers: Offer[];
  nextBusinessId: number;
  nextOfferId: number;
}

export function createSeedStore(): StoreData {
  const regions: Region[] = [
    { id: 1, name: "Metro Atlanta", slug: "metro-atlanta" },
    { id: 2, name: "North Georgia", slug: "north-georgia" },
    { id: 3, name: "Middle Georgia", slug: "middle-georgia" },
    { id: 4, name: "Coastal / Southeast", slug: "coastal" },
    { id: 5, name: "Southwest Georgia", slug: "southwest" },
    { id: 6, name: "Statewide", slug: "statewide" },
  ];

  const now = new Date().toISOString();

  const businesses: Business[] = [
    {
      id: 1,
      name: "Savannah Children's Museum",
      category: "museum",
      region_id: 4,
      address_line1: "655 W. Boundary St",
      address_line2: null,
      city: "Savannah",
      state: "GA",
      zip: "31401",
      lat: 32.0817,
      lng: -81.0998,
      phone: null,
      website: "https://www.chsgeorgia.org/scm",
      active: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: 2,
      name: "Demo Metro Grill",
      category: "restaurant",
      region_id: 1,
      address_line1: "100 Peachtree St NE",
      address_line2: null,
      city: "Atlanta",
      state: "GA",
      zip: "30303",
      lat: 33.7557,
      lng: -84.3884,
      phone: "(404) 555-0100",
      website: null,
      active: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: 3,
      name: "North Georgia Family Y",
      category: "gym",
      region_id: 2,
      address_line1: "200 Main St",
      address_line2: null,
      city: "Gainesville",
      state: "GA",
      zip: "30501",
      lat: 34.2979,
      lng: -83.8241,
      phone: "(770) 555-0142",
      website: null,
      active: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: 4,
      name: "Coastal Splash Adventure Park",
      category: "attraction",
      region_id: 4,
      address_line1: "450 Ocean Hwy",
      address_line2: null,
      city: "Brunswick",
      state: "GA",
      zip: "31520",
      lat: 31.1499,
      lng: -81.4915,
      phone: null,
      website: null,
      active: 1,
      created_at: now,
      updated_at: now,
    },
  ];

  const offers: Offer[] = [
    {
      id: 1,
      business_id: 1,
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
      active: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: 2,
      business_id: 2,
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
      active: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: 3,
      business_id: 3,
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
      active: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: 4,
      business_id: 4,
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
      active: 1,
      created_at: now,
      updated_at: now,
    },
  ];

  return {
    regions,
    businesses,
    offers,
    nextBusinessId: 5,
    nextOfferId: 5,
  };
}

export function joinOffer(
  offer: Offer,
  business: Business,
  region: Region,
): OfferWithBusiness {
  return {
    ...offer,
    business_name: business.name,
    category: business.category as Category,
    region_id: business.region_id,
    region_name: region.name,
    region_slug: region.slug,
    address_line1: business.address_line1,
    address_line2: business.address_line2,
    city: business.city,
    state: business.state,
    zip: business.zip,
    lat: business.lat,
    lng: business.lng,
    phone: business.phone,
    website: business.website,
    business_active: business.active,
  };
}

export function isOfferCurrent(offer: Offer, today = new Date()) {
  if (!offer.ends_at) return true;
  const end = new Date(
    offer.ends_at.length === 10 ? `${offer.ends_at}T23:59:59` : offer.ends_at,
  );
  return end >= today;
}
