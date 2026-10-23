import type { NextRequest } from "next/server";
import { z } from "zod";

import { ENDPOINTS } from "@/libs/api/endpoints";
import { forwardPublicAuth } from "@/libs/auth/public-auth";

/** Emails a password-reset code. */
export function POST(request: NextRequest) {
  return forwardPublicAuth(
    request,
    ENDPOINTS.auth.passwordResetRequest,
    z.object({ email: z.email() }),
    "Enter a valid email.",
  );
}
