"use client";

import { cn } from "cn";
import { Dialog as DialogPrimitive } from "radix-ui";
import type { ComponentProps } from "react";

import { ACTION_DIALOG_SCRIM } from "@/components/dashboard/action-dialog";
import { DialogOverlay, DialogPortal } from "@/components/ui/dialog";

/**
 * The dashboard's right-hand panel (review and preview sheets), under a
 * `<Dialog>` root: the Figma's scrim, a slide-in from the right, and a column
 * the full width of a phone, capped at 600px (pass another `max-w-*` to
 * change it). Set `nestedOpen` while a dialog opened from the sheet is up:
 * that dialog brings its own scrim over the page and the sheet, so this one
 * fades out rather than dimming the page twice.
 */
export function ActionSheetContent({
  nestedOpen = false,
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & { nestedOpen?: boolean }) {
  return (
    <DialogPortal>
      <DialogOverlay
        className={cn(ACTION_DIALOG_SCRIM, "transition-opacity", nestedOpen && "opacity-0")}
      />
      <DialogPrimitive.Content
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-150 flex-col border-l border-border/30 bg-background text-foreground shadow-[-12px_0_32px_rgb(0_0_0/0.08)] duration-200 ease-in-out outline-none dark:border-border data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-right-10 data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-right-10",
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}
