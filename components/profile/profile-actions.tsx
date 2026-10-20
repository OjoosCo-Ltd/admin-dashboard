"use client";

import { SignOutIcon } from "@phosphor-icons/react";
import { cn } from "cn";

import { SignOutDialog } from "@/components/account/sign-out-dialog";
import { SignOutSessionsDialog } from "@/components/account/sign-out-sessions-dialog";
import type { ActiveSession } from "@/types/settings";

const button =
  "flex h-14.5 items-center justify-center gap-2 rounded-xl border px-4 text-[17px] font-semibold tracking-[0.01em] outline-none focus-visible:ring-3 max-sm:h-12 max-sm:text-base";

/** The page's footer: sign out everywhere else, or out of this browser. Each opens its confirmation. */
export function ProfileActions({ sessions }: { sessions: ActiveSession[] }) {
  return (
    <div className="flex flex-col gap-3 border-t border-border/20 pt-8 sm:flex-row sm:flex-wrap sm:justify-end sm:gap-4 dark:border-border">
      <SignOutSessionsDialog
        sessions={sessions}
        trigger={
          <button
            type="button"
            className={cn(
              button,
              "border-[#dbe1e5] bg-surface text-foreground hover:bg-muted focus-visible:ring-ring/50 dark:border-border dark:bg-transparent",
            )}
          >
            Sign Out of All Other Sessions
          </button>
        }
      />
      <SignOutDialog
        trigger={
          <button
            type="button"
            className={cn(
              button,
              "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15 focus-visible:ring-destructive/30",
            )}
          >
            <SignOutIcon aria-hidden weight="bold" className="size-4.5 shrink-0" />
            Sign Out
          </button>
        }
      />
    </div>
  );
}
