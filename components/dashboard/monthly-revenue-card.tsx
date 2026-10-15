import { cn } from "cn";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import type { RevenueLine } from "@/types/dashboard";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 });

// Boosts & Dates reuses Premium's teal in the Figma. success-strong is fixed
// in both themes and too dim on the dark track, so dark mode lightens it.
const FILL: Record<RevenueLine["id"], string> = {
  premium: "bg-primary",
  elite: "bg-success-strong dark:bg-success",
  boosts: "bg-primary",
};

/** This month's revenue by product, each bar sized by its share of the total. */
export function MonthlyRevenueCard({
  lines,
  className,
}: {
  lines: RevenueLine[];
  className?: string;
}) {
  const total = lines.reduce((sum, line) => sum + line.amount, 0);

  return (
    <DashboardCard className={className}>
      <DashboardCardTitle>Monthly Revenue</DashboardCardTitle>
      <ul className="mt-6 flex flex-col gap-3">
        {lines.map((line) => {
          const share = total > 0 ? line.amount / total : 0;
          return (
            <li key={line.id} className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-4 text-[11px] leading-3.5">
                <span className="font-medium text-muted-foreground">{line.label}</span>
                <span className="font-bold">
                  {usd.format(line.amount)}
                  <span className="sr-only">, {percent.format(share)} of the total</span>
                </span>
              </div>
              <div aria-hidden className="h-2 overflow-hidden rounded-full bg-muted">
                <div className={cn("h-full", FILL[line.id])} style={{ width: `${share * 100}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </DashboardCard>
  );
}
