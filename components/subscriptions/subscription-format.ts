import type { BillingCycle, PlanId } from "@/types/subscriptions";

// Money is formatted by libs/money.ts, in BILLING_CURRENCY.

export const CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Yearly",
};

/** The unit after a price: "/mo". */
export const PER_CYCLE: Record<BillingCycle, string> = {
  monthly: "/mo",
  quarterly: "/qtr",
  annual: "/yr",
};

export const PLAN_NAMES: Record<PlanId, string> = {
  free: "Free",
  basic: "Basic",
  premium: "Premium",
  elite: "Elite",
};
