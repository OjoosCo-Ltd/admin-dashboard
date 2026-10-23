import { ApiError } from "@/libs/api/client";
import type {
  PasswordResetDto,
  PasswordResetRequestDto,
  PasswordResetVerifyOtpDto,
} from "@/types/api-dtos";
import type { AdminUser } from "@/types/auth";

/**
 * Sign-in and sign-out go to this app's own /api/auth/* handlers, not to
 * the backend. Those handlers set and clear the httpOnly session cookies.
 */

export interface LoginInput {
  email: string;
  password: string;
}

export const loginAction = async (input: LoginInput): Promise<AdminUser> => {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data);
  return (data as { user: AdminUser }).user;
};

export const logoutAction = async (): Promise<void> => {
  await fetch("/api/auth/logout", { method: "POST" });
};

async function postAuth(path: string, body: unknown): Promise<unknown> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}

/** Emails a 6-digit reset code. Answers the same whether or not the email has an account. */
export const requestPasswordResetAction = (input: PasswordResetRequestDto) =>
  postAuth("/api/auth/password-reset/request", input);

export const verifyPasswordResetOtpAction = (input: PasswordResetVerifyOtpDto) =>
  postAuth("/api/auth/password-reset/verify-otp", input);

export const resetPasswordAction = (input: PasswordResetDto) =>
  postAuth("/api/auth/password-reset/reset", input);
