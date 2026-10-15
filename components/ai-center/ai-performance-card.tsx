"use client";

import { cn } from "cn";
import { Bar, Cell, ComposedChart, Line, XAxis, YAxis } from "recharts";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { AiPerformancePoint } from "@/types/ai-center";

// The action and review tokens are inlined by Tailwind, so there are no CSS variables to point at.
const chartConfig = {
  accuracy: { label: "Accuracy", color: "#006481" },
  requests: { label: "Requests", color: "#486270" },
} satisfies ChartConfig;

const count = new Intl.NumberFormat("en-US");

// The Figma tints each bar by its value: about a quarter opacity for the lowest, nine-tenths for the highest.
const MIN_OPACITY = 0.24;
const MAX_OPACITY = 0.91;

// Accuracy only moves a few points, so the bars start well above zero to show it.
const ACCURACY_FLOOR = 85;

/**
 * Daily accuracy as bars on a grey panel, with request volume as a line. The
 * Figma draws only the bars but lists both series in its legend.
 */
export function AiPerformanceCard({
  data,
  className,
}: {
  data: AiPerformancePoint[];
  className?: string;
}) {
  const values = data.map((point) => point.accuracy);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const opacity = (value: number) =>
    max === min
      ? MAX_OPACITY
      : MIN_OPACITY + ((value - min) / (max - min)) * (MAX_OPACITY - MIN_OPACITY);
  // The axis labels under the panel: first, a third and two-thirds along, last.
  const labels =
    data.length > 4
      ? [0, 1 / 3, 2 / 3, 1].map((share) => data[Math.round(share * (data.length - 1))].label)
      : data.map((point) => point.label);

  return (
    <DashboardCard className={cn("flex flex-col", className)}>
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div>
          <DashboardCardTitle className="text-xl leading-7 font-semibold">
            AI Performance Trends
          </DashboardCardTitle>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Platform-wide performance tracking over the last 30 days.
          </p>
        </div>
        <ul className="flex items-center gap-5 pt-1 text-[13px] font-medium">
          {(["accuracy", "requests"] as const).map((key) => (
            <li key={key} className="flex items-center gap-2">
              <span
                aria-hidden
                className="size-3 rounded-full"
                style={{ backgroundColor: chartConfig[key].color }}
              />
              {chartConfig[key].label}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mt-5 h-70 rounded-xl border-b border-border bg-muted px-[9%] pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto size-full has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50"
        >
          <ComposedChart
            data={data}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            // Recharts leaves this gap on both sides of each bar.
            barCategoryGap="8%"
            aria-label="Match accuracy and AI requests over the last 30 days"
          >
            <XAxis dataKey="label" hide />
            <YAxis yAxisId="accuracy" hide domain={[ACCURACY_FLOOR, "dataMax"]} />
            <YAxis yAxisId="requests" hide orientation="right" domain={[0, "dataMax"]} />
            <ChartTooltip
              cursor={{ fill: "var(--background)", opacity: 0.5 }}
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <span className="flex w-full justify-between gap-4 text-muted-foreground">
                      {chartConfig[name as keyof typeof chartConfig]?.label ?? name}
                      <span className="font-semibold text-foreground tabular-nums">
                        {name === "accuracy" ? `${value}%` : count.format(Number(value))}
                      </span>
                    </span>
                  )}
                />
              }
            />
            <Bar
              yAxisId="accuracy"
              dataKey="accuracy"
              fill="var(--color-accuracy)"
              isAnimationActive={false}
            >
              {data.map((point) => (
                <Cell key={point.label} fillOpacity={opacity(point.accuracy)} />
              ))}
            </Bar>
            <Line
              yAxisId="requests"
              dataKey="requests"
              type="monotone"
              stroke="var(--color-requests)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--color-requests)", strokeWidth: 0 }}
              activeDot={{ r: 4.5, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ChartContainer>
      </div>
      <div aria-hidden className="mt-7 flex justify-between text-base text-muted-foreground">
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      {/* A div, not the table, takes sr-only: tables ignore the 1px width and widen the page. */}
      <div className="sr-only">
        <table>
          <caption>Match accuracy and AI requests over the last 30 days</caption>
          <thead>
            <tr>
              <th scope="col">Day</th>
              <th scope="col">Accuracy</th>
              <th scope="col">Requests</th>
            </tr>
          </thead>
          <tbody>
            {data.map((point) => (
              <tr key={point.label}>
                <th scope="row">{point.label}</th>
                <td>{point.accuracy}%</td>
                <td>{count.format(point.requests)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
}
