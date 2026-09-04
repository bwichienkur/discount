import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { businessSchema, emptyToNull } from "@/lib/validators";
import { geocodeGeorgiaAddress } from "@/lib/geocode";
import type { Business } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const business = getDb()
    .prepare("SELECT * FROM businesses WHERE id = ?")
    .get(Number(id)) as Business | undefined;
  if (!business) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ business });
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const existing = getDb()
    .prepare("SELECT * FROM businesses WHERE id = ?")
    .get(Number(id)) as Business | undefined;
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

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

  const addressChanged =
    data.address_line1 !== existing.address_line1 ||
    data.city !== existing.city ||
    data.zip !== existing.zip;
  const missingCoords = lat == null || lng == null;

  if (missingCoords || addressChanged) {
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

  getDb()
    .prepare(
      `
      UPDATE businesses SET
        name = @name,
        category = @category,
        region_id = @region_id,
        address_line1 = @address_line1,
        address_line2 = @address_line2,
        city = @city,
        state = @state,
        zip = @zip,
        lat = @lat,
        lng = @lng,
        phone = @phone,
        website = @website,
        active = @active,
        updated_at = datetime('now')
      WHERE id = @id
    `,
    )
    .run({
      id: Number(id),
      name: data.name,
      category: data.category,
      region_id: data.region_id,
      address_line1: data.address_line1,
      address_line2: emptyToNull(data.address_line2 ?? null),
      city: data.city,
      state: data.state || "GA",
      zip: data.zip,
      lat: lat ?? existing.lat,
      lng: lng ?? existing.lng,
      phone: emptyToNull(data.phone ?? null),
      website: emptyToNull(data.website ?? null),
      active: data.active ? 1 : 0,
    });

  const business = getDb()
    .prepare("SELECT * FROM businesses WHERE id = ?")
    .get(Number(id)) as Business;

  return NextResponse.json({ business });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  getDb().prepare("DELETE FROM businesses WHERE id = ?").run(Number(id));
  return NextResponse.json({ ok: true });
}
