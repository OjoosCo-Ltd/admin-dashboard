import { NextResponse, type NextRequest } from "next/server";
import type { z } from "zod";

import { isCrossSiteRequest } from "@/libs/auth/session";
import { env } from "@/libs/env";

/**
 * Validates a signed-out auth call (password recovery) and forwards it to the
 * backend. /api/backend can't carry these: it answers 401 without a session.
 */
export async function forwardPublicAuth<T>(
  request: NextRequest,
  path: string,
  schema: z.ZodType<T>,
  invalidMessage: string,
) {
  if (isCrossSiteRequest(request)) {
    return NextResponse.json({ message: "Cross-site request blocked" }, { status: 403 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: invalidMessage }, { status: 400 });
  }

  const upstream = await fetch(`${env.apiUrl}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(parsed.data),
  });
  const body = await upstream.json().catch(() => null);
  return NextResponse.json(body ?? {}, { status: upstream.status });
}
