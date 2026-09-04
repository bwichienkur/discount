import { NextResponse } from "next/server";
import {
  createBusiness,
  listBusinesses,
  listRegions,
} from "@/lib/db";
import { requireAdminApi } from "@/lib/auth";
import { businessSchema, emptyToNull } from "@/lib/validators";
import { geocodeGeorgiaAddress } from "@/lib/geocode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    businesses: listBusinesses(),
    regions: listRegions(),
  });
}

export async function POST(request: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const json = await request.json();
  const parsed = businessSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  let lat = data.lat ?? null;
  let lng = data.lng ?? null;

  if (lat == null || lng == null) {
    const geo = await geocodeGeorgiaAddress({
      address_line1: data.address_line1,
      city: data.city,
      state: data.state || "GA",
      zip: data.zip,
    });
    if (geo) {
      lat = geo.lat;
      lng = geo.lng;
    }
  }

  const business = createBusiness({
    name: data.name,
    category: data.category,
    region_id: data.region_id,
    address_line1: data.address_line1,
    address_line2: emptyToNull(data.address_line2 ?? null),
    city: data.city,
    state: data.state || "GA",
    zip: data.zip,
    lat,
    lng,
    phone: emptyToNull(data.phone ?? null),
    website: emptyToNull(data.website ?? null),
    active: data.active ? 1 : 0,
  });

  return NextResponse.json({ business }, { status: 201 });
}
