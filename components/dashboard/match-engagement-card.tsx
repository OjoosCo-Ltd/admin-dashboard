"use client";

import { Pie, PieChart } from "recharts";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { EngagementSegment, MatchEngagement } from "@/types/dashboard";

const percentFormat = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 0,
});
const percent = (value: number) => percentFormat.format(value / 100);

const SEGMENT_COLOR: Record<EngagementSegment["id"], string> = {
  accepted: "var(--chart-1)",
  "active-chat": "var(--chart-4)",
  scheduled: "var(--chart-5)",
};

// Empty: colors live in SEGMENT_COLOR so the legend, outside the chart's CSS
// scope, can share them.
const chartConfig = {} satisfies ChartConfig;

/** Share of matches in each active state: a donut over a track for the inactive rest. */
export function MatchEngagementCard({
  data,
  className,
}: {
  data: MatchEngagement;
  className?: string;
}) {
  const segments = data.segments.map((segment) => ({
    ...segment,
    fill: SEGMENT_COLOR[segment.id],
  }));
  const total = Math.min(
    segments.reduce((sum, segment) => sum + segment.value, 0),
    100,
  );

  return (
    <DashboardCard className={className}>
      <DashboardCardTitle>Match Engagement</DashboardCardTitle>
      <div className="mt-6 flex flex-wrap items-center gap-6">
        <div className="relative size-32 shrink-0">
          {/* Hidden from assistive tech: the legend carries every value. */}
          <ChartContainer
            aria-hidden
            config={chartConfig}
            initialDimension={{ width: 128, height: 128 }}
            className="aspect-square size-full"
          >
            <PieChart accessibilityLayer={false}>
              {/* w-max: the 128px chart would otherwise squeeze the tooltip until it wraps. */}
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
              <Pie
                data={[{ value: 100 }]}
                dataKey="value"
                innerRadius={48}
                outerRadius={64}
                fill="var(--muted)"
                stroke="none"
                tooltipType="none"
                rootTabIndex={-1}
                isAnimationActive={false}
                className="pointer-events-none"
              />
              {/* Radii overshoot by 1px because the 2px surface-colored stroke
                  that separates the segments eats into both edges. */}
              <Pie
                data={segments}
                dataKey="value"
                nameKey="label"
                startAngle={90}
                endAngle={90 - total * 3.6}
                innerRadius={47}
                outerRadius={65}
                stroke="var(--card)"
                strokeWidth={2}
                rootTabIndex={-1}
                isAnimationActive={false}
              />
            </PieChart>
          </ChartContainer>
          <p className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold">{percent(data.activeShare)}</span>{" "}
            <span className="text-[10px] leading-4 text-muted-foreground">Active</span>
          </p>
        </div>
        <ul className="flex flex-col gap-1.5">
          {segments.map((segment) => (
            <li
              key={segment.id}
              className="flex items-center gap-2 text-[11px] leading-4 font-medium"
            >
              <span
                aria-hidden
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: segment.fill }}
              />
              {segment.label}
              <span className="sr-only">: {percent(segment.value)}</span>
            </li>
          ))}
        </ul>
      </div>
    </DashboardCard>
  );
}
