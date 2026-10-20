import type { Icon } from "@phosphor-icons/react";
import {
  ShieldCheckeredIcon,
  ShieldCheckIcon,
  ShieldWarningIcon,
  WarningOctagonIcon,
} from "@phosphor-icons/react/ssr";
import { cn } from "cn";

import {
  formatCompactCount,
  formatPercent,
  HAIRLINE_CARD,
} from "@/components/analytics/analytics-format";
import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import type { TrustMetrics } from "@/types/analytics";

/** What the Security Status panel says for each state: an icon and words, never the color alone. */
const STATUS: Record<TrustMetrics["status"], { label: string; icon: Icon; className: string }> = {
  healthy: {
    label: "Healthy & Secure",
    icon: ShieldCheckIcon,
    className: "text-emerald-700 dark:text-emerald-400",
  },
  watch: {
    label: "Needs Attention",
    icon: ShieldWarningIcon,
    className: "text-caution dark:text-[#e9b97c]",
  },
  "at-risk": {
    label: "At Risk",
    icon: ShieldWarningIcon,
    className: "text-destructive",
  },
};

/** Verification, reports and fraud at a glance, with the platform's security status. */
export function AnalyticsTrustCard({
  trust,
  className,
}: {
  trust: TrustMetrics;
  className?: string;
}) {
  const metrics: { id: string; label: string; value: string; icon: Icon; tile: string }[] = [
    {
      id: "verification",
      label: "Verification Rate",
      value: formatPercent(trust.verificationRate),
      icon: ShieldCheckIcon,
      tile: "bg-[#ecfef6] text-[#079669] dark:bg-emerald-400/15 dark:text-emerald-400",
    },
    {
      id: "reports",
      label: "Report Rate",
      value: formatPercent(trust.reportRate, 2),
      icon: WarningOctagonIcon,
      tile: "bg-destructive-container text-destructive dark:bg-destructive/20",
    },
    {
      id: "fraud",
      label: "Fraud Blocked",
      value: formatCompactCount(trust.fraudBlocked),
      icon: ShieldCheckeredIcon,
      tile: "bg-[#bfe9ff] text-action dark:bg-action/30 dark:text-primary",
    },
  ];
  const status = STATUS[trust.status];

  return (
    <DashboardCard className={cn("flex flex-col", HAIRLINE_CARD, className)}>
      <DashboardCardTitle className="text-lg leading-7 font-bold">
        Trust &amp; Safety
      </DashboardCardTitle>
      {/* Below xl the card spans the row, so the metrics share it rather than stack at its left. */}
      <dl className="mt-6 grid gap-6 lg:grid-cols-3 xl:grid-cols-1">
        {metrics.map((metric) => (
          // The tile sits inside the <dt>, positioned against the row, because a <dl>'s
          // groups may hold only <dt>s and <dd>s.
          <div key={metric.id} className="relative flex min-h-10 flex-col justify-center pl-14">
            <dt className="text-xs/4 font-semibold tracking-wider text-subtle-foreground uppercase">
              <span
                aria-hidden
                className={cn(
                  "absolute top-1/2 left-0 flex size-10 -translate-y-1/2 items-center justify-center rounded-full",
                  metric.tile,
                )}
              >
                <metric.icon weight="fill" className="size-5" />
              </span>
              {metric.label}
            </dt>
            <dd className="text-lg/7 font-extrabold">{metric.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 rounded-xl bg-container p-4 dark:bg-muted">
        <h3 className="text-[10px]/4 font-semibold text-muted-foreground uppercase">
          Security Status
        </h3>
        <p className={cn("mt-2 flex items-center gap-2 text-sm/5 font-semibold", status.className)}>
          <status.icon aria-hidden weight="bold" className="size-3 shrink-0" />
          {status.label}
        </p>
      </div>
    </DashboardCard>
  );
}
