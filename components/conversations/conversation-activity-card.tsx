"use client";

import { cn } from "cn";
import { useId, useState } from "react";
import { Area, AreaChart, CartesianGrid, usePlotArea, XAxis, YAxis } from "recharts";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { GROWTH_RANGES } from "@/components/dashboard/user-growth-card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ActivityRange, ActivitySeries } from "@/types/conversations";

// The Figma's line is the dialogs' action teal (#006481), a fixed token with no
// CSS variable, so it's spelled out.
const chartConfig = {
  value: { label: "Active conversations", theme: { light: "#006481", dark: "var(--chart-1)" } },
} satisfies ChartConfig;

const count = new Intl.NumberFormat("en-US");

// The y-axis is hidden, so the scale only sets the curve's height: every range
// peaks where the Figma's week does, at 92.5% of the plot.
const PEAK_HEIGHT = 0.925;

/**
 * Clips the line and its fill to the plot's width, so they end flush with the
 * first and last day as in the Figma. Recharts' own clip (allowDataOverflow)
 * would also cut the hover dot in half there.
 */
function PlotWidthClip({ id }: { id: string }) {
  const plot = usePlotArea();
  if (!plot) return null;
  return (
    <defs>
      <clipPath id={id}>
        <rect x={plot.x} y={plot.y - plot.height} width={plot.width} height={plot.height * 3} />
      </clipPath>
    </defs>
  );
}

/** Conversations active over the week, month, quarter or year, with a 7D / 30D / 90D / 1Y switch. */
export function ConversationActivityCard({
  data,
  className,
}: {
  data: Record<ActivityRange, ActivitySeries>;
  className?: string;
}) {
  const [range, setRange] = useState<ActivityRange>("7d");
  const id = useId();
  const { points, ticks } = data[range];
  const { description } =
    GROWTH_RANGES.find((option) => option.value === range) ?? GROWTH_RANGES[0];
  const caption = `Conversation activity, ${description.toLowerCase()}`;

  const top = Math.max(1, ...points.map((point) => point.value)) / PEAK_HEIGHT;
  const labels = new Map(ticks.map((tick) => [tick.x, tick.label]));
  // The axis spans the ticks as well as the data, so a range still in progress
  // (the week so far) keeps its last label, and the line stops short of it.
  const xs = [...points, ...ticks].map((item) => item.x);
  const domain: [number, number] = [Math.min(...xs), Math.max(...xs)];

  return (
    <DashboardCard className={cn("flex flex-col", className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <DashboardCardTitle className="text-xl/7 font-semibold">
          Conversation Activity
        </DashboardCardTitle>
        <div
          role="group"
          aria-label="Time range"
          className="flex max-w-full rounded-md bg-muted p-0.5"
        >
          {GROWTH_RANGES.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={option.value === range}
              onClick={() => setRange(option.value)}
              className={cn(
                "h-5.5 rounded-[5px] px-3 text-[11px] font-medium transition-[color,background-color,box-shadow] outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                option.value === range
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {points.length > 0 ? (
        <div className="relative h-81">
          {/*
            Hidden from assistive tech: the table below carries every value.
            The surface overflows so the hover dot on the first and last day
            isn't cut in half. Recharts 3.8 renders tick labels as
            .recharts-cartesian-axis-tick-value, which ChartContainer's own
            tick selector no longer matches.
          */}
          <ChartContainer
            aria-hidden
            config={chartConfig}
            initialDimension={{ width: 683, height: 324 }}
            className="absolute inset-0 aspect-auto [&_.recharts-cartesian-axis-tick-value]:fill-muted-foreground [&_.recharts-cartesian-axis-tick-value]:font-medium [&_.recharts-cartesian-grid_line]:stroke-border/10 dark:[&_.recharts-cartesian-grid_line]:stroke-border/40 [&_.recharts-surface]:overflow-visible"
          >
            {/* top 23.5 centers the 1px grid lines on half pixels, so each fills one pixel row (crisp), at the Figma's heights. */}
            <AreaChart
              data={points}
              margin={{ top: 23.5, right: 0, bottom: 0, left: 0 }}
              accessibilityLayer={false}
            >
              <defs>
                {/* The Figma fades to transparent black, which greys the lower half a touch. */}
                <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="var(--color-value)" stopOpacity={0.095} />
                  <stop offset="1" stopColor="#000" stopOpacity={0} />
                </linearGradient>
              </defs>
              <PlotWidthClip id={`${id}-clip`} />
              {/*
                Four equal bands; the Figma draws the lower four of their five lines.
                A non-default stroke, so ChartContainer's #ccc grid rule leaves them to the class above.
              */}
              <CartesianGrid
                vertical={false}
                horizontalValues={[0, top / 4, top / 2, (top * 3) / 4]}
                stroke="currentColor"
              />
              {/* preserveStartEnd moves the first and last labels inside the plot, flush with its edges. */}
              <XAxis
                type="number"
                dataKey="x"
                domain={domain}
                ticks={ticks.map((tick) => tick.x)}
                tickFormatter={(x: number) => labels.get(x) ?? ""}
                interval="preserveStartEnd"
                axisLine={false}
                tickLine={false}
                tickSize={0}
                tickMargin={31.5}
                height={44.5}
                fontSize={11}
              />
              <YAxis hide domain={[0, top]} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    hideIndicator
                    labelFormatter={(_, [item]) => item?.payload?.label}
                    formatter={(value) => (
                      <span className="text-muted-foreground">
                        <span className="font-semibold text-foreground tabular-nums">
                          {count.format(Number(value))}
                        </span>{" "}
                        active conversations
                      </span>
                    )}
                  />
                }
              />
              {/*
                natural: the Figma's Saturday peak falls between two samples,
                where a monotone curve can't put a peak. It can overshoot on
                spiky data, though; switch to monotone if live data needs it.
                No animation: tweening between ranges of different lengths
                looks broken mid-way.
              */}
              <Area
                type="natural"
                dataKey="value"
                stroke="var(--color-value)"
                strokeWidth={8.3}
                fill={`url(#${id}-fill)`}
                fillOpacity={1}
                clipPath={`url(#${id}-clip)`}
                activeDot={{
                  r: 6,
                  fill: "var(--color-value)",
                  stroke: "var(--card)",
                  strokeWidth: 3,
                }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ChartContainer>
          {/* sr-only on a wrapper: a table never shrinks below its content, so it would still overflow. */}
          <div className="sr-only">
            <table>
              <caption>{caption}</caption>
              <thead>
                <tr>
                  <th scope="col">Period</th>
                  <th scope="col">Active conversations</th>
                </tr>
              </thead>
              <tbody>
                {points.map((point) => (
                  <tr key={point.x}>
                    <th scope="row">{point.label}</th>
                    <td>{count.format(point.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="flex h-81 items-center justify-center text-sm text-muted-foreground">
          No conversations in this range yet.
        </p>
      )}
    </DashboardCard>
  );
}
