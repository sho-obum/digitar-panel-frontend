import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

// Public routes that NEVER require auth
const publicRoutes = [
  "/login",
  "/signup",
  "/forgot-password",
  "/api/auth",          
  "/api/test",
  "/api/app-detail",
  "/api/admin/signup",
  "/public",
  "/favicon.ico"
];

// Check if request matches public route
function isPublicPath(pathname: string) {
  return publicRoutes.some((route) => pathname.startsWith(route));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip Next.js internal assets & image loaders
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".svg")
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Read token (HTTP / HTTPS both)
  const token =
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value;

  if (!token) {
    // No session: redirect to login
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify token using JOSE
    await jwtVerify(token, AUTH_SECRET);

    // Token valid → allow page
    return NextResponse.next();

  } catch (error) {
    console.error("❌ Invalid or expired JWT");

    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("expired", "1");
    loginUrl.searchParams.set("redirectTo", pathname);

    return NextResponse.redirect(loginUrl);
  }
}

// Match all pages except static files 
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
