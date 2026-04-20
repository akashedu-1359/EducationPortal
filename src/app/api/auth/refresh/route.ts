import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL!;
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json({ success: false, error: "No refresh token." }, { status: 401 });
  }

  const res = await fetch(`${BACKEND}/api/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `refresh_token=${refreshToken}`,
    },
    body: JSON.stringify({}),
    cache: "no-store",
  });

  const data = await res.json();

  // Strip refresh token from body before forwarding to browser
  const newRefreshToken: string | undefined = data.data?.refreshToken;
  if (data.data) delete data.data.refreshToken;

  const response = NextResponse.json(data, { status: res.status });

  if (res.ok && data.success && newRefreshToken) {
    response.cookies.set("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

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
  } else {
    response.cookies.delete("refresh_token");
    response.cookies.delete("eduportal_role");
  }

  return response;
}
