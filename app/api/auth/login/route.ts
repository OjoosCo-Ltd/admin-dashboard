import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { env } from "@/libs/env";
import { ENDPOINTS } from "@/libs/api/endpoints";
import { isCrossSiteRequest, normalizeSession, writeSession } from "@/libs/auth/session";
import type { AdminUser } from "@/types/auth";

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

// Admins sign in through the same /auth/login as app users, and the backend
// has no /me route that returns a role. So admin access is checked by
// calling an admin endpoint with the new token.
// ⚠️ PROVISIONAL: assumes Moderators can read the overview too. Switch to a
// role-bearing route once the backend adds one.
const ADMIN_PROBE = ENDPOINTS.dashboard.overview;

export async function POST(request: NextRequest) {
  if (isCrossSiteRequest(request)) {
    return NextResponse.json({ message: "Cross-site request blocked" }, { status: 403 });
  }

  const parsed = credentialsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Enter a valid email and password." }, { status: 400 });
  }

  const upstream = await fetch(`${env.apiUrl}${ENDPOINTS.auth.login}`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(parsed.data),
  });
  const body = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    return NextResponse.json(body ?? { message: "Sign-in failed." }, { status: upstream.status });
  }

  const session = normalizeSession(body);
  if (!session) {
    return NextResponse.json({ message: "Unexpected sign-in response." }, { status: 502 });
  }

  const probe = await fetch(`${env.apiUrl}${ADMIN_PROBE}`, {
    headers: { authorization: `Bearer ${session.accessToken}`, accept: "application/json" },
  });
  if (probe.status === 401 || probe.status === 403) {
    return NextResponse.json(
      { message: "This account doesn't have admin access." },
      { status: 403 },
    );
  }

  const response = NextResponse.json({ user: toAdminUser(body, parsed.data.email) });
  writeSession(response.cookies, session);
  return response;
}

/**
 * /auth/login returns `{ status, user, session: { access_token, …, user } }`.
 * `user` is the raw Supabase user. Its `role` is Supabase's "authenticated",
 * not the app role, which is why the admin probe above exists.
 */
function toAdminUser(body: unknown, email: string): AdminUser {
  type Raw = { user?: Record<string, unknown>; session?: { user?: Record<string, unknown> } };
  const raw = body as Raw | null;
  const user = raw?.user ?? raw?.session?.user ?? {};
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const fullName = meta.full_name ?? meta.fullName ?? meta.name;
  return {
    id: typeof user.id === "string" ? user.id : "",
    email: typeof user.email === "string" ? user.email : email,
    fullName: typeof fullName === "string" && fullName ? fullName : null,
  };
}
