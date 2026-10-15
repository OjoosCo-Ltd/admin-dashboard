import { cn } from "cn";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import type { ScoreDistribution } from "@/types/matches";

// The top band in primary, the next in a lighter teal, the rest an empty track.
const BAND_COLORS = ["var(--primary)", "#03839e"];

const SIZE = 185;
const STROKE = 18;
const RADIUS = (SIZE - STROKE) / 2;

/** Average compatibility in a ring that shows how much of it the top two score bands hold. */
export function ScoreDistributionCard({
  data,
  className,
}: {
  data: ScoreDistribution;
  className?: string;
}) {
  // Drawn widest first, so each band's rounded end overlaps the next one's start.
  const arcs = data.bands
    .map((band, index) => ({
      ...band,
      color: BAND_COLORS[index] ?? BAND_COLORS.at(-1),
      end: data.bands.slice(0, index + 1).reduce((sum, item) => sum + item.percent, 0),
    }))
    .reverse();

  return (
    <DashboardCard className={cn("flex flex-col", className)}>
      <DashboardCardTitle className="text-xl leading-7 font-semibold">
        Score Distribution
      </DashboardCardTitle>
      <div className="relative mx-auto mt-7.5" style={{ width: SIZE, height: SIZE }}>
        <svg aria-hidden viewBox={`0 0 ${SIZE} ${SIZE}`} className="size-full -rotate-90">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
            className="stroke-[#eeeeee] dark:stroke-muted"
          />
          {arcs.map((arc) => (
            <circle
              key={arc.label}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={arc.color}
              strokeWidth={STROKE}
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={`${arc.end} 100`}
            />
          ))}
        </svg>
        <p className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[32px] leading-10 font-bold tabular-nums">{data.average}%</span>
          <span className="text-[11px] font-bold tracking-wider text-review uppercase dark:text-subtle-foreground">
            Average
          </span>
        </p>
      </div>
      <dl className="mt-7 grid grid-cols-2 gap-4">
        {data.bands.map((band) => (
          <div key={band.label}>
            <dt className="text-[11px] font-bold tracking-wide text-review dark:text-subtle-foreground">
              {band.label}
            </dt>
            <dd className="mt-1 max-w-26 text-base leading-[1.45] font-bold">
              {band.percent}% of matches
            </dd>
          </div>
        ))}
      </dl>
    </DashboardCard>
  );
}
