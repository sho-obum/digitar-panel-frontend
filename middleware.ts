import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

// 🟢 Define public routes that don’t need authentication
const publicRoutes = [
  "/login",
  "/signup",
  "/forgot-password",
  "/api/auth",
  "/api/app-detail",
  "/public",
  "/favicon.ico",
  "/_next",
  "/images",
  "/api/admin/signup",
];

// 🧠 Helper: Check if a route is public
function isPublicPath(pathname: string) {
  return publicRoutes.some((route) => pathname.startsWith(route));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log("🌐 Middleware checking path:", pathname);

  if (isPublicPath(pathname)) {
    console.log("✅ Public route — skipping authentication");
    return NextResponse.next();
  }

  // 🔐 Try reading the NextAuth session token from cookies
  const token =
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value;

  if (!token) {
    console.log("🚫 No NextAuth session token found — redirecting to /login");
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // 🔍 Verify JWT token using JOSE
    const { payload } = await jwtVerify(token, AUTH_SECRET);
    console.log("✅ JWT verified for user:", payload?.email || "unknown");

    // ✅ Token valid → continue
    return NextResponse.next();
  } catch (err) {
    console.error("❌ Invalid or expired JWT:", err);
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
