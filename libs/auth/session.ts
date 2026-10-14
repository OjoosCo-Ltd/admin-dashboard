import "server-only";

import type { NextRequest, NextResponse } from "next/server";

import { env } from "@/libs/env";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/libs/auth/cookies";

/**
 * The backend session, held in httpOnly cookies so tokens never reach
 * client JavaScript. Every authenticated call goes through
 * app/api/backend/[...path], which reads these cookies and adds the bearer
 * header.
 */
export interface Session {
  accessToken: string;
  refreshToken: string;
  /** Seconds until the access token expires. */
  expiresIn: number;
}

// The access cookie dies slightly before the token does, so the proxy
// refreshes up front instead of sending a request it knows will 401.
const EXPIRY_SKEW_SECONDS = 60;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;
const DEFAULT_TTL = 60 * 60;

type ResponseCookies = NextResponse["cookies"];
type Json = Record<string, unknown>;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
} as const;

const obj = (value: unknown): Json | undefined =>
  value && typeof value === "object" ? (value as Json) : undefined;

const str = (value: unknown): string | undefined =>
  typeof value === "string" && value ? value : undefined;

/**
 * Reads a session out of any auth response. Casing varies by endpoint:
 * /auth/login returns the raw Supabase session in snake_case, while
 * /auth/refresh returns `{ session: { accessToken, refreshToken, expiresAt } }`
 * in camelCase, with `expiresAt` in Unix seconds.
 */
export function normalizeSession(body: unknown, fallbackRefreshToken?: string): Session | null {
  const root = obj(body);
  const data = obj(root?.data);
  const raw = obj(data?.session) ?? obj(root?.session) ?? data ?? root;

  const accessToken = str(raw?.accessToken) ?? str(raw?.access_token);
  if (!accessToken) return null;

  const refreshToken = str(raw?.refreshToken) ?? str(raw?.refresh_token) ?? fallbackRefreshToken;
  if (!refreshToken) return null;

  const expiresAt = Number(raw?.expiresAt ?? raw?.expires_at);
  const expiresIn = Number(raw?.expiresIn ?? raw?.expires_in);
  const ttl =
    Number.isFinite(expiresIn) && expiresIn > 0
      ? expiresIn
      : Number.isFinite(expiresAt) && expiresAt > 0
        ? expiresAt - Math.floor(Date.now() / 1000)
        : DEFAULT_TTL;

  return { accessToken, refreshToken, expiresIn: ttl };
}

export function writeSession(cookies: ResponseCookies, session: Session) {
  cookies.set(ACCESS_COOKIE, session.accessToken, {
    ...cookieOptions,
    maxAge: Math.max(session.expiresIn - EXPIRY_SKEW_SECONDS, 0),
  });
  cookies.set(REFRESH_COOKIE, session.refreshToken, {
    ...cookieOptions,
    maxAge: REFRESH_MAX_AGE,
  });
}

export function clearSession(cookies: ResponseCookies) {
  cookies.delete({ name: ACCESS_COOKIE, path: "/" });
  cookies.delete({ name: REFRESH_COOKIE, path: "/" });
}

export type RefreshOutcome =
  | { session: Session }
  // `definitive` = the backend rejected the refresh token (4xx), so the
  // session is gone. A network error or 5xx leaves the cookies alone.
  | { session: null; definitive: boolean };

// Requests that land together with an expired token share one refresh call
// instead of each spending the refresh token.
const inFlight = new Map<string, Promise<RefreshOutcome>>();

export function refreshSession(refreshToken: string): Promise<RefreshOutcome> {
  let pending = inFlight.get(refreshToken);
  if (!pending) {
    pending = requestRefresh(refreshToken).finally(() => inFlight.delete(refreshToken));
    inFlight.set(refreshToken, pending);
  }
  return pending;
}

async function requestRefresh(refreshToken: string): Promise<RefreshOutcome> {
  try {
    const res = await fetch(`${env.apiUrl}/auth/refresh`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ refreshToken }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      return { session: null, definitive: res.status >= 400 && res.status < 500 };
    }
    // Supabase rotates refresh tokens; keep the old one only if the
    // response leaves the new one out.
    const session = normalizeSession(await res.json(), refreshToken);
    return session ? { session } : { session: null, definitive: true };
  } catch {
    return { session: null, definitive: false };
  }
}

/**
 * True for a state-changing request sent from another site. SameSite=Lax
 * already keeps the cookies off cross-site POSTs; this is the second check.
 */
export function isCrossSiteRequest(request: NextRequest): boolean {
  if (request.method === "GET" || request.method === "HEAD") return false;
  const site = request.headers.get("sec-fetch-site");
  if (site) return site !== "same-origin" && site !== "none";
  const origin = request.headers.get("origin");
  return !!origin && new URL(origin).host !== request.headers.get("host");
}
