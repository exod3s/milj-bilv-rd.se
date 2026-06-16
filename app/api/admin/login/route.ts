import { NextResponse } from "next/server";
import {
  adminCookieName,
  getAdminCredentials,
  getAdminSessionToken
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { username?: string; password?: string };
  const credentials = getAdminCredentials();

  if (
    body.username !== credentials.username ||
    body.password !== credentials.password
  ) {
    return NextResponse.json(
      { ok: false, error: "Fel användarnamn eller lösenord" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName, getAdminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
  return response;
}
