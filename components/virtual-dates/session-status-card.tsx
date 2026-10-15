import { cn } from "cn";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import type { SessionStatusSummary } from "@/types/virtual-dates";

const COLORS: Record<SessionStatusSummary["shares"][number]["id"], string> = {
  completed: "#006481",
  upcoming: "#486270",
  cancelled: "var(--destructive)",
};

const SIZE = 112;
const STROKE = 11;
const RADIUS = (SIZE - STROKE) / 2;
const GAP = 1;

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

/**
 * How the sessions split by status, around the total. The Figma draws the
 * ring in one slate; here it carries the legend's shares.
 */
export function SessionStatusCard({
  data,
  className,
}: {
  data: SessionStatusSummary;
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
      <DashboardCardTitle className="text-xl leading-7">Session Status</DashboardCardTitle>
      <div className="flex flex-1 items-center justify-center py-8">
        <div className="relative" style={{ width: SIZE, height: SIZE }}>
          <svg aria-hidden viewBox={`0 0 ${SIZE} ${SIZE}`} className="size-full -rotate-90">
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
            <span className="text-xl leading-6 font-bold">
              {compact.format(data.total).toLowerCase()}
            </span>
            <span className="text-[11px] font-semibold uppercase">Total</span>
          </p>
        </div>
      </div>
      <dl className="flex flex-col gap-3 text-[17px]">
        {data.shares.map((share) => (
          <div key={share.id} className="flex items-center gap-3">
            <dt className="flex flex-1 items-center gap-1.5">
              <span
                aria-hidden
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: COLORS[share.id] }}
              />
              {share.label}
            </dt>
            <dd className="font-bold tabular-nums">{share.percent}%</dd>
          </div>
        ))}
      </dl>
    </DashboardCard>
  );
}
