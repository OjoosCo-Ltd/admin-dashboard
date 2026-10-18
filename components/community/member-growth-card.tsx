"use client";

import { cn } from "cn";
import { Bar, BarChart, type BarShapeProps, Rectangle, XAxis, YAxis } from "recharts";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { MemberGrowthWeek } from "@/types/community";

const chartConfig = {
  members: { label: "New members", color: "#cae7f7" },
} satisfies ChartConfig;

const count = new Intl.NumberFormat("en-US");

/**
 * New members per week, the current week in action teal and the rest in
 * info-soft, with no axes, as in the Figma. Its bars sit in the left half of
 * the card; here they share its width.
 */
export function MemberGrowthCard({
  data,
  className,
}: {
  data: MemberGrowthWeek[];
  className?: string;
}) {
  const top = Math.max(1, ...data.map((week) => week.members)) / 0.8;
  const last = data.length - 1;

  // info-soft and action are inlined by Tailwind, so the fills are spelled out.
  const renderBar = (props: BarShapeProps) => (
    <Rectangle
      {...props}
      className={cn(
        props.index === last
          ? "fill-[#006481] dark:fill-primary"
          : "fill-[#cae7f7] dark:fill-info-soft/30",
        props.isActive && "opacity-85",
      )}
    />
  );

  return (
    <DashboardCard className={cn("flex flex-col", className)}>
      <DashboardCardTitle className="text-xl/7 font-semibold">Member Growth</DashboardCardTitle>
      <div className="relative mt-6 min-h-67 flex-1">
        {/* Hidden from assistive tech: the table below carries every value. */}
        <ChartContainer
          aria-hidden
          config={chartConfig}
          initialDimension={{ width: 684, height: 268 }}
          className="absolute inset-0 aspect-auto"
        >
          <BarChart
            data={data}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            barCategoryGap="12%"
            accessibilityLayer={false}
          >
            <XAxis dataKey="label" hide />
            <YAxis hide domain={[0, top]} />
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
                      new members
                    </span>
                  )}
                />
              }
            />
            <Bar dataKey="members" shape={renderBar} isAnimationActive={false} />
          </BarChart>
        </ChartContainer>
        {/* sr-only on a wrapper: a table never shrinks below its content, so it would still overflow. */}
        <div className="sr-only">
          <table>
            <caption>New members per week</caption>
            <thead>
              <tr>
                <th scope="col">Week</th>
                <th scope="col">New members</th>
              </tr>
            </thead>
            <tbody>
              {data.map((week) => (
                <tr key={week.label}>
                  <th scope="row">{week.label}</th>
                  <td>{count.format(week.members)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div aria-hidden className="mt-8 border-t border-border/50 dark:border-border" />
    </DashboardCard>
  );
}
