import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/libs/env";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/libs/auth/cookies";
import {
  clearSession,
  isCrossSiteRequest,
  refreshSession,
  writeSession,
  type Session,
} from "@/libs/auth/session";

/**
 * Same-origin proxy to the backend. `/api/backend/admin/users?page=2` becomes
 * `${API_URL}/admin/users?page=2`, sent with the bearer token from the
 * httpOnly session cookie. It refreshes once on a missing or rejected access
 * token and writes the rotated cookies onto the response.
 */

// Only these request headers go upstream. Cookies stay on this side.
const FORWARDED_REQUEST_HEADERS = ["accept", "content-type"];
// fetch() has already decoded the body, so content-encoding and
// content-length must not be copied back.
const FORWARDED_RESPONSE_HEADERS = ["content-type", "content-disposition", "cache-control"];

async function handler(request: NextRequest, ctx: RouteContext<"/api/backend/[...path]">) {
  if (isCrossSiteRequest(request)) {
    return NextResponse.json({ message: "Cross-site request blocked" }, { status: 403 });
  }

  const { path } = await ctx.params;
  if (path.some((segment) => segment === "." || segment === "..")) {
    return NextResponse.json({ message: "Invalid path" }, { status: 400 });
  }
  const target = `${env.apiUrl}/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;

  // Buffered so the request can be replayed after a refresh.
  const body =
    request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer();

  const send = (accessToken: string) => {
    const headers = new Headers({ authorization: `Bearer ${accessToken}` });
    for (const name of FORWARDED_REQUEST_HEADERS) {
      const value = request.headers.get(name);
      if (value) headers.set(name, value);
    }
    return fetch(target, { method: request.method, headers, body });
  };

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  let accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  let renewed: Session | null = null;

  if (!accessToken) {
    const outcome = await renew(refreshToken);
    if (!outcome.session) return outcome.response;
    renewed = outcome.session;
    accessToken = renewed.accessToken;
  }

  let upstream: Response;
  try {
    upstream = await send(accessToken);
    if (upstream.status === 401 && !renewed) {
      const outcome = await renew(refreshToken);
      if (!outcome.session) return outcome.response;
      renewed = outcome.session;
      upstream = await send(renewed.accessToken);
    }
  } catch {
    return NextResponse.json(
      { message: "Couldn't reach the API.", statusCode: 502 },
      { status: 502 },
    );
  }

  const headers = new Headers();
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  const response = new NextResponse(upstream.body, { status: upstream.status, headers });
  if (renewed) writeSession(response.cookies, renewed);
  return response;
}

type Renewal = { session: Session } | { session: null; response: NextResponse };

/**
 * Swaps the refresh token for a new session. If the backend rejects the
 * token, this returns a 401 and clears the cookies, and the client signs
 * out. A network error or 5xx returns a 503 and keeps the session.
 */
async function renew(refreshToken: string | undefined): Promise<Renewal> {
  if (!refreshToken) return { session: null, response: sessionExpired() };

  const outcome = await refreshSession(refreshToken);
  if (outcome.session) return { session: outcome.session };

  if (!outcome.definitive) {
    return {
      session: null,
      response: NextResponse.json(
        { message: "Couldn't renew the session. Try again.", statusCode: 503 },
        { status: 503 },
      ),
    };
  }
  const response = sessionExpired();
  clearSession(response.cookies);
  return { session: null, response };
}

function sessionExpired() {
  return NextResponse.json({ message: "Session expired", statusCode: 401 }, { status: 401 });
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
