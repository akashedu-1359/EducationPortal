import { NextResponse, type NextRequest } from "next/server";
import { isMaintenanceBypassPath, isMaintenanceModeEnabled } from "@/lib/maintenance";

const PROTECTED_ROUTES = ["/dashboard", "/checkout", "/exams"];
const AUTH_ROUTES = ["/auth/login", "/auth/register", "/auth/google-callback"];
const ADMIN_ROUTES = ["/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const REFRESH_COOKIE = process.env.NEXT_PUBLIC_REFRESH_COOKIE_NAME || "refresh_token";
  const ROLE_COOKIE = process.env.NEXT_PUBLIC_ROLE_COOKIE_NAME || "eduportal_role";
  const hasSession = request.cookies.has(REFRESH_COOKIE);
  const userRole = request.cookies.get(ROLE_COOKIE)?.value;
  const isAdminUser =
    !!userRole &&
    ["SuperAdmin", "Admin", "ContentManager", "ExamManager", "Analyst"].includes(userRole);

  if (pathname === "/maintenance") {
    const maintenanceEnabled = await isMaintenanceModeEnabled(request.url);
    if (!maintenanceEnabled) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!isMaintenanceBypassPath(pathname)) {
    const maintenanceEnabled = await isMaintenanceModeEnabled(request.url);
    if (maintenanceEnabled && !isAdminUser) {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
  }

  if (hasSession && pathname === "/") {
    return NextResponse.redirect(
      new URL(isAdminUser ? "/admin" : "/dashboard", request.url)
    );
  }

  if (hasSession && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (hasSession && pathname === "/exams") {
    return NextResponse.redirect(new URL("/dashboard/exams", request.url));
  }

  if (!hasSession && PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (
    !hasSession &&
    (pathname.match(/^\/exams\/[^/]+\/attempt/) || pathname.startsWith("/exams/results/"))
  ) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
