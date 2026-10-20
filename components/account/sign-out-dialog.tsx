"use client";

import { SignOutIcon } from "@phosphor-icons/react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useState, type ReactNode } from "react";

import { ActionDialogContent } from "@/components/dashboard/action-dialog";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useLogout } from "@/hooks/api";

/**
 * Confirms signing out of this browser. Controlled (open/onOpenChange) or opened by `trigger`.
 * Sign Out is real: it revokes the session, clears the cookies and goes to /login.
 */
export function SignOutDialog({
  open,
  onOpenChange,
  trigger,
  onCloseAutoFocus,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  /** Where focus goes when the dialog was opened without a trigger (e.g. from a menu). */
  onCloseAutoFocus?: (event: Event) => void;
}) {
  const logout = useLogout();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  // A successful sign-out stays busy until /login replaces the page, instead of flashing back to
  // "Sign Out". A failed one (only a network error rejects) frees the dialog again: the session
  // cookies may still be set, so the redirect can land back on the dashboard with it open.
  const busy = logout.isPending || logout.isSuccess;

  function setOpen(next: boolean) {
    if (!next && busy) return;
    if (open === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  return (
    <Dialog open={open ?? uncontrolledOpen} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <ActionDialogContent
        role="alertdialog"
        onCloseAutoFocus={onCloseAutoFocus}
        className="max-w-100 rounded-2xl border border-border/30 dark:border-border"
      >
        <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-6 pt-6 text-center max-sm:px-4">
          <span
            aria-hidden
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-destructive-soft text-destructive dark:bg-destructive/15"
          >
            <SignOutIcon weight="bold" className="size-6" />
          </span>
          <DialogPrimitive.Title className="mt-3 text-xl/7 font-semibold text-foreground">
            Sign Out
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-3 max-w-85 text-sm/5 text-muted-foreground">
            Are you sure you want to sign out of your administrator account? Any unsaved changes may
            be lost.
          </DialogPrimitive.Description>
        </div>
        <div className="flex shrink-0 gap-3 px-6 pt-13 pb-6.5 max-sm:px-4 max-sm:pt-10">
          <DialogPrimitive.Close asChild>
            <button
              type="button"
              disabled={busy}
              className="h-14 min-w-0 flex-1 rounded-xl border border-border/30 bg-background px-3 text-base font-semibold tracking-wider text-muted-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60 dark:border-border"
            >
              Cancel
            </button>
          </DialogPrimitive.Close>
          <button
            type="button"
            onClick={() => logout.mutate()}
            disabled={busy}
            className="h-14 min-w-0 flex-1 rounded-xl bg-destructive px-3 text-base font-semibold tracking-wider text-white shadow-[0_8px_20px_-6px_rgb(0_0_0/0.18)] transition-colors outline-none hover:bg-destructive/90 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-70 dark:bg-destructive/60 dark:shadow-none dark:hover:bg-destructive/70"
          >
            {busy ? "Signing out…" : "Sign Out"}
          </button>
        </div>
      </ActionDialogContent>
    </Dialog>
  );
}
