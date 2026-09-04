import { NextResponse } from "next/server";
import { getDb, listActiveOffers } from "@/lib/db";
import { offerSchema, emptyToNull } from "@/lib/validators";
import type { Offer } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region") || undefined;
  const category = searchParams.get("category") || undefined;
  const q = searchParams.get("q") || undefined;
  const freeOnly = searchParams.get("free") === "1";
  const all = searchParams.get("all") === "1";

  if (all) {
    const offers = getDb()
      .prepare(
        `
        SELECT
          o.*,
          b.name AS business_name,
          b.category,
          r.name AS region_name,
          r.slug AS region_slug
        FROM offers o
        JOIN businesses b ON b.id = o.business_id
        JOIN regions r ON r.id = b.region_id
        ORDER BY o.updated_at DESC
      `,
      )
      .all();
    return NextResponse.json({ offers });
  }

  const offers = listActiveOffers({ region, category, q, freeOnly });
  return NextResponse.json({ offers });
}

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = offerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const business = getDb()
    .prepare("SELECT id FROM businesses WHERE id = ?")
    .get(data.business_id);
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 400 });
  }

  const info = getDb()
    .prepare(
      `
      INSERT INTO offers (
        business_id, title, description, is_free, discount_percent,
        discount_details, starts_at, ends_at, eligibility_notes,
        proof_required, source_url, verified_at, active
      ) VALUES (
        @business_id, @title, @description, @is_free, @discount_percent,
        @discount_details, @starts_at, @ends_at, @eligibility_notes,
        @proof_required, @source_url, @verified_at, @active
      )
    `,
    )
    .run({
      business_id: data.business_id,
      title: data.title,
      description: data.description,
      is_free: data.is_free ? 1 : 0,
      discount_percent: data.is_free ? null : (data.discount_percent ?? null),
      discount_details: emptyToNull(data.discount_details ?? null),
      starts_at: emptyToNull(data.starts_at ?? null),
      ends_at: emptyToNull(data.ends_at ?? null),
      eligibility_notes: emptyToNull(data.eligibility_notes ?? null),
      proof_required: emptyToNull(data.proof_required ?? null),
      source_url: emptyToNull(data.source_url ?? null),
      verified_at: emptyToNull(data.verified_at ?? null),
      active: data.active ? 1 : 0,
    });

  const offer = getDb()
    .prepare("SELECT * FROM offers WHERE id = ?")
    .get(info.lastInsertRowid) as Offer;

  return NextResponse.json({ offer }, { status: 201 });
}
