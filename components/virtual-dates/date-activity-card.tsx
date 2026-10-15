"use client";

import { cn } from "cn";
import { useState } from "react";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DateActivityPoint } from "@/types/virtual-dates";

// The action and review tokens are inlined by Tailwind, so there are no CSS variables to point at.
const chartConfig = {
  bookings: { label: "Bookings", color: "#006481" },
  revenue: { label: "Revenue", color: "#486270" },
} satisfies ChartConfig;

const RANGES = [
  { value: "7", label: "Last 7 Days" },
  { value: "30", label: "Last 30 Days" },
];

const count = new Intl.NumberFormat("en-US");
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Labels a week apart from the first day, or every day for a week's range. */
const weeklyTicks = (labels: string[]) =>
  labels.length <= 7 ? labels : labels.filter((_, index) => index % 7 === 0);

/** The Figma's dark callout: the day, then bookings and revenue. */
function ActivityTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: DateActivityPoint }[];
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return (
    <div className="rounded-md bg-[#021f2a] px-2.5 py-2 text-xs/5 font-semibold text-white shadow-lg">
      <p>{point.label}:</p>
      <p>Bookings: {count.format(point.bookings)}</p>
      <p>Rev: {money.format(point.revenue)}</p>
    </div>
  );
}

/** Bookings (solid) and revenue (dashed) per day, over a week or a month. */
export function DateActivityCard({
  data,
  className,
}: {
  data: DateActivityPoint[];
  className?: string;
}) {
  const [range, setRange] = useState("30");
  const points = data.slice(-Number(range));
  const ticks = weeklyTicks(points.map((point) => point.label));
  // Opens on the best revenue day, where the Figma shows its callout.
  const peak = points.reduce(
    (best, point, index) => (point.revenue > points[best].revenue ? index : best),
    0,
  );

  return (
    <DashboardCard className={cn("flex flex-col", className)}>
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div>
          <DashboardCardTitle className="text-xl leading-7">
            Virtual Date Activity
          </DashboardCardTitle>
          <p className="mt-1 max-w-84 text-lg leading-6 text-muted-foreground">
            Performance metrics across the last {range} days
          </p>
        </div>
        <div className="flex items-center gap-5">
          <ul className="flex items-center gap-3 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            {(["bookings", "revenue"] as const).map((key) => (
              <li key={key} className="flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="size-2 rounded-full"
                  style={{ backgroundColor: chartConfig[key].color }}
                />
                {chartConfig[key].label}
              </li>
            ))}
          </ul>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger
              aria-label="Time range"
              className="h-7.5 gap-2 rounded-md border-0 bg-muted px-3 text-xs font-semibold text-foreground data-[size=default]:h-7.5 dark:bg-muted"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="end">
              {RANGES.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-sm">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="relative mt-12 min-h-72 flex-1">
        <ChartContainer
          config={chartConfig}
          className="absolute inset-0 aspect-auto has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50"
        >
          <LineChart
            key={range}
            data={points}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            aria-label={`Bookings and revenue per day, last ${range} days`}
          >
            <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.25} />
            <XAxis
              dataKey="label"
              ticks={ticks}
              interval={0}
              axisLine={{ stroke: "var(--border)", strokeOpacity: 0.4 }}
              tickLine={false}
              height={40}
              // The first and last labels align with the plot's edges, as in the Figma.
              tick={({ x, y, payload }) => (
                <text
                  x={x}
                  y={Number(y) + 22}
                  textAnchor={
                    payload.value === ticks[0]
                      ? "start"
                      : payload.value === ticks.at(-1)
                        ? "end"
                        : "middle"
                  }
                  className="fill-[#8c9194] text-[11px] font-semibold uppercase"
                >
                  {payload.value}
                </text>
              )}
            />
            <YAxis yAxisId="bookings" hide domain={[0, "dataMax + 10"]} />
            <YAxis yAxisId="revenue" hide orientation="right" domain={[0, "dataMax + 400"]} />
            <Tooltip
              defaultIndex={peak}
              cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
              content={<ActivityTooltip />}
            />
            <Line
              yAxisId="bookings"
              dataKey="bookings"
              type="monotone"
              stroke="var(--color-bookings)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0, fill: "var(--color-bookings)" }}
              isAnimationActive={false}
            />
            <Line
              yAxisId="revenue"
              dataKey="revenue"
              type="monotone"
              stroke="var(--color-revenue)"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0, fill: "var(--color-revenue)" }}
              isAnimationActive={false}
            />
          </LineChart>
        </ChartContainer>
      </div>

      <div className="sr-only">
        <table>
          <caption>Bookings and revenue per day, last {range} days</caption>
          <thead>
            <tr>
              <th scope="col">Day</th>
              <th scope="col">Bookings</th>
              <th scope="col">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.label}>
                <th scope="row">{point.label}</th>
                <td>{count.format(point.bookings)}</td>
                <td>{money.format(point.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
}
