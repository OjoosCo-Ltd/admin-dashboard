"use client";

import { cn } from "cn";
import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { CommunityGrowthPoint } from "@/types/community";

// action-icon and the Figma's sky line are fixed tokens with no CSS variable, so they're spelled out.
const chartConfig = {
  activeMembers: { label: "Active Members", theme: { light: "#297d9d", dark: "#5fa9c6" } },
  newMembers: { label: "New Members", theme: { light: "#7bc8ea", dark: "#a8dcf3" } },
} satisfies ChartConfig;

// Outside the chart, where its --color-* variables don't reach.
const LEGEND = [
  { label: chartConfig.activeMembers.label, swatch: "bg-[#297d9d] dark:bg-[#5fa9c6]" },
  { label: chartConfig.newMembers.label, swatch: "bg-[#7bc8ea] dark:bg-[#a8dcf3]" },
];

/** Jan 1 to Jun 1 in days: where each month label sits. */
const MONTHS = [
  { day: 0, label: "Jan" },
  { day: 31, label: "Feb" },
  { day: 59, label: "Mar" },
  { day: 90, label: "Apr" },
  { day: 120, label: "May" },
  { day: 151, label: "Jun" },
];

const count = new Intl.NumberFormat("en-US");
const compact = new Intl.NumberFormat("en-US", { notation: "compact" });

/**
 * Active and new members since January, on the Figma's grey panel: the active
 * line over a faint fill, the new line in sky. The year so far, so the lines
 * stop short of June.
 */
export function CommunityGrowthCard({
  data,
  className,
}: {
  data: CommunityGrowthPoint[];
  className?: string;
}) {
  return (
    <DashboardCard className={cn("flex flex-col", className)}>
      <DashboardCardTitle className="text-xl/7 font-semibold">Community Growth</DashboardCardTitle>
      <div className="relative mt-4 h-48 rounded-xl bg-muted dark:bg-muted/50">
        {/*
          Hidden from assistive tech: the table below carries every value.
          Recharts 3.8 renders tick labels as .recharts-cartesian-axis-tick-value.
        */}
        <ChartContainer
          aria-hidden
          config={chartConfig}
          initialDimension={{ width: 685, height: 192 }}
          className="absolute inset-0 aspect-auto [&_.recharts-cartesian-axis-line]:stroke-[#dfe3e6] dark:[&_.recharts-cartesian-axis-line]:stroke-border [&_.recharts-cartesian-axis-tick-value]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-[#dde1e5] dark:[&_.recharts-cartesian-grid_line]:stroke-border/60"
        >
          <ComposedChart
            data={data}
            margin={{ top: 24, right: 17, bottom: 0, left: 0 }}
            accessibilityLayer={false}
          >
            <CartesianGrid
              vertical={false}
              horizontalValues={[2_500, 5_000, 7_500]}
              strokeDasharray="8 6"
              stroke="currentColor"
            />
            <XAxis
              type="number"
              dataKey="day"
              domain={[0, 151]}
              ticks={MONTHS.map((month) => month.day)}
              tickFormatter={(day: number) =>
                MONTHS.find((month) => month.day === day)?.label ?? ""
              }
              interval={0}
              tickLine={false}
              tickSize={0}
              tickMargin={17}
              height={33}
              fontSize={12}
            />
            <YAxis
              domain={[0, 10_000]}
              ticks={[0, 5_000, 10_000]}
              tickFormatter={(value: number) => compact.format(value).toLowerCase()}
              tickLine={false}
              tickSize={0}
              tickMargin={12}
              width={40}
              fontSize={12}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, [item]) => item?.payload?.label}
                  formatter={(value, name) => (
                    <span className="flex w-full justify-between gap-4 text-muted-foreground">
                      {chartConfig[name as keyof typeof chartConfig].label}
                      <span className="font-semibold text-foreground tabular-nums">
                        {count.format(Number(value))}
                      </span>
                    </span>
                  )}
                />
              }
            />
            <Area
              type="linear"
              dataKey="activeMembers"
              stroke="none"
              fill="var(--color-activeMembers)"
              fillOpacity={0.1}
              tooltipType="none"
              activeDot={false}
              isAnimationActive={false}
            />
            <Line
              type="linear"
              dataKey="newMembers"
              stroke="var(--color-newMembers)"
              strokeWidth={6}
              dot={false}
              activeDot={{ r: 5, stroke: "var(--card)", strokeWidth: 2 }}
              isAnimationActive={false}
            />
            <Line
              type="linear"
              dataKey="activeMembers"
              stroke="var(--color-activeMembers)"
              strokeWidth={6}
              dot={false}
              activeDot={{ r: 5, stroke: "var(--card)", strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ChartContainer>
        {/* sr-only on a wrapper: a table never shrinks below its content, so it would still overflow. */}
        <div className="sr-only">
          <table>
            <caption>Community growth since January</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Active members</th>
                <th scope="col">New members</th>
              </tr>
            </thead>
            <tbody>
              {data.map((point) => (
                <tr key={point.day}>
                  <th scope="row">{point.label}</th>
                  <td>{count.format(point.activeMembers)}</td>
                  <td>{count.format(point.newMembers)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ul aria-hidden className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm">
        {LEGEND.map((series) => (
          <li key={series.label} className="flex items-center gap-2 text-muted-foreground">
            <span className={cn("size-3 rounded-full", series.swatch)} />
            {series.label}
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
