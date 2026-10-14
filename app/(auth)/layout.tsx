import type { ReactNode } from "react";

// Two shells live under here: login and setup render AuthSplitLayout
// themselves; the centered-card screens share the (card) group's layout.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <main className="auth-theme min-h-svh bg-background">{children}</main>;
}
