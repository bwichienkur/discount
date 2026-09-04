import { NextResponse } from "next/server";
import { getDb, listRegions } from "@/lib/db";
import { businessSchema, emptyToNull } from "@/lib/validators";
import { geocodeGeorgiaAddress } from "@/lib/geocode";
import type { Business } from "@/lib/types";

export async function GET() {
  const businesses = getDb()
    .prepare(
      `
      SELECT b.*, r.name AS region_name, r.slug AS region_slug
      FROM businesses b
      JOIN regions r ON r.id = b.region_id
      ORDER BY b.name ASC
    `,
    )
    .all();
  return NextResponse.json({ businesses, regions: listRegions() });
}

export async function POST(request: Request) {
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

  const info = getDb()
    .prepare(
      `
      INSERT INTO businesses (
        name, category, region_id, address_line1, address_line2,
        city, state, zip, lat, lng, phone, website, active
      ) VALUES (
        @name, @category, @region_id, @address_line1, @address_line2,
        @city, @state, @zip, @lat, @lng, @phone, @website, @active
      )
    `,
    )
    .run({
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

  const business = getDb()
    .prepare("SELECT * FROM businesses WHERE id = ?")
    .get(info.lastInsertRowid) as Business;

  return NextResponse.json({ business }, { status: 201 });
}
