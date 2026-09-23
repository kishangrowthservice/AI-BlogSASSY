import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes but not /admin/login
  if (
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/login")
  ) {
    const adminToken = process.env.ADMIN_SESSION_TOKEN;
    if (!adminToken) {
      return new NextResponse("Server configuration error: ADMIN_SESSION_TOKEN is not set", {
        status: 500,
      });
    }

    const session = request.cookies.get("admin_session");
    if (!session || session.value !== adminToken) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
