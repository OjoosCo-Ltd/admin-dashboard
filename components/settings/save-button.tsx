import { FloppyDiskIcon } from "@phosphor-icons/react/ssr";
import { cn } from "cn";
import type { ComponentProps } from "react";

/** The settings pages' teal save button, with the Figma's disk icon. */
export function SaveButton({ className, children, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="submit"
      className={cn(
        "flex h-14 items-center justify-center gap-2.5 rounded-xl bg-action px-6 text-[17px] font-semibold tracking-wide text-white outline-none hover:bg-action/90 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60 max-sm:h-12 max-sm:text-base",
        className,
      )}
      {...props}
    >
      <FloppyDiskIcon aria-hidden weight="bold" className="size-5 shrink-0" />
      {children}
    </button>
  );
}

/** The outlined button beside SaveButton. */
export function SecondaryButton({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-14 items-center justify-center rounded-xl border border-[#dbe1e5] bg-background px-6 text-[17px] text-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60 max-sm:h-12 max-sm:text-base dark:border-border",
        className,
      )}
      {...props}
    />
  );
}
