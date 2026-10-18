"use client";

import { cn } from "cn";
import { toast } from "sonner";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import type { CommunityActivity } from "@/types/community";

const DOTS: Record<CommunityActivity["tone"], string> = {
  action: "bg-action-icon",
  review: "bg-review dark:bg-subtle-foreground",
  neutral: "bg-outline",
};

/** The Groups tab's timeline of community events, newest first. */
export function CommunityActivityCard({
  activity,
  className,
}: {
  activity: CommunityActivity[];
  className?: string;
}) {
  return (
    <DashboardCard className={cn("flex flex-col", className)}>
      <DashboardCardTitle className="text-xl/7 font-semibold">Recent Activity</DashboardCardTitle>
      {/* The rail runs down the dots' centers, from the first entry to the last. */}
      <ol className="relative mt-6 flex flex-col gap-5 before:absolute before:inset-y-0 before:left-px before:w-px before:bg-border">
        {activity.map((item) => (
          <li key={item.id} className="relative pl-6.5">
            <span
              aria-hidden
              className={cn(
                "absolute top-1.5 -left-0.75 size-2 rounded-full ring-2 ring-card",
                DOTS[item.tone],
              )}
            />
            {/* The Figma wraps both lines at about 220px. */}
            <p className="max-w-55 text-[13px]/4 font-semibold tracking-wide">{item.title}</p>
            <p className="max-w-55 text-sm text-muted-foreground">{item.detail}</p>
          </li>
        ))}
      </ol>
      <button
        type="button"
        // UI only: there's no activity log to open yet.
        onClick={() => toast("The full activity log isn't available yet")}
        className="mt-4 h-10 rounded-md text-xs font-semibold tracking-wider text-action transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 dark:text-primary"
      >
        View All Activity
      </button>
    </DashboardCard>
  );
}
