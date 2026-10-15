import { cn } from "cn";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { initials } from "@/libs/utils";
import type { TopModerator } from "@/types/verification";

// The Figma's avatar colors run by rank; anyone past third gets a neutral one.
const RANK_TONES = [
  "bg-action-icon text-white",
  "bg-info-soft text-[#4e6875]",
  "bg-caution-accent text-white",
];

const count = new Intl.NumberFormat("en-US");

/** The moderators with the most reviews in the range, busiest first. */
export function TopModeratorsCard({
  moderators,
  className,
}: {
  moderators: TopModerator[];
  className?: string;
}) {
  return (
    <DashboardCard className={cn("border-border/30 dark:border-border", className)}>
      <DashboardCardTitle className="text-xl/7 font-semibold">Top Moderators</DashboardCardTitle>
      {moderators.length > 0 ? (
        <ol className="mt-4 flex flex-col gap-5">
          {moderators.map((moderator, index) => (
            <li key={moderator.id} className="flex items-center gap-3">
              <span
                aria-hidden
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                  RANK_TONES[index] ?? "bg-muted text-muted-foreground",
                )}
              >
                {initials(moderator.name)}
              </span>
              {/* The Figma breaks the name and the count onto two lines each. */}
              <span className="min-w-0 flex-1">
                <span className="block w-min text-[13px]/4 font-semibold tracking-wide">
                  {moderator.name}
                </span>
              </span>
              <span className="w-min text-sm/5 font-semibold">
                {count.format(moderator.reviews)} reviews
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">No reviews in this range yet.</p>
      )}
    </DashboardCard>
  );
}
