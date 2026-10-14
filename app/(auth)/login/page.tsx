import type { Metadata } from "next";

import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, expired } = await searchParams;
  return (
    <AuthSplitLayout>
      <LoginForm next={safeNext(next)} expired={expired === "1"} />
    </AuthSplitLayout>
  );
}

/** Same-origin paths only, so `?next=` can't be used as an open redirect. */
function safeNext(next: string | string[] | undefined): string {
  const value = Array.isArray(next) ? next[0] : next;
  if (!value?.startsWith("/")) return "/dashboard";
  // Judge what the browser will navigate to, not the raw string: the URL
  // parser reads "\" as "/", drops tabs and newlines, and collapses dot
  // segments, so "/\evil.com" and "/.//evil.com" both end up protocol-relative.
  try {
    const url = new URL(value, "http://n");
    const path = url.pathname + url.search + url.hash;
    return url.origin === "http://n" && !path.startsWith("//") ? path : "/dashboard";
  } catch {
    return "/dashboard";
  }
}
