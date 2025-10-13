import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  //console.log("🧩 Middleware hit:", pathname, "Token:", !!token);

  // Public routes (no protection)
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/register") ||
    pathname.startsWith("/api/login") ||
    pathname.startsWith("/docs") ||
    pathname.startsWith("/redoc")
  ) {
    return NextResponse.next();
  }

  // If no token, redirect to login
  if (!token) {
    //console.log("🚫 No token found — redirecting to /login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Decode token (try/catch prevents crashes)
  let role = null;
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    role = payload.role;
    //console.log("🧩 Middleware hit:", pathname, "role:", !!role);
  } catch (err) {
    console.warn("⚠️ Invalid token format, redirecting to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based access control
  if (pathname.startsWith("/admin") && role !== "admin") {
    //console.log("⛔ Unauthorized user tried to access admin");
    return NextResponse.redirect(new URL("/user/dashboard", request.url));
  }

  if (pathname.startsWith("/user") && role !== "user") {
    //console.log("⛔ Unauthorized user tried to access user");
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico).*)"],
};
