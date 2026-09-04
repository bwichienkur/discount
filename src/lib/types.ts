export type Category =
  | "restaurant"
  | "gym"
  | "zoo"
  | "aquarium"
  | "museum"
  | "attraction"
  | "other";

export type RegionSlug =
  | "metro-atlanta"
  | "north-georgia"
  | "middle-georgia"
  | "coastal"
  | "southwest"
  | "statewide";

export interface Region {
  id: number;
  name: string;
  slug: RegionSlug;
}

export interface Business {
  id: number;
  name: string;
  category: Category;
  region_id: number;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip: string;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  website: string | null;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface Offer {
  id: number;
  business_id: number;
  title: string;
  description: string;
  is_free: number;
  discount_percent: number | null;
  discount_details: string | null;
  starts_at: string | null;
  ends_at: string | null;
  eligibility_notes: string | null;
  proof_required: string | null;
  source_url: string | null;
  verified_at: string | null;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface OfferWithBusiness extends Offer {
  business_name: string;
  category: Category;
  region_id: number;
  region_name: string;
  region_slug: RegionSlug;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip: string;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  website: string | null;
  business_active: number;
}

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "restaurant", label: "Restaurants" },
  { value: "gym", label: "Gyms & recreation" },
  { value: "zoo", label: "Zoos" },
  { value: "aquarium", label: "Aquariums" },
  { value: "museum", label: "Museums" },
  { value: "attraction", label: "Attractions" },
  { value: "other", label: "Other" },
];

export const CATEGORY_LABELS: Record<Category, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label]),
) as Record<Category, string>;
