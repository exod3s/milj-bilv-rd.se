import { NextResponse, type NextRequest } from "next/server";
import { adminCookieName, isAdminSession } from "@/lib/admin-auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPath = pathname === "/admin/login" || pathname === "/api/admin/login";

  if (isLoginPath) {
    return NextResponse.next();
  }

  const session = request.cookies.get(adminCookieName)?.value;

  if (!isAdminSession(session)) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ ok: false, error: "Ej inloggad" }, { status: 401 });
    }

    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
};
