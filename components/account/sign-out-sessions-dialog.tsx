"use client";

import {
  DesktopIcon,
  DeviceMobileIcon,
  DeviceMobileSlashIcon,
  type Icon,
  LaptopIcon,
} from "@phosphor-icons/react";
import { cn } from "cn";
import { Dialog as DialogPrimitive } from "radix-ui";
import { type ReactNode, useRef } from "react";
import { toast } from "sonner";

import { ActionDialogContent, ActionDialogFooter } from "@/components/dashboard/action-dialog";
import { ToastButton } from "@/components/dashboard/toast-button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { formatTimeAgo } from "@/components/settings/settings-format";
import type { ActiveSession } from "@/types/settings";

const DEVICE_ICONS: Record<ActiveSession["kind"], Icon> = {
  laptop: LaptopIcon,
  phone: DeviceMobileIcon,
  desktop: DesktopIcon,
};

const CLIENT_LABELS: Record<ActiveSession["client"], string> = {
  web: "Web",
  app: "App",
};

const focusRing = "outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

/**
 * Confirms ending every other admin session. With `sessions` it lists them (the
 * profile, which only shows a count); without, it's the short confirm (Settings ›
 * Security, which already lists them).
 */
export function SignOutSessionsDialog({
  sessions,
  trigger,
}: {
  sessions?: ActiveSession[];
  trigger: ReactNode;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const listed = sessions !== undefined;

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <ActionDialogContent
        className={cn(
          "border border-border/50",
          // The Figma draws the wide one on the page canvas and the short one on white.
          listed ? "max-w-224 bg-surface dark:bg-background" : "max-w-112 bg-background",
        )}
        // The safe choice takes focus first, not the first row's Sign out.
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          cancelRef.current?.focus();
        }}
      >
        <div
          className={cn(
            "flex shrink-0 items-start gap-4 max-sm:gap-3 max-sm:px-4 max-sm:pt-4",
            listed ? "px-8 pt-8" : "px-6 pt-6 pb-6.25 max-sm:pb-4",
          )}
        >
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive-container text-destructive dark:bg-destructive/20"
          >
            <DeviceMobileSlashIcon weight="bold" className="size-5" />
          </span>
          <div className="min-w-0 flex-1 pt-1">
            <DialogPrimitive.Title className="text-xl leading-7 font-semibold max-sm:text-lg max-sm:leading-6">
              Sign Out of All Other Sessions
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="mt-1.5 text-sm/[23px] text-muted-foreground">
              This will end all other active administrator sessions across different devices and
              browsers. You will remain signed in to your current session.
            </DialogPrimitive.Description>
          </div>
        </div>

        {listed && (
          // Scrolls sideways on phones, and down when the viewport is short.
          <div className="min-h-0 flex-1 overflow-auto px-8 pt-3.75 pb-8 max-sm:px-4 max-sm:pb-4">
            <SessionsTable sessions={sessions} />
          </div>
        )}

        <ActionDialogFooter
          className={cn(
            "gap-3 py-[21px] max-sm:flex-col-reverse max-sm:items-stretch dark:border-border",
            listed ? "border-border/50 px-8" : "border-border/40 px-6",
          )}
        >
          <DialogPrimitive.Close asChild>
            <button
              ref={cancelRef}
              type="button"
              className={cn(
                "h-14 rounded-xl border bg-background px-4 text-base font-semibold tracking-wide transition-colors hover:bg-muted max-sm:h-12 dark:border-border dark:bg-input/30 dark:hover:bg-input/50",
                listed
                  ? "border-border/30 text-muted-foreground hover:text-foreground sm:min-w-42.5"
                  : "border-[#d4d6d8]",
                focusRing,
              )}
            >
              Cancel
            </button>
          </DialogPrimitive.Close>
          {/* UI only: no endpoint revokes an admin's other sessions yet. */}
          <DialogPrimitive.Close asChild>
            <button
              type="button"
              onClick={() => toast("Signing out other sessions isn't available yet")}
              className={cn(
                "h-14 rounded-xl bg-destructive px-4 text-base font-semibold tracking-wide text-white transition-colors hover:bg-destructive/90 max-sm:h-12 dark:bg-destructive/60 dark:hover:bg-destructive/70",
                focusRing,
              )}
            >
              Sign Out Other Sessions
            </button>
          </DialogPrimitive.Close>
        </ActionDialogFooter>
      </ActionDialogContent>
    </Dialog>
  );
}

function SessionsTable({ sessions }: { sessions: ActiveSession[] }) {
  return (
    <table className="w-full min-w-160 table-fixed text-left text-base">
      <caption className="sr-only">Active sessions</caption>
      <thead className="text-muted-foreground">
        <tr className="border-b border-border/50 dark:border-border">
          <th scope="col" className="w-[35.6%] py-3 leading-6 font-medium">
            Location &amp; IP
          </th>
          <th scope="col" className="w-[20.6%] py-3 leading-6 font-medium">
            OS &amp; Browser
          </th>
          <th scope="col" className="w-[32.6%] py-3 leading-6 font-medium">
            Last accessed
          </th>
          <th scope="col" className="py-3 leading-6 font-medium">
            Manage
          </th>
        </tr>
      </thead>
      <tbody>
        {sessions.map((session) => {
          const Glyph = DEVICE_ICONS[session.kind];
          const lastActiveAt = session.lastActiveAt;
          return (
            <tr
              key={session.id}
              className="border-b border-border/25 leading-7 last:border-b-0 dark:border-border"
            >
              <td className="pt-3.5 pr-4 pb-3.25 align-top">
                <span className="flex items-start gap-3.5">
                  <Glyph aria-hidden className="mt-0.5 size-6 shrink-0 text-muted-foreground" />
                  <span className="min-w-0">
                    <span className="block truncate">{session.location}</span>
                    <span className="block truncate text-muted-foreground">
                      {CLIENT_LABELS[session.client]} · {session.ip}
                    </span>
                  </span>
                </span>
              </td>
              <td className="pt-3.5 pr-4 pb-3.25 align-top">
                <span className="block truncate">{session.os}</span>
                <span className="block truncate text-muted-foreground">{session.browser}</span>
              </td>
              <td className="pt-3.5 pr-4 pb-3.25 align-top">
                <span className="block">
                  {lastActiveAt === null ? "Just now" : formatTimeAgo(lastActiveAt)}
                </span>
                <span className="block text-muted-foreground">
                  Created {formatTimeAgo(session.createdAt)}
                </span>
              </td>
              <td className="pt-3.5 pb-3.25 align-top">
                {lastActiveAt === null ? (
                  <span className="inline-flex h-8.5 items-center text-muted-foreground">
                    Current
                  </span>
                ) : (
                  <ToastButton
                    message="Signing out a single session isn't available yet"
                    aria-label={`Sign out the ${session.os} ${session.browser} session in ${session.location}`}
                    className={cn(
                      "-mx-1 inline-flex h-8.5 items-center rounded-md px-1 text-destructive hover:underline",
                      focusRing,
                    )}
                  >
                    Sign out
                  </ToastButton>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
