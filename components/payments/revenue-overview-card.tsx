"use client";

import { cn } from "cn";
import { useId, useState } from "react";
import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { RevenuePoint, RevenueRange } from "@/types/payments";
import { formatCompactMoney, formatWholeMoney } from "@/libs/money";

const RANGES = [
  { value: "7d", label: "7D", description: "Last 7 days" },
  { value: "1m", label: "1M", description: "Last 30 days" },
  { value: "3m", label: "3M", description: "Last 3 months" },
  { value: "ytd", label: "YTD", description: "Year to date" },
] as const satisfies readonly { value: RevenueRange; label: string; description: string }[];

// Fixed teals with no CSS variable, so they're spelled out. On the dark card
// net sits closer to the surface, as it does on white, so gross stays the
// stronger line. Net is a shade deeper than the Figma's #86afc0 (2.4:1 on
// white), so the line meets 3:1.
const chartConfig = {
  gross: { label: "Gross revenue", theme: { light: "#24637a", dark: "#5fa9c6" } },
  net: { label: "Net revenue", theme: { light: "#5f93a8", dark: "#3c7185" } },
} satisfies ChartConfig;

// The legend sits outside the chart, where its --color-* variables don't reach.
const SERIES: Record<"gross" | "net", { label: string; color: string; dash?: string }> = {
  gross: { label: chartConfig.gross.label, color: "text-[#24637a] dark:text-[#5fa9c6]" },
  net: { label: chartConfig.net.label, color: "text-[#5f93a8] dark:text-[#3c7185]", dash: "6 4" },
};

type Series = keyof typeof SERIES;

/** Y-axis ticks from zero in a round step (1, 2, 2.5 or 5 × 10ⁿ), with headroom over the peak. */
function moneyTicks(peak: number) {
  const top = Math.max(peak, 1) * 1.05;
  const magnitude = 10 ** Math.max(0, Math.floor(Math.log10(top / 4)));
  const step = [1, 2, 2.5, 5, 10].map((unit) => unit * magnitude).find((size) => size >= top / 4);
  const size = step ?? magnitude * 10;
  return Array.from({ length: Math.ceil(top / size) + 1 }, (_, index) => index * size);
}

/** A short stroke in a series' color and dash, keying the legend and the tooltip. */
function LineKey({ series }: { series: Series }) {
  const { color, dash } = SERIES[series];
  return (
    <svg aria-hidden viewBox="0 0 16 4" className={cn("h-1 w-4 shrink-0", color)}>
      <line
        x1="0"
        y1="2"
        x2="16"
        y2="2"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeDasharray={dash}
      />
    </svg>
  );
}

function TooltipRow({ series, label, amount }: { series?: Series; label: string; amount: number }) {
  return (
    <span className="flex w-full items-center gap-2">
      {series ? <LineKey series={series} /> : <span className="w-4 shrink-0" />}
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto pl-4 font-semibold text-foreground tabular-nums">
        {formatWholeMoney(amount)}
      </span>
    </span>
  );
}

/**
 * Gross and net revenue over the last week, month or quarter, or the year so
 * far. The Figma's panel holds only a placeholder for this chart.
 */
export function RevenueOverviewCard({
  data,
  className,
}: {
  data: Record<RevenueRange, RevenuePoint[]>;
  className?: string;
}) {
  const [range, setRange] = useState<RevenueRange>("1m");
  const id = useId();
  const points = data[range];
  const { description } = RANGES.find((option) => option.value === range) ?? RANGES[1];
  const ticks = moneyTicks(Math.max(0, ...points.map((point) => point.gross)));

  return (
    <section aria-labelledby="revenue-overview-title" className={cn("flex", className)}>
      <DashboardCard className="flex flex-1 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <DashboardCardTitle id="revenue-overview-title" className="text-xl/7 font-semibold">
            Revenue Overview
          </DashboardCardTitle>
          <div role="group" aria-label="Time range" className="flex gap-2">
            {RANGES.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={option.value === range}
                onClick={() => setRange(option.value)}
                className={cn(
                  "h-6.5 rounded-[4px] border px-3 text-[11px] font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  option.value === range
                    ? "border-transparent bg-action-icon text-white"
                    : "bg-container text-foreground hover:bg-muted-strong dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* min-h, with the chart absolute inside: a bare flex-1 panel collapses on phones. */}
        <div className="relative mt-6 min-h-74 flex-1 rounded-md border">
          {points.length > 0 ? (
            <>
              {/* The Figma has no legend; two lines need one. */}
              <ul
                aria-hidden
                className="absolute top-3.5 left-4 flex flex-wrap gap-x-5 gap-y-1 text-xs/4 text-muted-foreground"
              >
                {(Object.keys(SERIES) as Series[]).map((series) => (
                  <li key={series} className="flex items-center gap-2">
                    <LineKey series={series} />
                    {SERIES[series].label}
                  </li>
                ))}
              </ul>
              {/*
                Hidden from assistive tech: the table below carries every value.
                Recharts 3.8 renders tick labels as .recharts-cartesian-axis-tick-value,
                which ChartContainer's own tick selector no longer matches.
              */}
              <ChartContainer
                aria-hidden
                config={chartConfig}
                initialDimension={{ width: 651, height: 246 }}
                className="absolute inset-x-4 top-10 bottom-2 aspect-auto [&_.recharts-cartesian-axis-tick-value]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/60 dark:[&_.recharts-cartesian-grid_line]:stroke-border"
              >
                <ComposedChart
                  data={points}
                  margin={{ top: 8, right: 4, bottom: 0, left: 0 }}
                  accessibilityLayer={false}
                >
                  <defs>
                    <linearGradient id={`${id}-gross`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="var(--color-gross)" stopOpacity={0.12} />
                      <stop offset="1" stopColor="var(--color-gross)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="currentColor" />
                  {/* preserveStartEnd always shows the first and last dates; minTickGap thins the rest. */}
                  <XAxis
                    dataKey="label"
                    interval="preserveStartEnd"
                    minTickGap={24}
                    axisLine={false}
                    tickLine={false}
                    tickSize={0}
                    tickMargin={12}
                    height={30}
                  />
                  <YAxis
                    domain={[0, ticks.at(-1) ?? 0]}
                    ticks={ticks}
                    tickFormatter={(value: number) => formatCompactMoney(value)}
                    axisLine={false}
                    tickLine={false}
                    tickSize={0}
                    tickMargin={10}
                    // Room for the widest label the ticks make ("£400k") clear of the SVG's clip.
                    width={48}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        className="min-w-44"
                        labelFormatter={(_, [item]) => item?.payload?.detail}
                        formatter={(_, __, item) => {
                          const point = item.payload as RevenuePoint;
                          return item.dataKey === "gross" ? (
                            <TooltipRow series="gross" label="Gross" amount={point.gross} />
                          ) : (
                            <span className="grid w-full gap-1.5">
                              <TooltipRow series="net" label="Net" amount={point.net} />
                              <TooltipRow label="Fees & refunds" amount={point.gross - point.net} />
                            </span>
                          );
                        }}
                      />
                    }
                  />
                  {/* No animation: tweening between ranges of different lengths looks broken mid-way. */}
                  <Area
                    type="monotone"
                    dataKey="gross"
                    stroke="var(--color-gross)"
                    strokeWidth={2.5}
                    fill={`url(#${id}-gross)`}
                    fillOpacity={1}
                    activeDot={{
                      r: 4,
                      fill: "var(--color-gross)",
                      stroke: "var(--card)",
                      strokeWidth: 2,
                    }}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="net"
                    stroke="var(--color-net)"
                    strokeWidth={2.5}
                    strokeDasharray={SERIES.net.dash}
                    dot={false}
                    activeDot={{
                      r: 4,
                      fill: "var(--color-net)",
                      stroke: "var(--card)",
                      strokeWidth: 2,
                    }}
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ChartContainer>
              {/* sr-only on a wrapper: a table never shrinks below its content, so it would still overflow. */}
              <div className="sr-only">
                <table>
                  <caption>Gross and net revenue, {description.toLowerCase()}</caption>
                  <thead>
                    <tr>
                      <th scope="col">Date</th>
                      <th scope="col">Gross</th>
                      <th scope="col">Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {points.map((point) => (
                      <tr key={point.detail}>
                        <th scope="row">{point.detail}</th>
                        <td>{formatWholeMoney(point.gross)}</td>
                        <td>{formatWholeMoney(point.net)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
              No revenue in this range yet.
            </p>
          )}
        </div>
      </DashboardCard>
    </section>
  );
}
