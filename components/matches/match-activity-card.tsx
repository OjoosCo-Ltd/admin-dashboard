"use client";

import { cn } from "cn";
import { Bar, Cell, ComposedChart, CartesianGrid, Line, XAxis, YAxis } from "recharts";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { MatchActivityPoint } from "@/types/matches";

const chartConfig = {
  // The action token is inlined by Tailwind, so there's no CSS variable to point at.
  generated: { label: "Generated", color: "#006481" },
  accepted: { label: "Accepted", color: "var(--success)" },
} satisfies ChartConfig;

const count = new Intl.NumberFormat("en-US");

// The Figma deepens the bars toward today: 40% opacity on the oldest, full
// from about two-thirds of the way along.
const barOpacity = (index: number, total: number) =>
  Math.min(1, 0.4 + (0.6 * index) / Math.max(1, Math.round(total * 0.6)));

/**
 * Matches generated per day as bars, with the accepted ones as a line. The
 * Figma draws only the bars but lists both series in its legend.
 */
export function MatchActivityCard({
  data,
  className,
}: {
  data: MatchActivityPoint[];
  className?: string;
}) {
  const max = Math.max(...data.map((point) => point.generated), 1);

  return (
    <DashboardCard className={cn("flex flex-col", className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <DashboardCardTitle className="text-xl leading-7 font-semibold">
          Match Activity
        </DashboardCardTitle>
        <ul className="flex items-center gap-6 text-[13px] font-semibold tracking-wide">
          {(["generated", "accepted"] as const).map((key) => (
            <li key={key} className="flex items-center gap-2.5">
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
      <div className="relative mt-11 min-h-62 flex-1">
        <ChartContainer
          config={chartConfig}
          className="absolute inset-0 aspect-auto rounded-md has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50"
        >
          <ComposedChart
            data={data}
            margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
            barCategoryGap="64%"
            maxBarSize={24}
            aria-label="Matches generated and accepted per day"
          >
            <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
            <XAxis dataKey="label" hide />
            <YAxis hide domain={[0, max]} ticks={[max / 4, max / 2, (max * 3) / 4, max]} />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", opacity: 0.6 }}
              content={
                <ChartTooltipContent
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
            <Bar
              dataKey="generated"
              fill="var(--color-generated)"
              radius={[3, 3, 0, 0]}
              isAnimationActive={false}
            >
              {data.map((point, index) => (
                <Cell key={point.label} fillOpacity={barOpacity(index, data.length)} />
              ))}
            </Bar>
            <Line
              dataKey="accepted"
              type="monotone"
              stroke="var(--color-accepted)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--color-accepted)", strokeWidth: 0 }}
              activeDot={{ r: 4.5, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ChartContainer>
        <table className="sr-only">
          <caption>Matches generated and accepted per day</caption>
          <thead>
            <tr>
              <th scope="col">Day</th>
              <th scope="col">Generated</th>
              <th scope="col">Accepted</th>
            </tr>
          </thead>
          <tbody>
            {data.map((point) => (
              <tr key={point.label}>
                <th scope="row">{point.label}</th>
                <td>{count.format(point.generated)}</td>
                <td>{count.format(point.accepted)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
}
