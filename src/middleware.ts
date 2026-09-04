import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "opendoor_admin";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage =
    pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
  const isAdminApi =
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/auth/") &&
    request.method !== "GET";

  // Protect mutating admin APIs and admin UI
  if (!isAdminPage && !(isAdminApi && needsAuth(pathname, request.method))) {
    return NextResponse.next();
  }

  if (isAdminPage || (isAdminApi && needsAuth(pathname, request.method))) {
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

  return NextResponse.next();
}

function needsAuth(pathname: string, method: string) {
  if (pathname.startsWith("/api/auth/")) return false;
  if (pathname.startsWith("/api/geocode") && method === "POST") return true;
  if (
    (pathname.startsWith("/api/businesses") ||
      pathname.startsWith("/api/offers")) &&
    method !== "GET"
  ) {
    return true;
  }
  return false;
}

export const config = {
  matcher: ["/admin/:path*", "/api/businesses/:path*", "/api/offers/:path*", "/api/geocode"],
};
