import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const COOKIE_NAME = "opendoor_admin";

function getSecret() {
  const secret =
    process.env.AUTH_SECRET ||
    (process.env.VERCEL ? "opendoor-ga-vercel-demo-secret" : null);
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function createAdminToken() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export async function applyAdminSession(response: NextResponse) {
  const token = await createAdminToken();
  response.cookies.set(COOKIE_NAME, token, adminCookieOptions());
  return response;
}

export async function clearAdminSessionResponse(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", {
    ...adminCookieOptions(),
    maxAge: 0,
  });
  return response;
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export function checkAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD ?? "opendoor-admin";
  return password === expected;
}
