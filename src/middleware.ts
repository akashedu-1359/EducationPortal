import { NextResponse, type NextRequest } from "next/server";

// Routes that require the user to be logged in
const PROTECTED_ROUTES = ["/dashboard", "/checkout"];

// Routes only accessible when NOT logged in
const AUTH_ROUTES = ["/auth/login", "/auth/register", "/auth/google-callback"];

// Admin-only prefixes
const ADMIN_ROUTES = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read session indicator from cookie set by backend upon login.
  // Cookie names come from config so they match across environments.
  // Actual JWT validation is done server-side; middleware only gates routing.
  const REFRESH_COOKIE = process.env.NEXT_PUBLIC_REFRESH_COOKIE_NAME || "refresh_token";
  const ROLE_COOKIE = process.env.NEXT_PUBLIC_ROLE_COOKIE_NAME || "eduportal_role";
  const hasSession = request.cookies.has(REFRESH_COOKIE);
  const userRole = request.cookies.get(ROLE_COOKIE)?.value;

  const isAdminUser =
    userRole &&
    ["SuperAdmin", "Admin", "ContentManager", "ExamManager", "Analyst"].includes(
      userRole
    );

  // Redirect logged-in users away from auth pages
  if (hasSession && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect user routes
  if (
    !hasSession &&
    PROTECTED_ROUTES.some((r) => pathname.startsWith(r))
  ) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protect admin routes
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!hasSession) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isAdminUser) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     * - API routes that don't need middleware
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
