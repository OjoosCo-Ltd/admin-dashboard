import type { ReactNode } from "react";

import { AdminLogo } from "@/components/layout/logo";

/** Logo, a centered AuthCard (rendered by each page) and the security note. */
export default function AuthCardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center bg-surface px-4 py-10">
      <AdminLogo />
      <div className="mt-11 flex w-full justify-center">{children}</div>
      <p className="mt-10 text-center text-xs text-muted-foreground">
        Secure access for authorized administrators only.
      </p>
    </div>
  );
}
