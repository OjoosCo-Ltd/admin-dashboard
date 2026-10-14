import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/libs/auth/cookies";

/**
 * Quick redirect check: is there a session cookie or not. It can't tell if
 * the session is still valid. The /api/backend proxy decides that, and its
 * 401 makes the client sign out.
 */
const PUBLIC_ROUTES = [
  "/login",
  "/setup",
  "/invite",
  "/forgot-password",
  "/forgot-password/check-email",
  "/reset-password",
  "/reset-password/success",
];
/**
 * Public routes a signed-in admin is sent away from. Setup, invitation and
 * password recovery stay reachable, because their links arrive by email and
 * may be opened in a browser that still holds an (often stale) session.
 */
const GUEST_ONLY_ROUTES = ["/login"];
const HOME = "/dashboard";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(ACCESS_COOKIE) || request.cookies.has(REFRESH_COOKIE);

  if (!hasSession && !PUBLIC_ROUTES.includes(pathname)) {
    const login = new URL("/login", request.url);
    if (pathname !== "/") login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }
  if (hasSession && GUEST_ONLY_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL(HOME, request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Skip API routes (they check auth themselves), Next internals and static files.
  matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:ico|png|jpg|jpeg|svg|webp|txt)$).*)"],
};
