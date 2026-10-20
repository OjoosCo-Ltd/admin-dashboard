"use client";

import { DotsThreeIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import Link from "next/link";
import { Bar, BarChart, type BarShapeProps, Rectangle, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SubscriberMonth } from "@/types/subscriptions";
import { formatWholeMoney } from "@/libs/money";

const chartConfig = {
  subscribers: { label: "Subscribers", color: "#86afc0" },
} satisfies ChartConfig;

/**
 * The Figma's ramp, oldest to newest: three pale months, two light teals,
 * two deeper ones and the current month in slate. Spelled out because
 * Tailwind inlines its color tokens.
 */
const RAMP = [
  "#d7eaf4",
  "#d7eaf4",
  "#d7eaf4",
  "#86afc0",
  "#86afc0",
  "#6e9fb2",
  "#6e9fb2",
  "#6b7f8a",
];

const count = new Intl.NumberFormat("en-GB");

/** Subscribers each month (the tooltip adds the month's revenue), deepening toward the present. */
export function SubscriberGrowthCard({
  data,
  className,
}: {
  data: SubscriberMonth[];
  className?: string;
}) {
  const top = Math.max(1, ...data.map((month) => month.subscribers)) / 0.92;
  const shade = (index: number) =>
    RAMP[Math.round((index / Math.max(1, data.length - 1)) * (RAMP.length - 1))];

  const renderBar = (props: BarShapeProps) => (
    <Rectangle {...props} fill={shade(props.index)} fillOpacity={props.isActive ? 0.85 : 1} />
  );

  return (
    <DashboardCard className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between gap-3">
        <DashboardCardTitle className="text-xl/7 font-semibold">
          Subscriber Growth &amp; Revenue
        </DashboardCardTitle>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger
            aria-label="Chart options"
            className="rounded-md p-1 text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=open]:bg-muted"
          >
            <DotsThreeIcon aria-hidden weight="bold" className="size-6" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onSelect={() => toast("Chart export isn't available yet")}>
              Download as CSV
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/analytics">Open in Analytics</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="relative mt-6 min-h-72 flex-1 rounded-lg border border-border/30 bg-muted/60 dark:border-border dark:bg-muted/30">
        <ChartContainer
          aria-hidden
          config={chartConfig}
          initialDimension={{ width: 860, height: 264 }}
          // Absolute, so the chart fills the panel however tall the row makes it.
          className="absolute inset-x-4 top-6 bottom-0 aspect-auto sm:inset-x-11"
        >
          <BarChart
            data={data}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            barCategoryGap="22%"
            accessibilityLayer={false}
          >
            <XAxis dataKey="month" hide />
            <YAxis hide domain={[0, top]} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideIndicator
                  labelFormatter={(_, [item]) => item?.payload?.month}
                  formatter={(_, __, item) => (
                    <span className="flex flex-col text-muted-foreground">
                      <span>
                        <span className="font-semibold text-foreground tabular-nums">
                          {count.format(item.payload.subscribers)}
                        </span>{" "}
                        subscribers
                      </span>
                      <span>
                        <span className="font-semibold text-foreground tabular-nums">
                          {formatWholeMoney(item.payload.revenue)}
                        </span>{" "}
                        revenue
                      </span>
                    </span>
                  )}
                />
              }
            />
            <Bar dataKey="subscribers" shape={renderBar} isAnimationActive={false} />
          </BarChart>
        </ChartContainer>
        {/* sr-only on a wrapper: a table never shrinks below its content, so it would still overflow. */}
        <div className="sr-only">
          <table>
            <caption>Subscribers and revenue by month</caption>
            <thead>
              <tr>
                <th scope="col">Month</th>
                <th scope="col">Subscribers</th>
                <th scope="col">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.map((month) => (
                <tr key={month.month}>
                  <th scope="row">{month.month}</th>
                  <td>{count.format(month.subscribers)}</td>
                  <td>{formatWholeMoney(month.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardCard>
  );
}
