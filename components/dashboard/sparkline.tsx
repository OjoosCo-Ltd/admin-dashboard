"use client";

import { useId } from "react";
import { Area, AreaChart, YAxis } from "recharts";

import { ChartContainer } from "@/components/ui/chart";

/** A sparkline as drawn in the Figma: its color, line weight, end dot and fill (gradient stops as [offset, opacity], top to bottom). */
export interface SparklineStyle {
  color: string;
  stroke: number;
  dot: number;
  fill: [number, number][];
}

/** The trend line along the bottom of a KPI card. Decorative: the card states its figures in text. */
export function Sparkline({ data, style }: { data: number[]; style: SparklineStyle }) {
  const fillId = useId();
  const { color, stroke, dot, fill } = style;
  const last = data.length - 1;

  return (
    <ChartContainer
      aria-hidden
      config={{ value: { color } }}
      initialDimension={{ width: 211, height: 49 }}
      className="mt-2 aspect-auto h-12.25 w-full [&_.recharts-surface]:overflow-visible"
    >
      <AreaChart
        data={data.map((value) => ({ value }))}
        margin={{ top: 10, right: 0, bottom: 0, left: 0 }}
        accessibilityLayer={false}
      >
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            {fill.map(([offset, opacity]) => (
              <stop
                key={offset}
                offset={offset}
                stopColor="var(--color-value)"
                stopOpacity={opacity}
              />
            ))}
          </linearGradient>
        </defs>
        <YAxis hide domain={["dataMin", "dataMax"]} />
        <Area
          dataKey="value"
          type="linear"
          stroke="var(--color-value)"
          strokeWidth={stroke}
          fill={`url(#${fillId})`}
          fillOpacity={1}
          isAnimationActive={false}
          activeDot={false}
          dot={({ index, cx, cy }) =>
            index === last ? <circle cx={cx} cy={cy} r={dot} fill="var(--color-value)" /> : null
          }
        />
      </AreaChart>
    </ChartContainer>
  );
}
