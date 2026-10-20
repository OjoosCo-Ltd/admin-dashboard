import type { Icon } from "@phosphor-icons/react";
import {
  ArrowsClockwiseIcon,
  RocketIcon,
  ShieldCheckIcon,
  StarIcon,
} from "@phosphor-icons/react/ssr";
import { cn } from "cn";

import { formatEventTime, HAIRLINE_CARD } from "@/components/analytics/analytics-format";
import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import type { AnalyticsEvent } from "@/types/analytics";

const KINDS: Record<AnalyticsEvent["kind"], { icon: Icon; weight: "regular" | "bold" | "fill" }> = {
  milestone: { icon: StarIcon, weight: "fill" },
  deploy: { icon: RocketIcon, weight: "regular" },
  report: { icon: ArrowsClockwiseIcon, weight: "bold" },
  security: { icon: ShieldCheckIcon, weight: "fill" },
};

/**
 * The latest platform events, newest first, on a vertical timeline. The newest
 * gets the teal ring, as in the Figma, and the oldest fades: its marker, not
 * its text, which keeps at least 4.5:1. The Figma sets each event's text
 * against the edge of its ring; a 6px gap keeps the two apart.
 */
export function RecentEventsCard({
  events,
  className,
  now,
}: {
  events: AnalyticsEvent[];
  className?: string;
  /** The moment times are relative to ("Today", "Yesterday"). */
  now: string;
}) {
  return (
    <DashboardCard className={cn(HAIRLINE_CARD, className)}>
      <DashboardCardTitle id="recent-events-title" className="text-lg leading-7 font-bold">
        Recent Events
      </DashboardCardTitle>
      <ol aria-labelledby="recent-events-title" className="mt-6">
        {events.map((event, index) => {
          const kind = KINDS[event.kind];
          const Glyph = kind.icon;
          const newest = index === 0;
          const last = index === events.length - 1;
          const oldest = last && events.length > 2;
          return (
            <li key={event.id} className={cn("relative flex gap-1.5", !last && "pb-4.75")}>
              {!last && (
                <span
                  aria-hidden
                  className="absolute top-9 -bottom-1 left-3.75 w-0.5 bg-border/30 dark:bg-border"
                />
              )}
              <span
                aria-hidden
                className={cn(
                  "mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border-2 bg-card",
                  newest
                    ? "border-action text-action dark:border-primary dark:text-primary"
                    : "border-border text-outline dark:border-subtle-foreground/50 dark:text-subtle-foreground",
                  oldest && "opacity-60",
                )}
              >
                <Glyph weight={kind.weight} className="size-3" />
              </span>
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-xs leading-4 font-bold",
                    oldest && "text-outline dark:text-muted-foreground",
                  )}
                >
                  {event.title}
                </p>
                <time
                  dateTime={event.at}
                  className="block text-[10px] leading-4 text-outline dark:text-subtle-foreground"
                >
                  {formatEventTime(event.at, now)}
                </time>
              </div>
            </li>
          );
        })}
      </ol>
    </DashboardCard>
  );
}
