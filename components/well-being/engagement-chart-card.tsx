"use client";

import { cn } from "cn";
import { useId, useState } from "react";
import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { EngagementRange, EngagementSeries } from "@/types/well-being";

// The action token is inlined by Tailwind, so there's no CSS variable to point at.
const chartConfig = {
  views: { label: "Resource Views", color: "#006481" },
  sessions: { label: "Coach Sessions", color: "#7cc4e4" },
} satisfies ChartConfig;

const RANGES: { value: EngagementRange; label: string; description: string }[] = [
  { value: "1w", label: "1W", description: "this week" },
  { value: "1m", label: "1M", description: "this month" },
  { value: "1y", label: "1Y", description: "this year" },
];

const count = new Intl.NumberFormat("en-US");
const short = new Intl.NumberFormat("en-US", { notation: "compact" });

/**
 * Resource views as a soft area and coach sessions as a line, over a week, a
 * month or a year. The Figma draws only the area but lists both in its legend.
 */
export function EngagementChartCard({
  data,
  className,
}: {
  data: Record<EngagementRange, EngagementSeries>;
  className?: string;
}) {
  const [range, setRange] = useState<EngagementRange>("1m");
  const fillId = useId();
  const series = data[range];
  const { description } = RANGES.find((option) => option.value === range) ?? RANGES[1];
  const tickLabel = new Map(series.ticks.map((tick) => [tick.x, tick.label]));
  const maxX = Math.max(
    ...series.points.map((point) => point.x),
    ...series.ticks.map((tick) => tick.x),
  );

  return (
    <DashboardCard className={cn("flex flex-col", className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <DashboardCardTitle className="text-[22px] leading-7 font-semibold">
          Well-being Engagement
        </DashboardCardTitle>
        <div role="group" aria-label="Time range" className="flex gap-1.5">
          {RANGES.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={option.value === range}
              onClick={() => setRange(option.value)}
              className={cn(
                "h-6 min-w-8 rounded-sm px-2 text-xs font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                option.value === range
                  ? "bg-action-icon text-white dark:bg-primary dark:text-primary-foreground"
                  : "bg-container text-muted-foreground hover:text-foreground dark:bg-muted",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-8 min-h-82 flex-1">
        <ul className="pointer-events-none absolute top-5 right-6 z-10 flex gap-5 text-sm text-muted-foreground">
          {(["views", "sessions"] as const).map((key) => (
            <li key={key} className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="h-0.75 w-4 rounded-full"
                style={{ backgroundColor: chartConfig[key].color }}
              />
              {chartConfig[key].label}
            </li>
          ))}
        </ul>
        <ChartContainer
          config={chartConfig}
          className="absolute inset-0 aspect-auto has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50 [&_.recharts-cartesian-axis-tick-value]:fill-outline"
        >
          <ComposedChart
            key={range}
            data={series.points}
            margin={{ top: 0, right: 0, bottom: 0, left: -4 }}
            aria-label={`Resource views and coach sessions, ${description}`}
          >
            <defs>
              <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset={0} stopColor="#c6c9cc" stopOpacity={0.9} />
                <stop offset={1} stopColor="#c6c9cc" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            {/* The Figma's tinted plot panel, with faint rules at each tick. */}
            <CartesianGrid
              vertical={false}
              fill="var(--surface)"
              stroke="var(--border)"
              strokeOpacity={0.3}
            />
            <XAxis
              type="number"
              dataKey="x"
              domain={[0, maxX]}
              ticks={series.ticks.map((tick) => tick.x)}
              tickFormatter={(x: number) => tickLabel.get(x) ?? ""}
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              fontSize={12}
              height={32}
              padding={{ left: 14, right: 14 }}
            />
            <YAxis
              yAxisId="views"
              domain={[0, (max: number) => Math.max(15_000, Math.ceil(max / 5_000) * 5_000)]}
              tickCount={4}
              tickFormatter={(value: number) =>
                value === 0 ? "0" : short.format(value).toLowerCase()
              }
              axisLine={false}
              tickLine={false}
              fontSize={12}
              width={36}
            />
            <YAxis
              yAxisId="sessions"
              hide
              orientation="right"
              domain={[0, (max: number) => max * 2.4]}
            />
            <ChartTooltip
              cursor={{ stroke: "var(--border)" }}
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.label}
                  formatter={(value, name) => (
                    <span className="flex w-full justify-between gap-4 text-muted-foreground">
                      {chartConfig[name as keyof typeof chartConfig]?.label ?? name}
                      <span className="font-semibold text-foreground tabular-nums">
                        {count.format(Number(value))}
                      </span>
                    </span>
                  )}
                />
              }
            />
            <Area
              yAxisId="views"
              dataKey="views"
              type="linear"
              stroke="none"
              fill={`url(#${fillId})`}
              fillOpacity={1}
              isAnimationActive={false}
              activeDot={{ r: 4, fill: "var(--color-views)", strokeWidth: 0 }}
            />
            <Line
              yAxisId="sessions"
              dataKey="sessions"
              type="monotone"
              stroke="var(--color-sessions)"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ChartContainer>
      </div>

      <div className="sr-only">
        <table>
          <caption>Resource views and coach sessions, {description}</caption>
          <thead>
            <tr>
              <th scope="col">Period</th>
              <th scope="col">Resource views</th>
              <th scope="col">Coach sessions</th>
            </tr>
          </thead>
          <tbody>
            {series.points.map((point) => (
              <tr key={point.x}>
                <th scope="row">{point.label}</th>
                <td>{count.format(point.views)}</td>
                <td>{count.format(point.sessions)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
}
