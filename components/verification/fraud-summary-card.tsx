import { cn } from "cn";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import type { FraudSignal } from "@/types/verification";

/** Each tile's tint, and the colors of its figure and note. */
const TILE_STYLES: Record<FraudSignal["id"], { tile: string; value: string; note: string }> = {
  "duplicate-ids": {
    tile: "border-[#f8e4e4] bg-[#fffbfb] dark:border-destructive/30 dark:bg-destructive/10",
    value: "text-destructive",
    note: "text-destructive",
  },
  "forged-documents": {
    tile: "border-[#ebe0d3] bg-caution-soft dark:border-caution/40 dark:bg-caution/15",
    value: "text-caution dark:text-amber-300",
    note: "text-caution dark:text-amber-300",
  },
  "banned-face-match": {
    tile: "border-border/40 bg-surface/50 dark:border-border",
    value: "text-review dark:text-subtle-foreground",
    note: "text-review dark:text-subtle-foreground",
  },
  "sanctioned-countries": {
    tile: "border-border/50 bg-container dark:border-border dark:bg-muted",
    value: "text-foreground",
    note: "text-muted-foreground",
  },
};

/** "09": the Figma pads the counts to two digits. */
const twoDigits = (value: number) => String(value).padStart(2, "0");

/** The fraud signals the checks raised, one tinted tile each. */
export function FraudSummaryCard({
  signals,
  className,
}: {
  signals: FraudSignal[];
  className?: string;
}) {
  return (
    <DashboardCard className={cn("border-border/30 dark:border-border", className)}>
      <DashboardCardTitle className="text-xl/7 font-semibold">
        Fraud Detection Summary
      </DashboardCardTitle>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        {signals.map((signal) => {
          const style = TILE_STYLES[signal.id];
          return (
            <div key={signal.id} className={cn("rounded-md border p-4", style.tile)}>
              <dt className="text-xs/4 text-muted-foreground uppercase">{signal.label}</dt>
              <dd className="mt-1 flex flex-wrap items-baseline gap-x-2.5">
                <span className={cn("text-2xl/8 font-bold", style.value)}>
                  {twoDigits(signal.value)}
                </span>
                <span className={cn("text-xs", style.note)}>{signal.note}</span>
              </dd>
            </div>
          );
        })}
      </dl>
    </DashboardCard>
  );
}
