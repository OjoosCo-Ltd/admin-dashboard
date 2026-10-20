"use client";

import { cn } from "cn";
import { useId } from "react";
import { Area, ComposedChart, Line, XAxis, YAxis } from "recharts";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { SafetyTrendPoint } from "@/types/reports";

// The series colors live on the container as custom properties, so dark mode
// can swap in its own steps (validated against the dark card) without a theme hook.
const chartConfig = {
  submitted: { label: "Submitted", color: "var(--trend-submitted)" },
  resolved: { label: "Resolved", color: "var(--trend-resolved)" },
} satisfies ChartConfig;

const count = new Intl.NumberFormat("en-US");

/** Reports submitted against reports resolved, month by month through the year so far. */
export function SafetyTrendsCard({
  data,
  className,
}: {
  data: SafetyTrendPoint[];
  className?: string;
}) {
  const fillId = useId();
  const reported = data.filter((point) => point.submitted !== null);
  const max = Math.max(
    ...reported.map((point) => Math.max(point.submitted ?? 0, point.resolved ?? 0)),
  );

  return (
    <DashboardCard className={cn("flex flex-col px-6 pt-8 pb-6 sm:px-8", className)}>
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div>
          <DashboardCardTitle className="text-xl leading-7 font-semibold">
            Safety Trends
          </DashboardCardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitoring report volume vs resolution throughput.
          </p>
        </div>
        <ul className="flex gap-5 pt-1 text-[13px] font-semibold text-muted-foreground">
          {(["submitted", "resolved"] as const).map((key) => (
            <li key={key} className="flex items-center gap-2">
              <span
                aria-hidden
                className={cn(
                  "size-2.5 rounded-full",
                  key === "submitted"
                    ? "bg-action dark:bg-[#2f9ec4]"
                    : "bg-info-soft dark:bg-[#7fa9c2]",
                )}
              />
              {chartConfig[key].label}
            </li>
          ))}
        </ul>
      </div>

      <ChartContainer
        config={chartConfig}
        className="mt-8 aspect-auto h-80 w-full [--trend-resolved:#afcbda] [--trend-submitted:#006481] has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50 dark:[--trend-resolved:#7fa9c2] dark:[--trend-submitted:#2f9ec4] [&_.recharts-cartesian-axis-tick-value]:fill-review dark:[&_.recharts-cartesian-axis-tick-value]:fill-subtle-foreground"
      >
        <ComposedChart
          data={data}
          margin={{ top: 8, right: 16, bottom: 0, left: 16 }}
          aria-label="Reports submitted and resolved each month this year"
        >
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset={0} stopColor="var(--trend-submitted)" stopOpacity={0.1} />
              <stop offset={1} stopColor="var(--trend-submitted)" stopOpacity={0.06} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
            tickFormatter={(month: string) => month.toUpperCase()}
            axisLine={false}
            tickLine={false}
            tickMargin={14}
            fontSize={10}
            fontWeight={700}
            interval={0}
          />
          <YAxis hide domain={[0, Math.ceil(max * 1.08)]} />
          <ChartTooltip
            cursor={{ stroke: "var(--border)" }}
            content={
              <ChartTooltipContent
                labelFormatter={(month) => `${month} 2026`}
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
            dataKey="submitted"
            type="natural"
            stroke="var(--color-submitted)"
            strokeWidth={2.5}
            fill={`url(#${fillId})`}
            fillOpacity={1}
            isAnimationActive={false}
            activeDot={{
              r: 4,
              fill: "var(--color-submitted)",
              strokeWidth: 2,
              stroke: "var(--card)",
            }}
          />
          <Line
            dataKey="resolved"
            type="natural"
            stroke="var(--color-resolved)"
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
            activeDot={{
              r: 4,
              fill: "var(--color-resolved)",
              strokeWidth: 2,
              stroke: "var(--card)",
            }}
          />
        </ComposedChart>
      </ChartContainer>

      <div className="sr-only">
        <table>
          <caption>Reports submitted and resolved each month, 2026</caption>
          <thead>
            <tr>
              <th scope="col">Month</th>
              <th scope="col">Submitted</th>
              <th scope="col">Resolved</th>
            </tr>
          </thead>
          <tbody>
            {reported.map((point) => (
              <tr key={point.month}>
                <th scope="row">{point.month}</th>
                <td>{count.format(point.submitted ?? 0)}</td>
                <td>{count.format(point.resolved ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
}
