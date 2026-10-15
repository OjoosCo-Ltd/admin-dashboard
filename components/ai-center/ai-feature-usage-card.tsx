import { cn } from "cn";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import type { AiFeatureShare, AiFeatureUsage } from "@/types/ai-center";

// Dot colors from the Figma's legend.
const COLORS: Record<AiFeatureShare["id"], string> = {
  matchmaking: "#006481",
  starters: "#486270",
  suggestions: "#a26727",
  other: "#297d9d",
};

const SIZE = 158;
const STROKE = 16;
const RADIUS = (SIZE - STROKE) / 2;
// A sliver of track between segments.
const GAP = 1;

/**
 * Each AI feature's share of usage around the count of running services. The
 * Figma draws the ring as a plain track; here it carries the legend's shares.
 */
export function AiFeatureUsageCard({
  data,
  className,
}: {
  data: AiFeatureUsage;
  className?: string;
}) {
  const total = data.shares.reduce((sum, share) => sum + share.percent, 0) || 1;
  const segments = data.shares.map((share, index) => ({
    ...share,
    start: (data.shares.slice(0, index).reduce((sum, item) => sum + item.percent, 0) / total) * 100,
    length: (share.percent / total) * 100,
  }));

  return (
    <DashboardCard className={cn("flex flex-col", className)}>
      <DashboardCardTitle className="text-xl leading-7 font-semibold">
        AI Feature Usage
      </DashboardCardTitle>
      <div className="relative mx-auto mt-8" style={{ width: SIZE, height: SIZE }}>
        <svg aria-hidden viewBox={`0 0 ${SIZE} ${SIZE}`} className="size-full -rotate-90">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
            className="stroke-container dark:stroke-muted"
          />
          {segments.map((segment) => (
            <circle
              key={segment.id}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={COLORS[segment.id]}
              strokeWidth={STROKE}
              pathLength={100}
              strokeDasharray={`${Math.max(segment.length - GAP, 0)} ${100 - segment.length + GAP}`}
              strokeDashoffset={-segment.start}
            />
          ))}
        </svg>
        <p className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[26px] leading-8 font-bold tabular-nums">{data.services}</span>
          <span className="text-xs">Services</span>
        </p>
      </div>
      <dl className="mt-9 flex flex-col gap-3 text-[17px]">
        {data.shares.map((share) => (
          <div key={share.id} className="flex items-center gap-3">
            <dt className="flex flex-1 items-center gap-2.5">
              <span
                aria-hidden
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: COLORS[share.id] }}
              />
              {share.label}
            </dt>
            <dd className="tabular-nums">{share.percent}%</dd>
          </div>
        ))}
      </dl>
    </DashboardCard>
  );
}
