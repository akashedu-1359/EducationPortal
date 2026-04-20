import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND = process.env.BACKEND_URL!;
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export async function POST(request: NextRequest) {
  const body = await request.json();

  const res = await fetch(`${BACKEND}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await res.json();

  // Strip refresh token from body before forwarding to browser
  const refreshToken: string | undefined = data.data?.refreshToken;
  if (data.data) delete data.data.refreshToken;

  const response = NextResponse.json(data, { status: res.status });

  if (res.ok && data.success && refreshToken) {
    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
  }

  const role: string | undefined = data.data?.user?.role;
  if (role) {
    response.cookies.set("eduportal_role", role, {
      httpOnly: false,
      secure: true,
      sameSite: "strict",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
  }

  return response;
}
