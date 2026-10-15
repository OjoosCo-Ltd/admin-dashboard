import { StarIcon } from "@phosphor-icons/react/ssr";
import { cn } from "cn";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import type { Satisfaction } from "@/types/virtual-dates";

const rating = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** How ratings spread from one star to five, deepening toward five, with the average. */
export function SatisfactionCard({ data, className }: { data: Satisfaction; className?: string }) {
  const max = Math.max(...data.shares, 1);

  return (
    <DashboardCard className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between gap-4">
        <DashboardCardTitle className="text-xl leading-7">Satisfaction</DashboardCardTitle>
        <p className="flex items-center gap-1 text-xl font-semibold text-[#f59e0c] tabular-nums">
          <StarIcon aria-hidden weight="fill" className="size-4.5" />
          <span className="sr-only">Average rating </span>
          {rating.format(data.average)}
        </p>
      </div>
      <ol className="mt-auto flex h-24 items-end gap-1.5 pt-4">
        {data.shares.map((share, index) => (
          <li key={index} className="flex h-full flex-1 items-end">
            <span className="sr-only">
              {index + 1} star: {share}%
            </span>
            <span
              aria-hidden
              className="block w-full rounded-t-sm bg-action dark:bg-primary"
              style={{
                height: `max(3px, ${(share / max) * 100}%)`,
                opacity: 0.2 + (0.8 * index) / Math.max(data.shares.length - 1, 1),
              }}
            />
          </li>
        ))}
      </ol>
      <div aria-hidden className="mt-1.5 flex justify-between text-xs text-muted-foreground">
        {data.shares.map((_, index) => (
          <span key={index}>{index + 1}★</span>
        ))}
      </div>
    </DashboardCard>
  );
}
