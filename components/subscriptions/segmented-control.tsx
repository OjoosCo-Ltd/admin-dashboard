"use client";

import { cn } from "cn";
import type { ReactNode } from "react";

/**
 * The subscriptions Figma's period switches (Monthly / Quarterly / Yearly,
 * 30 Days / 90 Days / 1 Year): the chosen option lifts onto white in a grey track.
 */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  /** Names the group for screen readers, e.g. "Billing period". */
  label: string;
  options: readonly { value: T; label: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex max-w-full shrink-0 rounded-lg border border-border/40 bg-muted p-1 dark:border-border",
        className,
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            "flex h-7 items-center gap-1.5 rounded-md px-3.5 text-xs whitespace-nowrap transition-[color,background-color,box-shadow] outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            option.value === value
              ? "bg-background text-action shadow-xs dark:text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
