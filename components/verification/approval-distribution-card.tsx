"use client";

import { cn } from "cn";
import { Pie, PieChart } from "recharts";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { ApprovalDistribution, ApprovalSlice } from "@/types/verification";

// Recharts reads these as SVG fills. The attention token is inlined by
// Tailwind, so it has no CSS variable and is spelled out.
const SLICE_COLOR: Record<ApprovalSlice["id"], string> = {
  approved: "var(--success)",
  pending: "#ea580b",
  rejected: "var(--destructive)",
};

const percentFormat = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 0,
});
const percent = (value: number) => percentFormat.format(value / 100);
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

/** How decisions split between approved, pending and rejected, around the total. */
export function ApprovalDistributionCard({
  data,
  className,
}: {
  data: ApprovalDistribution;
  className?: string;
}) {
  const slices = data.slices.map((slice) => ({ ...slice, fill: SLICE_COLOR[slice.id] }));

  return (
    <DashboardCard className={cn("border-border/30 dark:border-border", className)}>
      <DashboardCardTitle className="text-xl/7 font-semibold">
        Approval Distribution
      </DashboardCardTitle>
      <div className="relative mx-auto mt-8 size-44">
        {/* Hidden from assistive tech: the legend carries every value. */}
        <ChartContainer
          aria-hidden
          config={{}}
          initialDimension={{ width: 176, height: 176 }}
          className="aspect-square size-full"
        >
          <PieChart accessibilityLayer={false}>
            {/* w-max: the small chart would otherwise squeeze the tooltip until it wraps. */}
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  className="w-max"
                  formatter={(value, name, item) => (
                    <>
                      <span
                        className="size-2.5 shrink-0 rounded-xs"
                        style={{ backgroundColor: item.payload?.fill }}
                      />
                      <span className="flex flex-1 items-center justify-between gap-4 leading-none">
                        <span className="text-muted-foreground">{name}</span>
                        <span className="font-mono font-medium text-foreground tabular-nums">
                          {percent(Number(value))}
                        </span>
                      </span>
                    </>
                  )}
                />
              }
            />
            {/* Clockwise from 12 o'clock, as in the Figma. */}
            <Pie
              data={slices}
              dataKey="value"
              nameKey="label"
              startAngle={90}
              endAngle={-270}
              innerRadius={65}
              outerRadius={88}
              stroke="none"
              rootTabIndex={-1}
              isAnimationActive={false}
            />
          </PieChart>
        </ChartContainer>
        <p className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {/* The Figma writes thousands as "1.2k". */}
          <span className="text-2xl font-bold">
            {compact.format(data.total).replace(/K$/, "k")}
          </span>{" "}
          <span className="text-[10px] leading-4 tracking-wider text-muted-foreground uppercase">
            Total
          </span>
        </p>
      </div>
      <ul className="mt-8 flex flex-col gap-3">
        {slices.map((slice) => (
          <li key={slice.id} className="flex items-center gap-2 text-sm/6">
            <span
              aria-hidden
              className="size-3 shrink-0 rounded-[3px]"
              style={{ backgroundColor: slice.fill }}
            />
            <span className="flex-1 text-muted-foreground">{slice.label}</span>
            <span className="text-base font-semibold text-foreground">{percent(slice.value)}</span>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
