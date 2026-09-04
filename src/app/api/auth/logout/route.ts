import { NextResponse } from "next/server";
import { clearAdminSessionResponse } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  return clearAdminSessionResponse(response);
}
