import type { NextRequest } from "next/server";
import { z } from "zod";

import { ENDPOINTS } from "@/libs/api/endpoints";
import { forwardPublicAuth } from "@/libs/auth/public-auth";

/** Sets the new password with the emailed code. */
export function POST(request: NextRequest) {
  return forwardPublicAuth(
    request,
    ENDPOINTS.auth.passwordReset,
    z.object({
      email: z.email(),
      otpCode: z.string().regex(/^\d{4,8}$/),
      password: z.string().min(1),
    }),
    "Enter the code and a new password.",
  );
}
