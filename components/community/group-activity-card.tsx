import type { Icon } from "@phosphor-icons/react";
import { ChatsIcon, UserPlusIcon, WarningCircleIcon } from "@phosphor-icons/react/ssr";
import { cn } from "cn";

import { ON_INFO_SOFT } from "@/components/community/community-badges";
import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import type { GroupActivity } from "@/types/community";

const KINDS: Record<GroupActivity["kind"], { icon: Icon; disc: string }> = {
  joined: { icon: UserPlusIcon, disc: cn("bg-info-soft dark:bg-info-soft/15", ON_INFO_SOFT) },
  discussion: { icon: ChatsIcon, disc: "bg-caution-accent text-white" },
  report: {
    icon: WarningCircleIcon,
    disc: "bg-destructive-container text-[#93000a] dark:bg-destructive/20 dark:text-red-200",
  },
};

/** A group's latest events, each on a disc of its kind. Members' actions are set in bold. */
export function GroupActivityCard({
  activity,
  className,
}: {
  activity: GroupActivity[];
  className?: string;
}) {
  return (
    <DashboardCard className={cn("flex flex-col", className)}>
      <DashboardCardTitle className="text-xl/7 font-semibold">Recent Activity</DashboardCardTitle>
      <ul className="mt-6 flex flex-col gap-5.5">
        {activity.map((item) => {
          const kind = KINDS[item.kind];
          return (
            <li key={item.id} className="flex items-start gap-3">
              <span
                aria-hidden
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full",
                  kind.disc,
                )}
              >
                <kind.icon weight="bold" className="size-4" />
              </span>
              {/* The Figma wraps at about 200px. */}
              <div className="max-w-50 min-w-0">
                <p
                  className={cn(
                    "text-[13px]/4.5",
                    // System notices (a report) aren't someone's action, so they stay regular.
                    item.kind !== "report" && "font-semibold",
                  )}
                >
                  {item.text}
                </p>
                <p className="text-[11px]/4 text-muted-foreground">{item.time}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </DashboardCard>
  );
}
