import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple constant token — middleware runs in Edge, no Node crypto available.
// Auth API route does the real password validation; middleware checks the cookie value.
const ADMIN_TOKEN = process.env.ADMIN_SESSION_TOKEN || "aiblog-admin-valid-session-2024";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes but not /admin/login
  if (
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/login")
  ) {
    const session = request.cookies.get("admin_session");
    if (!session || session.value !== ADMIN_TOKEN) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
