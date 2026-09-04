import { z } from "zod";

export const businessSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.enum([
    "restaurant",
    "gym",
    "zoo",
    "aquarium",
    "museum",
    "attraction",
    "other",
  ]),
  region_id: z.coerce.number().int().positive(),
  address_line1: z.string().min(1).max(200),
  address_line2: z.string().max(200).optional().nullable(),
  city: z.string().min(1).max(100),
  state: z.string().length(2).default("GA"),
  zip: z.string().min(5).max(10),
  lat: z.coerce.number().min(-90).max(90).optional().nullable(),
  lng: z.coerce.number().min(-180).max(180).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal("")),
  active: z.coerce.boolean().optional().default(true),
});

export const offerSchema = z.object({
  business_id: z.coerce.number().int().positive(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(4000),
  is_free: z.coerce.boolean().optional().default(false),
  discount_percent: z.coerce.number().min(0).max(100).optional().nullable(),
  discount_details: z.string().max(500).optional().nullable(),
  starts_at: z.string().optional().nullable(),
  ends_at: z.string().optional().nullable(),
  eligibility_notes: z.string().max(2000).optional().nullable(),
  proof_required: z.string().max(500).optional().nullable(),
  source_url: z.string().url().optional().nullable().or(z.literal("")),
  verified_at: z.string().optional().nullable(),
  active: z.coerce.boolean().optional().default(true),
});

export function emptyToNull(value: string | null | undefined) {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
