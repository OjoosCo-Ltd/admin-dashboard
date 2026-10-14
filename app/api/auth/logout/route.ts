import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/libs/env";
import { ENDPOINTS } from "@/libs/api/endpoints";
import { ACCESS_COOKIE } from "@/libs/auth/cookies";
import { clearSession, isCrossSiteRequest } from "@/libs/auth/session";

export async function POST(request: NextRequest) {
  if (isCrossSiteRequest(request)) {
    return NextResponse.json({ message: "Cross-site request blocked" }, { status: 403 });
  }

  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  if (accessToken) {
    // Best effort: the cookies are cleared either way.
    await fetch(`${env.apiUrl}${ENDPOINTS.auth.logout}`, {
      method: "POST",
      headers: { authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(5_000),
    }).catch(() => undefined);
  }

  const response = new NextResponse(null, { status: 204 });
  clearSession(response.cookies);
  return response;
}
