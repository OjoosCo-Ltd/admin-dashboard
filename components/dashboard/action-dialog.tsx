"use client";

import { XIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { Dialog as DialogPrimitive, Slot } from "radix-ui";
import type { ComponentProps, ReactNode } from "react";

import { DialogOverlay, DialogPortal } from "@/components/ui/dialog";

/**
 * The Figma's scrim, darker than shadcn's overlay and blurred half as much
 * (2px, against backdrop-blur-xs). Also for the sheets' overlays.
 */
export const ACTION_DIALOG_SCRIM =
  "bg-[rgb(27_28_31/0.4)] supports-backdrop-filter:backdrop-blur-[2px]";

/**
 * The dashboard's modal shell, from the Figma: a darker blurred backdrop
 * than shadcn's DialogContent allows, and a white panel whose body scrolls
 * between a fixed header and footer when the viewport is short.
 */
export function ActionDialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal>
      <DialogOverlay className={ACTION_DIALOG_SCRIM} />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[20px] bg-background text-foreground shadow-[0_24px_48px_-12px_rgb(0_0_0/0.25)] duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

/** Title row with an optional icon tile, a description and the close button. */
export function ActionDialogHeader({
  icon,
  title,
  description,
  className,
  iconClassName,
  titleClassName,
  descriptionClassName,
  closeClassName,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description: ReactNode;
  className?: string;
  /** Overrides the icon tile, e.g. its color. */
  iconClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  /** Overrides the close button, e.g. its glyph size ([&_svg]:size-5.5) or placement. */
  closeClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-start gap-4 border-b px-6 py-6 max-sm:gap-3 max-sm:p-4",
        className,
      )}
    >
      {icon && (
        <span
          aria-hidden
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg bg-action-icon text-white [&_svg]:size-6",
            iconClassName,
          )}
        >
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <DialogPrimitive.Title
          className={cn(
            "text-xl leading-7 font-semibold max-sm:text-lg max-sm:leading-6",
            titleClassName,
          )}
        >
          {title}
        </DialogPrimitive.Title>
        <DialogPrimitive.Description
          className={cn("text-xs text-muted-foreground", descriptionClassName)}
        >
          {description}
        </DialogPrimitive.Description>
      </div>
      <DialogPrimitive.Close
        className={cn(
          "-m-1 rounded-md p-1 text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
          closeClassName,
        )}
      >
        <XIcon aria-hidden weight="bold" className="size-6" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </div>
  );
}

export function ActionDialogBody({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("min-h-0 flex-1 overflow-y-auto p-6 max-sm:p-4", className)} {...props} />
  );
}

export function ActionDialogFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex shrink-0 flex-wrap items-center justify-end gap-4 border-t bg-muted px-6 py-6 max-sm:gap-2 max-sm:p-4",
        className,
      )}
      {...props}
    />
  );
}

/** 11–12px uppercase section label used across the dialogs. `asChild` lends it to a <label>. */
export function ActionDialogLabel({
  asChild = false,
  className,
  ...props
}: ComponentProps<"p"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "p";
  return (
    <Comp
      className={cn(
        "text-xs font-semibold tracking-wider text-muted-foreground uppercase",
        className,
      )}
      {...props}
    />
  );
}
