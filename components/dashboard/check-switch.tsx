"use client";

import { CheckIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { Switch as SwitchPrimitive } from "radix-ui";
import type { ComponentProps } from "react";

// The track, and a thumb that overhangs it and carries a check while on.
const SIZES = {
  // Dating Coach availability: a white track when off.
  sm: {
    root: "h-4.5 w-11.5 data-unchecked:bg-background dark:data-unchecked:bg-muted",
    thumb: "size-6.5 data-checked:translate-x-5 data-unchecked:size-5",
    check: "size-3.5",
  },
  // The settings pages: a grey track when off.
  default: {
    root: "h-6 w-12.5 data-unchecked:bg-container dark:data-unchecked:bg-muted",
    thumb: "size-8 data-checked:translate-x-5 data-unchecked:size-6",
    check: "size-4.5",
  },
};

/**
 * The Figma's toggle with a check: a teal track and an overhanging blue thumb
 * when on. shadcn's `Switch` stays for the plain toggles.
 */
export function CheckSwitch({
  size = "default",
  className,
  ...props
}: ComponentProps<typeof SwitchPrimitive.Root> & { size?: keyof typeof SIZES }) {
  const styles = SIZES[size];
  return (
    <SwitchPrimitive.Root
      data-slot="check-switch"
      className={cn(
        "group relative inline-flex shrink-0 items-center rounded-full border outline-none after:absolute after:-inset-2 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-checked:border-action data-checked:bg-action data-unchecked:border-[#dfe3e7] dark:data-unchecked:border-border",
        styles.root,
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "flex items-center justify-center rounded-full shadow-[0_1px_3px_rgb(0_0_0/0.2)] transition-transform data-checked:bg-[#2563eb] data-unchecked:translate-x-0 data-unchecked:border data-unchecked:border-[#dfe3e7] data-unchecked:bg-background dark:data-unchecked:bg-muted-foreground",
          styles.thumb,
        )}
      >
        <CheckIcon
          aria-hidden
          weight="bold"
          className={cn("text-white group-data-unchecked:hidden", styles.check)}
        />
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
}
