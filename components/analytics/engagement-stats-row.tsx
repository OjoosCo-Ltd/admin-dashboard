import { cn } from "cn";
import type { ReactNode } from "react";

import {
  formatCompactCount,
  formatCount,
  formatPercent,
  HAIRLINE_CARD,
} from "@/components/analytics/analytics-format";
import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { FEATURES } from "@/constants/features";
import type { EngagementStats } from "@/types/analytics";

/**
 * ⚠️ PROVISIONAL: the length of an average virtual date that reads as high
 * engagement. The Figma states the verdict without a rule; product to confirm.
 */
const HIGH_ENGAGEMENT_MINUTES = 30;

const RATING_MAX = 5;

// Material Icons' star (Apache 2.0), the sharp star the Figma draws. Each sits
// in a 24-unit box with its ink from x 2 to 22.
const STAR =
  "M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";
const STAR_BOX = 24;
const STAR_INK_START = 2;
const STAR_INK_WIDTH = 20;

/** A centered figure: an eyebrow label, the value, then a line of context under it. */
function StatTile({
  label,
  value,
  className,
  children,
}: {
  label: string;
  value: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <DashboardCard
      className={cn(
        HAIRLINE_CARD,
        "flex flex-col items-center px-4 pt-6 pb-8 text-center sm:px-6",
        className,
      )}
    >
      <DashboardCardTitle className="text-[13px]/4 font-semibold tracking-wider text-subtle-foreground uppercase">
        {label}
      </DashboardCardTitle>
      <p className="mt-2.5 text-[32px]/9 font-bold">{value}</p>
      {children}
    </DashboardCard>
  );
}

/**
 * Five stars filled to the rating: 4.8 fills four and 80% of the fifth. The
 * Figma rounds down to four full stars and an outlined one. The unfilled share
 * is a pale star rather than that outline: the outline is solid across the
 * points, so a partly filled one looked full.
 */
function RatingStars({ rating }: { rating: number }) {
  return (
    <svg
      role="img"
      aria-label={`Rated ${rating} out of ${RATING_MAX}`}
      viewBox={`0 0 ${STAR_BOX * RATING_MAX} ${STAR_BOX}`}
      className="mt-3.25 h-[13.75px] w-[68.75px] fill-current text-caution-accent dark:text-amber-300"
    >
      {Array.from({ length: RATING_MAX }, (_, index) => {
        const fill = Math.min(Math.max(rating - index, 0), 1);
        const offset = `translate(${index * STAR_BOX})`;
        if (fill === 1) return <path key={index} d={STAR} transform={offset} />;

        // The solid star, clipped by a nested viewport to the filled share of its ink.
        const width = Math.round((STAR_INK_START + fill * STAR_INK_WIDTH) * 100) / 100;
        return (
          <g key={index} transform={offset}>
            <path d={STAR} className="opacity-30" />
            {fill > 0 && (
              <svg
                width={width}
                height={STAR_BOX}
                viewBox={`0 0 ${width} ${STAR_BOX}`}
                overflow="hidden"
              >
                <path d={STAR} />
              </svg>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Virtual date completion, rating and length, and how many conversation
 * threads are live. The length waits on attendance data: an invitation records
 * only when it starts.
 */
export function EngagementStatsRow({ stats }: { stats: EngagementStats }) {
  const showDuration = FEATURES.dateAttendance;
  // Both are averages: print them to the precision the Figma shows, and judge
  // engagement on the minutes as printed, so "30m" never reads below target.
  const rating = Number(stats.avgRating.toFixed(1));
  const minutes = Math.round(stats.avgDateMinutes);
  const highEngagement = minutes >= HIGH_ENGAGEMENT_MINUTES;

  return (
    // Equal rows: in the 2×2 layout the second pair ends in a line of text,
    // which is shorter than the meter and stars above it. Three tiles sit
    // three across from lg, and below that the third spans the row.
    <section
      aria-label="Virtual date and conversation figures"
      className={cn(
        "grid auto-rows-fr grid-cols-2 gap-4 sm:gap-6",
        showDuration ? "xl:grid-cols-4" : "lg:grid-cols-3",
      )}
    >
      <StatTile label="Completion Rate" value={formatPercent(stats.completionRate)}>
        <div
          role="meter"
          aria-label="Virtual dates completed"
          aria-valuenow={stats.completionRate}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={formatPercent(stats.completionRate)}
          className="mt-3.5 h-1 w-24 overflow-hidden rounded-full bg-[#cce0e6] dark:bg-white/10"
        >
          <div
            className="h-full rounded-full bg-action dark:bg-primary"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
      </StatTile>
      <StatTile label="Avg User Rating" value={`${rating}/${RATING_MAX}`}>
        <RatingStars rating={rating} />
      </StatTile>
      {showDuration && (
        <StatTile label="Avg Duration" value={`${minutes}m`}>
          <p
            className={cn(
              "mt-1.5 text-[10px]/3.5 font-bold tracking-wide uppercase",
              highEngagement
                ? "text-success-strong dark:text-success"
                : "text-caution dark:text-[#e9b97c]",
            )}
          >
            {highEngagement ? "High engagement" : "Below target"}
          </p>
        </StatTile>
      )}
      <StatTile
        label="Active Threads"
        value={formatCount(stats.activeThreads)}
        className={cn(!showDuration && "max-lg:col-span-2")}
      >
        <p className="mt-1.5 text-[10px]/3.5 text-muted-foreground">
          vs {formatCompactCount(stats.inactiveThreads)} Inactive
        </p>
      </StatTile>
    </section>
  );
}
