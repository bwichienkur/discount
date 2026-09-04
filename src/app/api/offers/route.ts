import { NextResponse } from "next/server";
import {
  createOffer,
  getBusinessById,
  listActiveOffers,
  listAllOffersAdmin,
} from "@/lib/db";
import { offerSchema, emptyToNull } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region") || undefined;
  const category = searchParams.get("category") || undefined;
  const q = searchParams.get("q") || undefined;
  const freeOnly = searchParams.get("free") === "1";
  const all = searchParams.get("all") === "1";

  if (all) {
    return NextResponse.json({ offers: listAllOffersAdmin() });
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
  if (!getBusinessById(data.business_id)) {
    return NextResponse.json({ error: "Business not found" }, { status: 400 });
  }

  const offer = createOffer({
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

  return NextResponse.json({ offer }, { status: 201 });
}
