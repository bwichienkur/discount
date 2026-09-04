import { NextResponse } from "next/server";
import {
  deleteBusiness,
  getBusinessById,
  updateBusiness,
} from "@/lib/db";
import { businessSchema, emptyToNull } from "@/lib/validators";
import { geocodeGeorgiaAddress } from "@/lib/geocode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const business = getBusinessById(Number(id));
  if (!business) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ business });
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const existing = getBusinessById(Number(id));
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

  const business = updateBusiness(Number(id), {
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

  return NextResponse.json({ business });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  deleteBusiness(Number(id));
  return NextResponse.json({ ok: true });
}
