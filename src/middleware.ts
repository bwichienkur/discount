import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "opendoor_admin";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage =
    pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");

  const isMutatingAdminApi =
    (pathname.startsWith("/api/businesses") ||
      pathname.startsWith("/api/offers") ||
      pathname === "/api/geocode") &&
    request.method !== "GET";

  if (!isAdminPage && !isMutatingAdminApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const secret = process.env.AUTH_SECRET;
  if (!token || !secret) {
    if (isAdminPage) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return NextResponse.next();
  } catch {
    if (isAdminPage) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/api/businesses",
    "/api/businesses/:path*",
    "/api/offers",
    "/api/offers/:path*",
    "/api/geocode",
  ],
};
