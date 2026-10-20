import { cn } from "cn";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { PLAN_COLORS } from "@/components/subscriptions/subscription-badges";
import type { MembershipPlan } from "@/types/subscriptions";

// A circumference of 100 in the 36-unit box, so dash lengths read as percentages.
const RADIUS = 50 / Math.PI;
/** "9.8k": by hand, since Node's and the browser's compact notation disagree on the "k". */
const compact = (value: number) =>
  value >= 1_000 ? `${Number((value / 1_000).toFixed(1))}k` : String(value);

/** Members by plan: a ring of each plan's share around the total, with the shares listed below. */
export function PlanDistributionCard({
  plans,
  className,
}: {
  plans: MembershipPlan[];
  className?: string;
}) {
  const total = plans.reduce((sum, plan) => sum + plan.activeSubscribers, 0);
  // Each segment starts where the ones before it end.
  const shares = plans.map((plan, index) => ({
    plan,
    share: total ? (plan.activeSubscribers / total) * 100 : 0,
    offset: total
      ? (plans.slice(0, index).reduce((sum, before) => sum + before.activeSubscribers, 0) / total) *
        100
      : 0,
  }));

  return (
    <DashboardCard className={cn("flex flex-col", className)}>
      <DashboardCardTitle className="text-xl/7 font-semibold">Distribution</DashboardCardTitle>
      <div className="relative mx-auto mt-6 size-56">
        <svg aria-hidden viewBox="0 0 36 36" strokeWidth={3.4} className="size-full -rotate-90">
          {shares.map(({ plan, share, offset }) => (
            <circle
              key={plan.id}
              fill="none"
              cx={18}
              cy={18}
              r={RADIUS}
              className={PLAN_COLORS[plan.id].stroke}
              strokeDasharray={`${share} ${100 - share}`}
              strokeDashoffset={-offset}
            />
          ))}
        </svg>
        <p className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[28px]/9 font-bold tabular-nums">{compact(total)}</span>
          <span className="text-[11px] tracking-wider text-muted-foreground uppercase">Total</span>
        </p>
      </div>
      <ul className="mt-8 flex flex-col gap-2.5">
        {shares.map(({ plan, share }) => (
          <li key={plan.id} className="flex items-center gap-3 text-sm">
            <span
              aria-hidden
              className={cn(
                "size-3.5 rounded-xs border border-border/40",
                PLAN_COLORS[plan.id].swatch,
              )}
            />
            <span className="flex-1">{plan.name}</span>
            <span className="tabular-nums">{Math.round(share)}%</span>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
