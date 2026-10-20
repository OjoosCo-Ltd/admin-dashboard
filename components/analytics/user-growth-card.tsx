"use client";

import { cn } from "cn";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  LabelList,
  type LabelProps,
  Line,
  XAxis,
  YAxis,
} from "recharts";

import {
  CONTEXT_LINE_VARS,
  formatCompactCount,
  formatCount,
  HAIRLINE_CARD,
  niceStep,
  RAMP_VARS,
  ramp,
} from "@/components/analytics/analytics-format";
import { LiveTooltipContent } from "@/components/analytics/live-tooltip-content";
import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import type { UserGrowthPoint } from "@/types/analytics";

// Registrations are the story (the page's teal), active users the context line
// beside them. Both count people, so they share one y-axis.
const chartConfig = {
  registrations: { label: "New Registrations", color: ramp(2) },
  activeUsers: { label: "Active Users", color: "var(--context-line)" },
} satisfies ChartConfig;

type SeriesKey = keyof typeof chartConfig;

/** What the tooltip calls each series: spelled out, as the legend is terse. */
const SERIES_DETAIL: Record<SeriesKey, string> = {
  registrations: "new registrations",
  activeUsers: "daily active users (avg.)",
};

// Formatted in UTC so the server's render and the browser's agree.
const monthFormat = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
/** "2026-09" → "September 2026". */
const formatMonth = (month: string) => monthFormat.format(new Date(`${month}-01T00:00:00Z`));

/** Round ticks, at most five intervals from zero up to `top`. */
function axisTicks(top: number) {
  const step = niceStep(top / 5);
  return Array.from({ length: Math.floor(top / step) + 1 }, (_, i) => i * step);
}

/** New registrations each month (columns) against average daily active users (a line). */
export function UserGrowthCard({
  data,
  className,
}: {
  data: UserGrowthPoint[];
  className?: string;
}) {
  const peak = Math.max(
    0,
    ...data.map((point) => Math.max(point.registrations, point.activeUsers)),
  );
  // A little headroom over the highest point, so the line never touches the panel's edge.
  const top = Math.max(peak * 1.06, 10);
  const ticks = axisTicks(top);
  const first = data.at(0);
  const latest = data.at(-1);
  const span = first && latest ? `${formatMonth(first.month)} to ${formatMonth(latest.month)}` : "";

  // Selective direct label: only the latest month's registrations, on its cap.
  // The halo in the panel's color keeps the hover hairline from running through it.
  const renderLatestLabel = ({ x, y, width, value, index }: LabelProps) =>
    index === data.length - 1 ? (
      <text
        x={Number(x) + Number(width) / 2}
        y={Number(y) - 8}
        textAnchor="middle"
        stroke="var(--surface)"
        strokeWidth={4}
        strokeLinejoin="round"
        paintOrder="stroke"
        className="fill-foreground text-[11px] font-semibold"
      >
        {formatCompactCount(Number(value))}
      </text>
    ) : null;

  return (
    <DashboardCard
      className={cn(
        "flex min-w-0 flex-col",
        HAIRLINE_CARD,
        RAMP_VARS,
        CONTEXT_LINE_VARS,
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        {/* The page header's date range doesn't scope this chart, so it states its own span. */}
        <div>
          <DashboardCardTitle className="text-lg leading-7 font-bold">
            User Growth
          </DashboardCardTitle>
          {span && <p className="text-xs leading-4 text-subtle-foreground">{span}</p>}
        </div>
        {/*
          Keys mirror the marks: a block for the columns, a stroke for the line.
          The top margin centers them on the title's line, not on the title and span together.
        */}
        <ul
          aria-label="Legend"
          className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-subtle-foreground"
        >
          <li className="flex items-center gap-2">
            <span aria-hidden className="size-2.5 rounded-[3px] bg-(--ramp-2)" />
            {chartConfig.registrations.label}
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden className="h-0.5 w-3 rounded-full bg-(--context-line)" />
            {chartConfig.activeUsers.label}
          </li>
        </ul>
      </div>

      {data.length > 0 ? (
        <div className="relative mt-6 min-h-72 flex-1 rounded-lg border border-border/15 bg-surface has-focus-visible:ring-3 has-focus-visible:ring-ring">
          {/*
            Recharts 3.8 renders tick labels as .recharts-cartesian-axis-tick-value,
            which ChartContainer's own tick selector no longer matches. On the dark
            panel, half the border all but vanishes, so the grid takes all of it there.
          */}
          <ChartContainer
            config={chartConfig}
            className="absolute inset-0 aspect-auto [&_.recharts-cartesian-axis-tick-value]:fill-subtle-foreground dark:[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border"
          >
            <ComposedChart
              data={data}
              margin={{ top: 16, right: 12, bottom: 8, left: 4 }}
              aria-label={`New registrations and average daily active users each month, ${span}`}
            >
              <CartesianGrid vertical={false} syncWithTicks />
              {/* Thinned from the end, so the labelled latest month always keeps its name. */}
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                fontSize={11}
                interval="equidistantPreserveEnd"
              />
              <YAxis
                domain={[0, top]}
                ticks={ticks}
                tickFormatter={formatCompactCount}
                axisLine={false}
                tickLine={false}
                tickMargin={6}
                width={36}
                fontSize={11}
              />
              <ChartTooltip
                cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                content={
                  <LiveTooltipContent
                    className="min-w-52 gap-2 px-3 py-2"
                    labelClassName="text-foreground"
                    labelFormatter={(_, payload) => {
                      const month = (payload[0]?.payload as UserGrowthPoint | undefined)?.month;
                      return month ? formatMonth(month) : null;
                    }}
                    formatter={(value, name) => {
                      const key = name as SeriesKey;
                      return (
                        <span className="flex w-full items-center gap-2">
                          <span
                            aria-hidden
                            className="h-0.5 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: `var(--color-${key})` }}
                          />
                          <span className="font-semibold text-foreground tabular-nums">
                            {formatCount(Number(value))}
                          </span>
                          <span className="text-muted-foreground">{SERIES_DETAIL[key]}</span>
                        </span>
                      );
                    }}
                  />
                }
              />
              <Bar
                dataKey="registrations"
                fill="var(--color-registrations)"
                barSize={3}
                radius={[1.5, 1.5, 0, 0]}
                activeBar={{ fill: ramp(1) }}
                isAnimationActive={false}
              >
                <LabelList dataKey="registrations" content={renderLatestLabel} />
              </Bar>
              <Line
                dataKey="activeUsers"
                type="monotone"
                stroke="var(--color-activeUsers)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "var(--color-activeUsers)",
                  stroke: "var(--surface)",
                  strokeWidth: 2,
                }}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ChartContainer>
        </div>
      ) : (
        <p className="mt-6 flex min-h-72 flex-1 items-center justify-center rounded-lg border border-border/15 bg-surface text-sm text-muted-foreground">
          No sign-ups recorded for this period yet.
        </p>
      )}

      <div className="sr-only">
        <table>
          <caption>New registrations and average daily active users by month, {span}</caption>
          <thead>
            <tr>
              <th scope="col">Month</th>
              <th scope="col">New registrations</th>
              <th scope="col">Daily active users (avg.)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((point) => (
              <tr key={point.month}>
                <th scope="row">{formatMonth(point.month)}</th>
                <td>{formatCount(point.registrations)}</td>
                <td>{formatCount(point.activeUsers)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
}
