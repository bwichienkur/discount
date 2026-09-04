import { NextResponse } from "next/server";
import { getDb, getOfferById } from "@/lib/db";
import { offerSchema, emptyToNull } from "@/lib/validators";
import type { Offer } from "@/lib/types";

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
  const { id } = await params;
  const existing = getDb()
    .prepare("SELECT * FROM offers WHERE id = ?")
    .get(Number(id)) as Offer | undefined;
  if (!existing) {
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
  getDb()
    .prepare(
      `
      UPDATE offers SET
        business_id = @business_id,
        title = @title,
        description = @description,
        is_free = @is_free,
        discount_percent = @discount_percent,
        discount_details = @discount_details,
        starts_at = @starts_at,
        ends_at = @ends_at,
        eligibility_notes = @eligibility_notes,
        proof_required = @proof_required,
        source_url = @source_url,
        verified_at = @verified_at,
        active = @active,
        updated_at = datetime('now')
      WHERE id = @id
    `,
    )
    .run({
      id: Number(id),
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
  const { id } = await params;
  getDb().prepare("DELETE FROM offers WHERE id = ?").run(Number(id));
  return NextResponse.json({ ok: true });
}
