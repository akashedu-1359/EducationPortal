import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL!;
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

function extractCookieValue(setCookieHeaders: string[], name: string): string | null {
  for (const header of setCookieHeaders) {
    const match = header.match(new RegExp(`(?:^|,\\s*)${name}=([^;]+)`));
    if (match) return match[1];
  }
  return null;
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const res = await fetch(`${BACKEND}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  const response = NextResponse.json(data, { status: res.status });

  if (res.ok && data.success) {
    const setCookies = res.headers.getSetCookie?.() ?? [];
    const refreshToken = extractCookieValue(setCookies, "refresh_token");

    if (refreshToken) {
      response.cookies.set("refresh_token", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
      });
    }

    const role = data.data?.user?.role;
    if (role) {
      response.cookies.set("eduportal_role", role, {
        httpOnly: false,
        secure: true,
        sameSite: "strict",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
      });
    }
  }

  return response;
}
