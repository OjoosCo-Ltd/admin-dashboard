"use client";

import { cn } from "cn";
import { useState } from "react";
import { Bar, BarChart, type BarShapeProps, Rectangle, XAxis, YAxis } from "recharts";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { GrowthPoint, GrowthRange } from "@/types/dashboard";

/** The ranges both growth charts switch between (here and on the Users page). */
export const GROWTH_RANGES: { value: GrowthRange; label: string; description: string }[] = [
  { value: "7d", label: "7D", description: "Last 7 days" },
  { value: "30d", label: "30D", description: "Last 30 days" },
  { value: "90d", label: "90D", description: "Last 90 days" },
  { value: "1y", label: "1Y", description: "Last 12 months" },
];

const chartConfig = {
  value: { label: "New users", color: "var(--chart-1)" },
} satisfies ChartConfig;

const count = new Intl.NumberFormat("en-US");

// The Figma tints each bar by its value: primary at 5% for the smallest, 40% for the largest.
const MIN_OPACITY = 0.05;
const MAX_OPACITY = 0.4;
const HOVER_LIFT = 0.15;

// Share of each bar's band left empty on either side (the Figma's 57px bars with 22px gaps).
const BAND_GAP = 0.14;

/** New users per day, week or month, with a 7D / 30D / 90D / 1Y switch. */
export function UserGrowthCard({
  data,
  className,
}: {
  data: Record<GrowthRange, GrowthPoint[]>;
  className?: string;
}) {
  const [range, setRange] = useState<GrowthRange>("7d");
  const points = data[range];
  const { description } =
    GROWTH_RANGES.find((option) => option.value === range) ?? GROWTH_RANGES[0];

  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const opacity = (value: number) =>
    max === min
      ? MAX_OPACITY
      : MIN_OPACITY + ((value - min) / (max - min)) * (MAX_OPACITY - MIN_OPACITY);

  const renderBar = (props: BarShapeProps) => (
    <Rectangle
      {...props}
      fillOpacity={
        opacity((props.payload as GrowthPoint).value) + (props.isActive ? HOVER_LIFT : 0)
      }
    />
  );

  // Recharts centers each bar in its band, so the outer half-gaps would inset the
  // first and last bars. Widening the chart by that half-gap (a share of the
  // wrapper's width, hence a percentage) lines them up with the card padding.
  const bleed = (BAND_GAP / (points.length - 2 * BAND_GAP)) * 100;

  return (
    <DashboardCard className={cn("flex flex-col", className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <DashboardCardTitle>User Growth Analysis</DashboardCardTitle>
        <div
          role="group"
          aria-label="Time range"
          className="flex max-w-full gap-1 rounded-md bg-muted p-1"
        >
          {GROWTH_RANGES.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={option.value === range}
              onClick={() => setRange(option.value)}
              className={cn(
                "h-6 w-16.5 rounded-sm text-xs font-semibold tracking-wider transition-[color,background-color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                option.value === range
                  ? "bg-background text-primary shadow-xs"
                  : "text-foreground hover:text-primary",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {points.length > 0 ? (
        <div className="relative mt-10 min-h-64 flex-1">
          {/*
            Recharts 3.8 renders tick labels as .recharts-cartesian-axis-tick-value,
            which ChartContainer's own tick selector no longer matches.
          */}
          <ChartContainer
            config={chartConfig}
            className="absolute inset-y-0 aspect-auto rounded-md has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50 [&_.recharts-cartesian-axis-tick-value]:fill-muted-foreground"
            style={{ insetInline: `-${bleed}%` }}
          >
            <BarChart
              data={points}
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              barCategoryGap={`${BAND_GAP * 100}%`}
              aria-label={`New users, ${description.toLowerCase()}`}
            >
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tickSize={0}
                tickMargin={15}
                height={26}
                fontSize={11}
                interval="preserveStartEnd"
              />
              <YAxis hide domain={[0, "dataMax"]} />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideIndicator
                    formatter={(value) => (
                      <span className="text-muted-foreground">
                        <span className="font-semibold text-foreground tabular-nums">
                          {count.format(Number(value))}
                        </span>{" "}
                        new users
                      </span>
                    )}
                  />
                }
              />
              {/* No animation: tweening between ranges of different lengths looks broken mid-way. */}
              <Bar
                dataKey="value"
                fill="var(--color-value)"
                radius={[4, 4, 0, 0]}
                shape={renderBar}
                activeBar
                isAnimationActive={false}
              />
            </BarChart>
          </ChartContainer>
          <table className="sr-only">
            <caption>New users, {description.toLowerCase()}</caption>
            <thead>
              <tr>
                <th scope="col">Period</th>
                <th scope="col">New users</th>
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={point.label}>
                  <th scope="row">{point.label}</th>
                  <td>{count.format(point.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-10 flex min-h-64 flex-1 items-center justify-center text-sm text-muted-foreground">
          No sign-ups in this range yet.
        </p>
      )}
    </DashboardCard>
  );
}
