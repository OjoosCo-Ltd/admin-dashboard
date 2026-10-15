import { FlagIcon, ProhibitIcon, ProhibitInsetIcon } from "@phosphor-icons/react/ssr";
import { cn } from "cn";
import type { ReactNode } from "react";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import type { SafetySignal } from "@/types/ai-center";

const LOOKS: Record<SafetySignal["id"], { icon: ReactNode; tile: string; value: string }> = {
  fakes: {
    icon: <ProhibitInsetIcon weight="bold" />,
    tile: "bg-destructive-container text-[#93000a] dark:bg-destructive/20 dark:text-destructive",
    value: "text-destructive",
  },
  spam: {
    icon: <ProhibitIcon weight="bold" />,
    tile: "bg-container text-foreground dark:bg-muted",
    value: "text-foreground",
  },
  flagged: {
    icon: <FlagIcon weight="bold" />,
    tile: "bg-container text-foreground dark:bg-muted",
    value: "text-foreground",
  },
};

/** What the safety models caught in the last day. */
export function SafetyIntelligenceCard({
  signals,
  className,
}: {
  signals: SafetySignal[];
  className?: string;
}) {
  return (
    <DashboardCard className={className}>
      <DashboardCardTitle className="text-xl leading-7 font-semibold">
        Safety Intelligence
      </DashboardCardTitle>
      <dl className="mt-5 flex flex-col gap-4">
        {signals.map((signal) => {
          const look = LOOKS[signal.id];
          return (
            <div key={signal.id} className="flex items-center gap-4">
              <span
                aria-hidden
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-md [&_svg]:size-5.5",
                  look.tile,
                )}
              >
                {look.icon}
              </span>
              <dt className="min-w-0 flex-1">
                <span className="block text-sm leading-5 font-semibold">{signal.label}</span>
                <span className="block text-[11px] text-muted-foreground">{signal.period}</span>
              </dt>
              <dd className={cn("text-[22px] leading-7 font-semibold tabular-nums", look.value)}>
                {signal.value}
              </dd>
            </div>
          );
        })}
      </dl>
    </DashboardCard>
  );
}
