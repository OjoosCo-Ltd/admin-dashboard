import { cn } from "cn";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import type { FunnelStage } from "@/types/matches";

/** Each stage's share of generated matches, the bars fading as the funnel narrows. */
export function EngagementFunnelCard({
  stages,
  className,
}: {
  stages: FunnelStage[];
  className?: string;
}) {
  return (
    <DashboardCard className={className}>
      <DashboardCardTitle className="text-xl leading-7 font-semibold">
        Engagement Funnel
      </DashboardCardTitle>
      <ol className="mt-5 flex flex-col gap-4.5">
        {stages.map((stage, index) => (
          <li key={stage.label}>
            <div className="flex items-center justify-between gap-3 text-[17px] leading-6">
              <span>{stage.label}</span>
              <span className={cn("tabular-nums", index === 0 && "font-bold")}>
                {stage.percent}%
              </span>
            </div>
            {/* The figure above says it; the bar only shows it. */}
            <div
              aria-hidden
              className="mt-1.5 h-2.5 rounded-full bg-primary"
              style={{
                width: `${Math.max(stage.percent, 3)}%`,
                opacity: Math.max(1 - index * 0.2, 0.2),
              }}
            />
          </li>
        ))}
      </ol>
    </DashboardCard>
  );
}
