"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  type BarShapeProps,
  CartesianGrid,
  Rectangle,
  XAxis,
  YAxis,
} from "recharts";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { SegmentedControl } from "@/components/subscriptions/segmented-control";
import { PLAN_COLORS } from "@/components/subscriptions/subscription-badges";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { PlanId } from "@/types/subscriptions";
import { formatCompactMoney, formatWholeMoney } from "@/libs/money";

type Period = "monthly" | "quarterly" | "yearly";

const PERIODS = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
] as const satisfies readonly { value: Period; label: string }[];

const chartConfig = { revenue: { label: "Revenue", color: "#24637a" } } satisfies ChartConfig;

const planId = (name: string) => name.toLowerCase() as PlanId;

/**
 * Revenue by paid plan for the month, quarter or year, with the total above.
 * The Figma draws the axes and labels but no bars, and totals £142.5k; this
 * total is the bars' sum.
 */
export function SubscriptionRevenueCard({
  data,
}: {
  data: Record<Period, { plan: string; revenue: number }[]>;
}) {
  const [period, setPeriod] = useState<Period>("monthly");
  const bars = data[period];
  const total = bars.reduce((sum, bar) => sum + bar.revenue, 0);
  // Round the axis up to a tidy step: £20k a tick for the month, wider for longer periods.
  const step = period === "monthly" ? 20_000 : period === "quarterly" ? 50_000 : 100_000;
  const top = Math.ceil(Math.max(...bars.map((bar) => bar.revenue)) / step) * step;
  const ticks = Array.from({ length: top / step + 1 }, (_, index) => index * step);

  const renderBar = (props: BarShapeProps) => (
    <Rectangle
      {...props}
      className={PLAN_COLORS[planId((props.payload as { plan: string }).plan)].fill}
      fillOpacity={props.isActive ? 0.85 : 1}
    />
  );

  return (
    <DashboardCard className="px-8 py-8 max-sm:px-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <DashboardCardTitle className="text-xl/7 font-semibold">
            Subscription Revenue
          </DashboardCardTitle>
          <p className="mt-1 text-2xl/8 font-bold text-[#24637a] dark:text-primary">
            Total Subscription Revenue: {formatCompactMoney(total)}
          </p>
        </div>
        <SegmentedControl
          label="Revenue period"
          options={PERIODS}
          value={period}
          onChange={setPeriod}
        />
      </div>
      <div className="mt-6 h-64">
        <ChartContainer
          aria-hidden
          config={chartConfig}
          initialDimension={{ width: 1050, height: 256 }}
          className="aspect-auto size-full [&_.recharts-cartesian-axis-tick-value]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/40"
        >
          <BarChart
            data={bars}
            margin={{ top: 8, right: 0, bottom: 0, left: 0 }}
            barCategoryGap="38%"
            accessibilityLayer={false}
          >
            <CartesianGrid vertical={false} horizontalValues={ticks} stroke="currentColor" />
            <XAxis dataKey="plan" tickLine={false} axisLine={false} tickMargin={10} fontSize={13} />
            <YAxis
              domain={[0, top]}
              ticks={ticks}
              tickFormatter={(value: number) => formatCompactMoney(value)}
              tickLine={false}
              axisLine={false}
              width={52}
              fontSize={12}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideIndicator
                  formatter={(value) => (
                    <span className="font-semibold tabular-nums">
                      {formatWholeMoney(Number(value))}
                    </span>
                  )}
                />
              }
            />
            <Bar
              dataKey="revenue"
              shape={renderBar}
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ChartContainer>
      </div>
      <div className="sr-only">
        <table>
          <caption>Revenue by plan, {period}</caption>
          <tbody>
            {bars.map((bar) => (
              <tr key={bar.plan}>
                <th scope="row">{bar.plan}</th>
                <td>{formatWholeMoney(bar.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
}
