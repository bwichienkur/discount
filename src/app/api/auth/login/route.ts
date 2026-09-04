import { NextResponse } from "next/server";
import { checkAdminPassword, createAdminSession } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { password?: string };
  if (!body.password || !checkAdminPassword(body.password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  await createAdminSession();
  return NextResponse.json({ ok: true });
}
