import { NextResponse } from "next/server";
import {
  deleteOffer,
  getOfferById,
  getOfferRecord,
  updateOffer,
} from "@/lib/db";
import { requireAdminApi } from "@/lib/auth";
import { offerSchema, emptyToNull } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const offer = getOfferById(Number(id));
  if (!offer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ offer });
}

export async function PUT(request: Request, { params }: Params) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;
  if (!getOfferRecord(Number(id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const json = await request.json();
  const parsed = offerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  updateOffer(Number(id), {
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

  const offer = getOfferById(Number(id));
  return NextResponse.json({ offer });
}

export async function DELETE(_request: Request, { params }: Params) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await params;
  deleteOffer(Number(id));
  return NextResponse.json({ ok: true });
}
