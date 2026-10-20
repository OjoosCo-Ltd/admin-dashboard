/**
 * Shapes the subscriptions UI renders. ⚠️ PROVISIONAL: modeled on the Figma.
 * The backend has no subscription, plan or payment routes yet.
 */

export type PlanId = "free" | "basic" | "premium" | "elite";

/** How often a plan bills. The plan cards' "Yearly" is `annual`. */
export type BillingCycle = "monthly" | "quarterly" | "annual";

export interface PlanFeature {
  id: string;
  title: string;
  detail: string;
  included: boolean;
}

export interface MembershipPlan {
  id: PlanId;
  name: string;
  /** In pounds. Quarterly and annual carry their discounts already. */
  prices: Record<BillingCycle, number>;
  activeSubscribers: number;
  /** Free's card shows its conversion rate where paid plans show MRR, percent. */
  conversionToPaid?: number;
  /** Already formatted: "Jan 12, 2024". */
  createdOn: string;
  /** Percent over the last 30 days, and its change against the month before (points). */
  churnRate: number;
  churnChange: number;
  features: PlanFeature[];
}

export type SubscriptionStatus = "active" | "trial" | "cancelled" | "payment-failed";

export interface SubscriptionEvent {
  id: string;
  label: string;
  /** Already formatted: "Sep 24, 2023". */
  date: string;
  tone: "success" | "neutral" | "warning";
}

export interface Subscription {
  /** "SUB-89021". */
  id: string;
  user: {
    name: string;
    email: string;
    /** "USR-8492A". */
    userId: string;
    location: string;
    avatarUrl?: string;
  };
  plan: PlanId;
  /** Free has no billing cycle. */
  cycle: BillingCycle | null;
  /** What each billing charges, in pounds. */
  amount: number;
  /** Already formatted: "Oct 12, 2022". */
  startedOn: string;
  /** Already formatted. None once cancelled, or on Free. */
  nextRenewal?: string;
  status: SubscriptionStatus;
  /** Set on trials: "Trial (2d left)". */
  trialDaysLeft?: number;
  autoRenew: boolean;
  /** Everything charged so far, in pounds. */
  totalPaid: number;
  lastPayment?: { date: string; method: string; amount: number };
  timeline: SubscriptionEvent[];
}

/** One row of Plan Movement: members who moved between two plans this period. */
export interface PlanMove {
  from: PlanId;
  to: PlanId;
  count: number;
}

export type ChurnPeriod = "30d" | "90d" | "1y";

export interface ChurnReason {
  id: "voluntary" | "involuntary" | "expired" | "cancelled";
  label: string;
  count: number;
}

/** One month of Subscriber Growth & Revenue. */
export interface SubscriberMonth {
  month: string;
  subscribers: number;
  /** Pounds. */
  revenue: number;
}
