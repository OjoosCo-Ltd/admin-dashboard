import type { NextRequest } from "next/server";
import { z } from "zod";

import { ENDPOINTS } from "@/libs/api/endpoints";
import { forwardPublicAuth } from "@/libs/auth/public-auth";

/** Checks the emailed code before the new password is asked for. */
export function POST(request: NextRequest) {
  return forwardPublicAuth(
    request,
    ENDPOINTS.auth.passwordResetVerifyOtp,
    z.object({ email: z.email(), otpCode: z.string().regex(/^\d{4,8}$/) }),
    "Enter the code from the email.",
  );
}
