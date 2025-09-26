import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value; // Adjust if you use a different cookie/session name

  // Allow public routes
  if (pathname === "/login" || pathname === "/" || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      // Not logged in, redirect to login
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Decode token to get user role (replace with your own logic)
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
    const role = payload.role;

    // Route protection
    if (pathname.startsWith("/admin/dashboard") && role !== "admin") {
      return NextResponse.redirect(new URL("/user/dashboard", request.url));
    }
    if (pathname.startsWith("/user/dashboard") && role !== "user") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
