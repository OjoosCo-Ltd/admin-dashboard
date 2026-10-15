import { CheckCircleIcon, UploadSimpleIcon, VideoCameraIcon } from "@phosphor-icons/react/ssr";
import { cn } from "cn";
import Link from "next/link";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import type { ActivityItem } from "@/types/dashboard";

// Sizes match the Figma's glyphs: Phosphor's upload and camera are wider than
// the Figma's, so they run smaller than the check.
const KIND = {
  verification: {
    icon: CheckCircleIcon,
    size: "size-4.5",
    tile: "bg-success-soft text-success dark:bg-success/15",
  },
  upgrade: { icon: UploadSimpleIcon, size: "size-4", tile: "bg-accent text-primary" },
  "virtual-date": { icon: VideoCameraIcon, size: "size-4.25", tile: "bg-accent text-primary" },
} satisfies Record<
  ActivityItem["kind"],
  { icon: typeof CheckCircleIcon; size: string; tile: string }
>;

/** The latest platform events, newest first. Unread ones are bold. */
export function LiveActivityCard({
  items,
  className,
}: {
  items: ActivityItem[];
  className?: string;
}) {
  return (
    <DashboardCard className={className}>
      <div className="flex items-center justify-between gap-4">
        <DashboardCardTitle>Live Activity</DashboardCardTitle>
        {/* ⚠️ PROVISIONAL: there is no activity feed page yet, so this opens Analytics. */}
        <Link
          href="/analytics"
          className="rounded-sm text-[11px] leading-4 font-bold whitespace-nowrap text-primary underline-offset-4 outline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
        >
          View All<span className="sr-only"> activity</span>
        </Link>
      </div>
      <ul className="mt-6 flex flex-col gap-6">
        {items.map((item) => {
          const { icon: Icon, size, tile } = KIND[item.kind];
          return (
            <li key={item.id} className="flex items-start gap-3">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full",
                  tile,
                )}
              >
                <Icon aria-hidden weight="bold" className={size} />
              </span>
              {/* The Figma wraps messages at about 220px, so lines stay short. */}
              <div className="max-w-56 min-w-0">
                <p className={cn("text-[13px] leading-4.5", item.unread && "font-bold")}>
                  {item.unread && <span className="sr-only">Unread: </span>}
                  {item.message}
                </p>
                <p className="text-[11px] leading-3.5 font-medium text-muted-foreground">
                  {item.time}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </DashboardCard>
  );
}
