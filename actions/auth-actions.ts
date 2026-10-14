import { ApiError } from "@/libs/api/client";
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
