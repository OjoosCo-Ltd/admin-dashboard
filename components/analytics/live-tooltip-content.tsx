"use client";

import type { ComponentProps } from "react";

import { ChartTooltipContent } from "@/components/ui/chart";

/**
 * shadcn's chart tooltip inside a polite live region. Recharts' accessibility
 * layer moves the tooltip with the arrow keys, but nothing announces it; this
 * reads each step's values out to screen readers.
 */
export function LiveTooltipContent(props: ComponentProps<typeof ChartTooltipContent>) {
  return (
    <div role="status" aria-live="polite" aria-atomic="true">
      <ChartTooltipContent {...props} />
    </div>
  );
}
