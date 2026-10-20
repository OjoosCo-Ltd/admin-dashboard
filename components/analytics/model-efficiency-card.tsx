import { cn } from "cn";

import { formatPercent, HAIRLINE_CARD } from "@/components/analytics/analytics-format";
import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import type { ModelEfficiency } from "@/types/analytics";

const STATUS: Record<ModelEfficiency["status"], { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-success-soft text-success-strong dark:bg-success/15 dark:text-success",
  },
  training: {
    label: "Training",
    className: "bg-action-soft text-action dark:bg-action/30 dark:text-primary",
  },
  paused: {
    label: "Paused",
    className: "bg-muted-strong text-muted-foreground dark:bg-muted",
  },
};

/** The matching model's accuracy, its week-on-week change, and which model is live. */
export function ModelEfficiencyCard({
  model,
  className,
}: {
  model: ModelEfficiency;
  className?: string;
}) {
  const change = model.weeklyChange;
  const status = STATUS[model.status];

  return (
    <DashboardCard className={cn("flex flex-col", HAIRLINE_CARD, className)}>
      <DashboardCardTitle className="text-sm leading-5 font-bold tracking-[0.12em] text-subtle-foreground uppercase">
        AI Model Efficiency
      </DashboardCardTitle>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-x-4">
        <p className="text-[50px] leading-none font-bold text-action dark:text-primary">
          {formatPercent(model.accuracy)}
        </p>
        <p
          className={cn(
            "mb-1 w-min text-[17px] leading-6 font-bold",
            change > 0
              ? "text-success-strong dark:text-success"
              : change < 0
                ? "text-destructive"
                : "text-muted-foreground",
          )}
        >
          <span aria-hidden>
            {change > 0 ? "+" : ""}
            {formatPercent(change)} this week
          </span>
          <span className="sr-only">
            {change === 0
              ? "No change this week"
              : `${change > 0 ? "Up" : "Down"} ${Number(Math.abs(change).toFixed(1))} percentage points this week`}
          </span>
        </p>
      </div>

      {/* The bottom margin keeps the footer's divider off the text where the card isn't stretched. */}
      <p className="mt-5.5 mb-6 max-w-50 text-sm leading-5 text-muted-foreground">
        {model.description}
      </p>

      <div className="mt-auto flex items-center justify-between gap-4 border-t border-border/20 pt-6 dark:border-border">
        <p className="max-w-36 text-xs leading-4 font-semibold text-outline dark:text-muted-foreground">
          Model {model.model}
        </p>
        <span
          className={cn(
            "shrink-0 rounded-sm px-2 py-1 text-[11px] leading-4 font-bold tracking-wide uppercase",
            status.className,
          )}
        >
          {status.label}
        </span>
      </div>
    </DashboardCard>
  );
}
