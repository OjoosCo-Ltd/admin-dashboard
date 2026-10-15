"use client";

import { cn } from "cn";
import { useId, useState } from "react";
import { Area, AreaChart, XAxis, YAxis } from "recharts";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { GROWTH_RANGES } from "@/components/dashboard/user-growth-card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { GrowthPoint, GrowthRange } from "@/types/dashboard";

const chartConfig = {
  value: { label: "Total users", color: "var(--chart-1)" },
} satisfies ChartConfig;

const count = new Intl.NumberFormat("en-US");

const END_DOT_RADIUS = 13;

// Label every nth point (daily, weekly, every third week or month), always ending
// on the last: 30D reads Aug 01, 08, 15, 22 and 31, as in the Figma.
const TICK_STEP: Record<GrowthRange, number> = { "7d": 1, "30d": 7, "90d": 3, "1y": 3 };

function axisTicks(labels: string[], step: number) {
  const last = labels.length - 1;
  return labels.filter(
    (_, index) => index === last || (index % step === 0 && last - index >= step / 2),
  );
}

/** Total users over the chosen range, as a smooth line ending in a dot on today's figure. */
export function GrowthTrendCard({
  data,
  className,
}: {
  data: Record<GrowthRange, GrowthPoint[]>;
  className?: string;
}) {
  const [range, setRange] = useState<GrowthRange>("30d");
  const fillId = useId();
  const points = data[range];
  const ticks = axisTicks(
    points.map((point) => point.label),
    TICK_STEP[range],
  );
  const last = points.length - 1;
  const { description } =
    GROWTH_RANGES.find((option) => option.value === range) ?? GROWTH_RANGES[0];

  return (
    <DashboardCard className={cn("flex flex-col", className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <DashboardCardTitle>User Growth</DashboardCardTitle>
        <div role="group" aria-label="Time range" className="flex gap-1 rounded-lg bg-muted p-1">
          {GROWTH_RANGES.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={option.value === range}
              onClick={() => setRange(option.value)}
              className={cn(
                "h-8 min-w-12 rounded-md px-2.5 text-base font-semibold transition-[color,background-color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                option.value === range
                  ? "bg-background text-primary shadow-xs"
                  : "text-muted-foreground hover:text-primary",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {points.length > 0 ? (
        <div className="@container relative mt-9 min-h-68 flex-1">
          <ChartContainer
            config={chartConfig}
            className="absolute inset-0 aspect-auto rounded-md has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50 [&_.recharts-surface]:overflow-visible"
          >
            <AreaChart
              data={points}
              margin={{ top: END_DOT_RADIUS, right: 0, bottom: 0, left: 0 }}
              aria-label={`Total users, ${description.toLowerCase()}`}
            >
              <defs>
                <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset={0} stopColor="var(--color-value)" stopOpacity={0.07} />
                  <stop offset={1} stopColor="var(--color-value)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                ticks={ticks}
                interval={0}
                axisLine={{ stroke: "var(--border)", strokeOpacity: 0.45 }}
                tickLine={false}
                height={34}
                // The first and last labels align with the plot's edges, as in the Figma.
                tick={({ x, y, payload }) => (
                  <text
                    x={x}
                    y={Number(y) + 20}
                    textAnchor={
                      payload.value === ticks[0]
                        ? "start"
                        : payload.value === ticks.at(-1)
                          ? "end"
                          : "middle"
                    }
                    className={cn(
                      "fill-muted-foreground text-[11px] font-semibold",
                      // A phone-width chart can't fit seven dates; it keeps every other one.
                      ticks.length > 5 &&
                        ticks.indexOf(payload.value) % 2 === 1 &&
                        payload.value !== ticks.at(-1) &&
                        "@max-sm:hidden",
                    )}
                  >
                    {payload.value}
                  </text>
                )}
              />
              <YAxis hide domain={["dataMin", "dataMax"]} />
              <ChartTooltip
                cursor={{ stroke: "var(--border)" }}
                content={
                  <ChartTooltipContent
                    hideIndicator
                    formatter={(value) => (
                      <span className="text-muted-foreground">
                        <span className="font-semibold text-foreground tabular-nums">
                          {count.format(Number(value))}
                        </span>{" "}
                        users
                      </span>
                    )}
                  />
                }
              />
              {/* No animation: tweening between ranges of different lengths looks broken mid-way. */}
              <Area
                dataKey="value"
                type="monotone"
                stroke="var(--color-value)"
                strokeWidth={3.5}
                strokeLinecap="round"
                fill={`url(#${fillId})`}
                fillOpacity={1}
                isAnimationActive={false}
                activeDot={{ r: 5, strokeWidth: 0 }}
                dot={({ index, cx, cy }) =>
                  index === last ? (
                    <circle
                      key="end"
                      cx={cx}
                      cy={cy}
                      r={END_DOT_RADIUS}
                      fill="var(--color-value)"
                    />
                  ) : null
                }
              />
            </AreaChart>
          </ChartContainer>
          <table className="sr-only">
            <caption>Total users, {description.toLowerCase()}</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Total users</th>
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
        <p className="mt-9 flex min-h-68 flex-1 items-center justify-center text-sm text-muted-foreground">
          No users in this range yet.
        </p>
      )}
    </DashboardCard>
  );
}
