"use client";

import { cn } from "cn";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { TrendPoint } from "@/types/verification";

// The bars are pale tints; the legend's dots are the stronger tones.
const chartConfig = {
  submissions: { label: "Submissions", theme: { light: "#e5f7ff", dark: "#1d3b4b" } },
  approvals: { label: "Approvals", theme: { light: "#88d1ae", dark: "#2f8f5f" } },
} satisfies ChartConfig;

const LEGEND = [
  { key: "submissions", label: "Submissions", dot: "bg-[#b1e3ff] dark:bg-sky-400" },
  { key: "approvals", label: "Approvals", dot: "bg-success" },
];

// The Figma's bars take 32px of each 79px band, and the first and last sit 8px
// in from the padding. As a share of the band, the bars narrow on small screens.
const BAR_SHARE = 32 / 79;
const EDGE_INSET = 8;
// Each band's empty share on either side of its bar (Recharts' barCategoryGap).
const SIDE_GAP = (1 - BAR_SHARE) / 2;

const count = new Intl.NumberFormat("en-US");

/** Submissions per day with that day's approvals drawn inside them. */
export function VerificationTrendsCard({
  data,
  className,
}: {
  data: TrendPoint[];
  className?: string;
}) {
  // Recharts centers each bar in an equal band, leaving a side gap outside the
  // end bars. Moving the chart's edges by `inset` (negative: past the padding)
  // puts those bars EDGE_INSET from it. With n bands across the width W:
  // inset = (n * EDGE_INSET - SIDE_GAP * W) / (n - 2 * SIDE_GAP).
  const bands = data.length;
  const span = bands - 2 * SIDE_GAP;
  const inset = `calc(${(bands * EDGE_INSET) / span}px - ${(SIDE_GAP / span) * 100}%)`;

  return (
    <DashboardCard className={cn("flex flex-col border-border/30 dark:border-border", className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <DashboardCardTitle className="text-xl/7 font-semibold">
          Verification Trends
        </DashboardCardTitle>
        <ul className="flex flex-wrap gap-x-2 gap-y-1">
          {LEGEND.map((item) => (
            <li key={item.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span aria-hidden className={cn("size-2.5 rounded-full", item.dot)} />
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      {data.length > 0 ? (
        <div className="relative mt-6 h-72">
          {/*
            Recharts 3.8 renders tick labels as .recharts-cartesian-axis-tick-value,
            which ChartContainer's own tick selector no longer matches.
          */}
          <ChartContainer
            config={chartConfig}
            className="absolute inset-y-0 aspect-auto rounded-md has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50 [&_.recharts-cartesian-axis-tick-value]:fill-muted-foreground"
            style={{ insetInline: inset }}
          >
            <BarChart
              data={data}
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              barCategoryGap={`${SIDE_GAP * 100}%`}
              // Minus one bar's width: approvals overlay the submissions bar.
              barGap={`-${BAR_SHARE * 100}%`}
              aria-label="Verification submissions and approvals per day"
            >
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tickSize={0}
                tickMargin={20}
                height={34}
                fontSize={11}
                interval={0}
              />
              <YAxis hide domain={[0, "dataMax"]} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              <Bar
                dataKey="submissions"
                fill="var(--color-submissions)"
                isAnimationActive={false}
              />
              <Bar dataKey="approvals" fill="var(--color-approvals)" isAnimationActive={false} />
            </BarChart>
          </ChartContainer>
          {/* sr-only on a wrapper: a table never shrinks below its content, so it would still overflow. */}
          <div className="sr-only">
            <table>
              <caption>Verification submissions and approvals per day</caption>
              <thead>
                <tr>
                  <th scope="col">Day</th>
                  <th scope="col">Submissions</th>
                  <th scope="col">Approvals</th>
                </tr>
              </thead>
              <tbody>
                {data.map((point, index) => (
                  // Day labels repeat across weeks.
                  <tr key={`${point.label}-${index}`}>
                    <th scope="row">{point.label}</th>
                    <td>{count.format(point.submissions)}</td>
                    <td>{count.format(point.approvals)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="mt-6 flex h-72 items-center justify-center text-sm text-muted-foreground">
          No submissions in this range yet.
        </p>
      )}
    </DashboardCard>
  );
}
