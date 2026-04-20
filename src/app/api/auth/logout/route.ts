import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND = process.env.BACKEND_URL!;

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("refresh_token")?.value;

  if (refreshToken) {
    await fetch(`${BACKEND}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refresh_token=${refreshToken}`,
      },
    }).catch(() => {});
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete("refresh_token");
  response.cookies.delete("eduportal_role");
  return response;
}
