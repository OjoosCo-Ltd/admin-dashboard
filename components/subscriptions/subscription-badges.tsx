import {
  CheckCircleIcon,
  ClockIcon,
  WarningCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react/ssr";
import { cn } from "cn";

import { PLAN_NAMES } from "@/components/subscriptions/subscription-format";
import type { PlanId, Subscription, SubscriptionStatus } from "@/types/subscriptions";

/**
 * Each plan's color, shared by its badge, the distribution ring and the
 * revenue bars: grey Free, sky Basic, teal Premium, near-black Elite.
 */
export const PLAN_COLORS: Record<PlanId, { stroke: string; fill: string; swatch: string }> = {
  free: {
    stroke: "stroke-[#e6e8eb] dark:stroke-[#3a4246]",
    fill: "fill-[#e6e8eb] dark:fill-[#3a4246]",
    swatch: "bg-muted-strong dark:bg-[#3a4246]",
  },
  basic: { stroke: "stroke-[#cae7f7]", fill: "fill-[#cae7f7]", swatch: "bg-info-soft" },
  premium: {
    stroke: "stroke-[#24637a] dark:stroke-[#3f8aa6]",
    fill: "fill-[#24637a] dark:fill-[#3f8aa6]",
    swatch: "bg-[#24637a] dark:bg-[#3f8aa6]",
  },
  elite: {
    stroke: "stroke-[#0b1f29] dark:stroke-[#8fb3c3]",
    fill: "fill-[#0b1f29] dark:fill-[#8fb3c3]",
    swatch: "bg-[#0b1f29] dark:bg-[#8fb3c3]",
  },
};

const PLAN_BADGES: Record<PlanId, string> = {
  free: "bg-muted-strong text-muted-foreground dark:bg-muted",
  basic: "bg-info-soft text-[#24637a] dark:bg-info-soft/15 dark:text-info-soft",
  premium:
    "border border-[#9cc6d6] bg-[#e4f1f7] text-[#1f5c72] dark:border-action/50 dark:bg-action/20 dark:text-primary",
  elite: "bg-[#0b1f29] text-white dark:bg-[#c9d6dc] dark:text-[#0b1f29]",
};

/** "ELITE": the plan in a small capitalized tag. */
export function PlanBadge({ plan, className }: { plan: PlanId; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-sm px-2 py-0.5 text-[11px]/4 font-bold tracking-wider uppercase",
        PLAN_BADGES[plan],
        className,
      )}
    >
      {PLAN_NAMES[plan]}
    </span>
  );
}

const STATUSES: Record<
  SubscriptionStatus,
  { label: string; icon: typeof CheckCircleIcon; pill: string }
> = {
  active: {
    label: "Active",
    icon: CheckCircleIcon,
    pill: "bg-action-soft text-action dark:bg-action/25 dark:text-primary",
  },
  trial: {
    label: "Trial",
    icon: ClockIcon,
    pill: "bg-[#fbeedd] text-caution dark:bg-caution/25 dark:text-[#e9b97c]",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircleIcon,
    pill: "bg-destructive-soft text-destructive dark:bg-destructive/15",
  },
  "payment-failed": {
    label: "Payment Failed",
    icon: WarningCircleIcon,
    pill: "border border-[#f0b8b3] bg-destructive-soft text-destructive dark:border-destructive/40 dark:bg-destructive/15",
  },
};

/** Active, Trial (2d left), Cancelled or Payment Failed, each with its glyph. */
export function SubscriptionStatusBadge({
  subscription,
}: {
  subscription: Pick<Subscription, "status" | "trialDaysLeft">;
}) {
  const look = STATUSES[subscription.status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[13px]/4 font-medium whitespace-nowrap",
        look.pill,
      )}
    >
      <look.icon aria-hidden weight="bold" className="size-3.5 shrink-0" />
      {look.label}
      {subscription.status === "trial" && subscription.trialDaysLeft !== undefined && (
        <> ({subscription.trialDaysLeft}d left)</>
      )}
    </span>
  );
}
