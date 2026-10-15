import { cn } from "cn";
import type { ComponentProps } from "react";

/**
 * The card every dashboard section sits in: white, 1px outline-variant
 * border, 14px corners, a soft drop shadow and 24px padding.
 */
export function DashboardCard({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-6 text-card-foreground shadow-[0_2px_6px_rgb(24_28_30/0.05)]",
        className,
      )}
      {...props}
    />
  );
}

/** The 16px regular title at the top of a dashboard card. */
export function DashboardCardTitle({ className, ...props }: ComponentProps<"h2">) {
  return <h2 className={cn("text-base leading-6 font-normal", className)} {...props} />;
}
