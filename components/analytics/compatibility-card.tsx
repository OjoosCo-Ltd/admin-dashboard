"use client";

import { cn } from "cn";
import { Bar, BarChart, type BarShapeProps, LabelList, Rectangle, XAxis, YAxis } from "recharts";

import {
  formatCompactCount,
  formatCount,
  formatPercent,
  HAIRLINE_CARD,
  ramp,
  RAMP_VARS,
} from "@/components/analytics/analytics-format";
import { LiveTooltipContent } from "@/components/analytics/live-tooltip-content";
import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import type { CompatibilityBand, CompatibilityDistribution } from "@/types/analytics";

// Every band but the busiest wears one light step of the ramp: step 4 on the
// white card (3.41:1, where step 5 would miss the 3:1 that graphics need) and
// step 5 on the dark one (3.65:1). Both pairs with the busiest band's step 2
// pass the dataviz validator's ordinal checks.
const BAND_VARS = "[--compat-band:var(--ramp-4)] dark:[--compat-band:var(--ramp-5)]";
const BAND = "var(--compat-band)";

const chartConfig = {
  matches: { label: "Matches", color: BAND },
} satisfies ChartConfig;

// The Figma's geometry: 24px columns on a 30px pitch, centered in the card,
// the tallest reaching 176px above the baseline. The score labels sit under
// their columns (the Figma spreads them wider than the columns, so they miss).
const PITCH = 30;
const PLOT_HEIGHT = 176;
const AXIS_HEIGHT = 24;
// Air between the marks and the chart's focus ring. The top also holds the
// tallest column's count.
const INSET = { top: 20, right: 8, bottom: 6, left: 8 };

/** "85–89%". */
const bandRange = (band: CompatibilityBand) => `${band.from}–${band.to}%`;

/**
 * How many matches fall in each compatibility score band. Every band is one
 * light step of the page's ramp and the busiest band (the mode) a dark one, so
 * the peak stands out without grading the columns by height.
 */
export function CompatibilityCard({
  data,
  className,
}: {
  data: CompatibilityDistribution;
  className?: string;
}) {
  const modal = data.bands.reduce(
    (top, band, index) => (band.matches > data.bands[top].matches ? index : top),
    0,
  );
  const rows = data.bands.map((band) => ({ ...band, range: bandRange(band) }));
  const top = Math.max(1, ...data.bands.map((band) => band.matches));
  const size = {
    width: PITCH * Math.max(rows.length, 1) + INSET.left + INSET.right,
    height: INSET.top + PLOT_HEIGHT + AXIS_HEIGHT + INSET.bottom,
  };

  const renderBar = (props: BarShapeProps) => (
    <Rectangle
      {...props}
      fill={props.index === modal ? ramp(2) : BAND}
      // The hovered or focused band lifts: lighter on the white card, brighter on the dark one.
      className={cn(
        "transition-[opacity,filter]",
        props.isActive && "opacity-80 dark:opacity-100 dark:brightness-115",
      )}
    />
  );

  return (
    <DashboardCard className={cn("flex flex-col", HAIRLINE_CARD, RAMP_VARS, BAND_VARS, className)}>
      <DashboardCardTitle className="max-w-40 text-[15px] leading-5 font-bold tracking-[0.05em] text-subtle-foreground uppercase">
        Compatibility Distribution
      </DashboardCardTitle>

      <ChartContainer
        config={chartConfig}
        initialDimension={size}
        style={size}
        className="mx-auto mt-2 aspect-auto rounded-md has-focus-visible:ring-3 has-focus-visible:ring-ring [&_.recharts-cartesian-axis-line]:stroke-border/70 dark:[&_.recharts-cartesian-axis-line]:stroke-border [&_.recharts-cartesian-axis-tick-value]:fill-subtle-foreground"
      >
        <BarChart
          data={rows}
          margin={INSET}
          barSize={24}
          aria-label="Matches by compatibility score band"
        >
          <XAxis
            dataKey="label"
            tickLine={false}
            tickSize={0}
            tickMargin={12}
            interval={0}
            height={AXIS_HEIGHT}
            fontSize={10}
            fontWeight={600}
          />
          <YAxis hide domain={[0, top]} />
          <ChartTooltip
            cursor={false}
            content={
              <LiveTooltipContent
                hideIndicator
                labelFormatter={(_, payload) => payload[0]?.payload?.range}
                formatter={(value) => (
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-foreground tabular-nums">
                      {formatCompactCount(Number(value))}
                    </span>{" "}
                    matches
                  </span>
                )}
              />
            }
          />
          <Bar
            dataKey="matches"
            name="Matches"
            radius={[4, 4, 0, 0]}
            shape={renderBar}
            activeBar
            isAnimationActive={false}
          >
            {/* Every count rides its column's cap: the card has no room for a y-axis to read them from. */}
            <LabelList
              dataKey="matches"
              position="top"
              offset={6}
              formatter={(value) => formatCompactCount(Number(value))}
              className="fill-subtle-foreground text-[10px] font-semibold"
            />
          </Bar>
        </BarChart>
      </ChartContainer>

      {/* sr-only on a wrapper: a table never shrinks below its content, so it would still overflow. */}
      <div className="sr-only">
        <table>
          <caption>
            Matches by compatibility score band. {rows[modal]?.range} has the most matches.
          </caption>
          <thead>
            <tr>
              <th scope="col">Score band</th>
              <th scope="col">Matches</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.from}>
                <th scope="row">{row.range}</th>
                <td>{formatCount(row.matches)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-auto pt-8 pb-1 text-center text-xs leading-4 font-medium text-muted-foreground">
        Global average match score:
        <span className="block font-semibold text-action dark:text-primary">
          {formatPercent(data.average)}
        </span>
      </p>
    </DashboardCard>
  );
}
