"use client";

import { cn } from "cn";
import { Cell, Pie, PieChart } from "recharts";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { ChartContainer } from "@/components/ui/chart";
import type { GenderShare } from "@/types/users";

// Fixed colors from the Figma, so the ring reads the same in dark mode.
const COLORS: Record<GenderShare["id"], string> = {
  male: "var(--chart-1)",
  female: "#bfc8ce",
  "non-binary": "#22c55d",
  other: "#ea580b",
};

// Clockwise from twelve o'clock, as drawn: the smallest share sits between the two largest.
const RING_ORDER: GenderShare["id"][] = ["male", "other", "female", "non-binary"];

/** The gender split as a ring, with a legend that carries the figures. */
export function GenderCard({ data, className }: { data: GenderShare[]; className?: string }) {
  const ring = RING_ORDER.flatMap((id) => data.filter((share) => share.id === id));
  const total = data.reduce((sum, share) => sum + share.percent, 0);

  return (
    <DashboardCard className={cn("flex flex-col", className)}>
      <DashboardCardTitle>Gender</DashboardCardTitle>
      {/* Decorative: the legend below states every share. */}
      <div aria-hidden className="relative mx-auto mt-10 size-38.5">
        <ChartContainer
          config={{}}
          initialDimension={{ width: 154, height: 154 }}
          className="aspect-square size-full"
        >
          <PieChart accessibilityLayer={false}>
            <Pie
              data={ring}
              dataKey="percent"
              nameKey="label"
              innerRadius={63}
              outerRadius={77}
              startAngle={90}
              endAngle={-270}
              stroke="none"
              isAnimationActive={false}
            >
              {ring.map((share) => (
                <Cell key={share.id} fill={COLORS[share.id]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
          {total}%
        </span>
      </div>
      <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-3">
        {data.map((share) => (
          <li key={share.id} className="flex items-center gap-3 text-base leading-6">
            <span
              aria-hidden
              className="size-3 shrink-0 rounded-full"
              style={{ backgroundColor: COLORS[share.id] }}
            />
            <span>
              {share.id === "non-binary" ? (
                <abbr title="Non-binary" className="no-underline">
                  {share.label}
                </abbr>
              ) : (
                share.label
              )}
              <br />({share.percent}%)
            </span>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
