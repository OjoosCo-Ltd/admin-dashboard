import { CaretRightIcon, ClockCounterClockwiseIcon } from "@phosphor-icons/react/ssr";
import { cn } from "cn";
import Link from "next/link";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { formatDayAndTime } from "@/components/settings/settings-format";
import type { ProfileActivity } from "@/types/profile";

// In UTC, like settings-format, so the server's render and the browser's agree.
const clock = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: "UTC",
});

/** "Today, 10:15 AM", "Yesterday, 02:30 PM", or "Oct 12, 2026, 09:00 AM": older days keep their time. */
function formatActivityTime(iso: string) {
  const label = formatDayAndTime(iso);
  return /^(Today|Yesterday),/.test(label) ? label : `${label}, ${clock.format(new Date(iso))}`;
}

/** The admin's latest actions as a timeline, newest first, with a way into the full audit log. */
export function RecentActivityCard({ activity }: { activity: ProfileActivity[] }) {
  return (
    <DashboardCard className="border-border/30 shadow-[0_1px_3px_rgb(24_28_30/0.05)] dark:border-border">
      <h2 className="flex items-center gap-0.75 border-b border-border/20 pb-4 text-xl leading-7 font-semibold dark:border-border">
        <ClockCounterClockwiseIcon
          aria-hidden
          weight="bold"
          className="-ml-0.5 size-6 shrink-0 text-action dark:text-primary"
        />
        Recent Activity
      </h2>
      <div className="relative mt-6 pl-6.25">
        <span aria-hidden className="absolute inset-y-0 left-0 w-px bg-border/30 dark:bg-border" />
        <ol className="flex flex-col gap-6">
          {activity.map((item, index) => (
            <li key={item.id} className="relative">
              <span
                aria-hidden
                className={cn(
                  "absolute top-1.5 -left-7.75 size-3.25 rounded-full border-2 bg-card",
                  index === 0
                    ? "border-action dark:border-primary"
                    : "border-[#bfc8ce] dark:border-muted-foreground/60",
                )}
              />
              <time
                dateTime={item.at}
                className="block text-[11px] leading-3.5 text-muted-foreground"
              >
                {formatActivityTime(item.at)}
              </time>
              <p className="mt-1 text-sm leading-5">
                {item.action}
                {item.target && " "}
                {item.target?.href ? (
                  <Link
                    href={item.target.href}
                    className="rounded-sm text-action underline decoration-action/35 underline-offset-[3px] outline-none hover:decoration-current focus-visible:ring-3 focus-visible:ring-ring/50 dark:text-primary dark:decoration-primary/40"
                  >
                    {item.target.label}
                  </Link>
                ) : (
                  item.target?.label
                )}
              </p>
            </li>
          ))}
        </ol>
        <Link
          href="/settings/audit-logs"
          className="mt-5.5 flex w-fit items-center gap-1.5 rounded-sm text-[13px] leading-5 font-semibold tracking-[0.01em] text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          View all activity
          <CaretRightIcon aria-hidden weight="bold" className="size-3" />
        </Link>
      </div>
    </DashboardCard>
  );
}
