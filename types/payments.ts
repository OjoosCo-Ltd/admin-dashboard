import type { BillingCycle, PlanId } from "@/types/subscriptions";

/**
 * Shapes the payments UI renders. ⚠️ PROVISIONAL: modeled on the Figma. The
 * backend has no payment, transaction or revenue routes yet. Amounts are in
 * BILLING_CURRENCY (constants/billing.ts).
 */

export type PaymentStatus = "successful" | "failed" | "refunded" | "pending";

export type PaymentMethodKind = "card" | "paypal" | "apple-pay" | "bank-transfer";

export interface PaymentMethod {
  kind: PaymentMethodKind;
  /** "Visa", "Mastercard", "PayPal", "Apple Pay", "Bank Transfer". */
  label: string;
  /** Cards only: "4242". */
  last4?: string;
  /** Cards only: the short brand the table shows ("Visa", "MC"). */
  shortLabel?: string;
}

/** What the charge was for, as the sheet's Transaction Type says it. */
export type TransactionKind = "new-subscription" | "renewal" | "upgrade";

/** One step of a transaction's history, oldest last as the sheet lists them. */
export interface TransactionEvent {
  id: string;
  label: string;
  /** Already formatted: "Oct 20, 2026 · 14:32:45". */
  at: string;
  /**
   * Milestones (paid, refunded, receipt sent) are done: a green check. Failures
   * get a red cross, routine steps (initiated, processing) the Figma's grey dot,
   * and a step still waiting an amber ring.
   */
  state: "done" | "step" | "failed" | "waiting";
}

export interface Transaction {
  /** "TRX-8942-A1". The UI adds the "#". */
  id: string;
  customer: {
    name: string;
    email: string;
    /** "USR-4892-X". */
    userId: string;
    country: string;
    avatarUrl?: string;
  };
  /** What was bought: a plan on a billing cycle ("Premium Sub (Annual)"). */
  plan: PlanId;
  cycle: BillingCycle;
  kind: TransactionKind;
  /** What the customer was charged (gross). */
  amount: number;
  /** What the gateway kept. Zero when nothing was captured. */
  fee: number;
  /** Refunded to the customer, for refunded payments. */
  refunded?: number;
  method: PaymentMethod;
  /** The gateway that processed it: "Stripe", "PayPal", "Apple Pay", "Bank transfer". */
  gateway: string;
  /** The gateway's word for where the money is: "Captured", "Declined", "Refunded", "Awaiting funds". */
  authStatus: string;
  /** The gateway's charge reference, shortened for display: "ch_3Nkx...9lqX". */
  reference: string;
  /** Already formatted: "Oct 20, 2026" and "14:32". */
  date: string;
  time: string;
  status: PaymentStatus;
  /** Already formatted. None for a failed payment that hasn't been retried, or a refunded one. */
  nextRenewal?: string;
  /** Newest first. */
  timeline: TransactionEvent[];
}

/** The Revenue Overview switch: 7D / 1M / 3M / YTD. */
export type RevenueRange = "7d" | "1m" | "3m" | "ytd";

/** One point of Revenue Overview: what was charged (gross) and kept after fees and refunds (net). */
export interface RevenuePoint {
  /** The axis label: a day or the last day of a week ("Oct 20"), or a month ("Jan"). */
  label: string;
  /** The tooltip's longer label: "Oct 20, 2026 (today)", "Oct 14–20, 2026", "Oct 2026 (to date)". */
  detail: string;
  gross: number;
  net: number;
}

export interface FinancialInsight {
  id: string;
  /** The dot: teal for an observation, green for good news, red for a risk. */
  tone: "info" | "success" | "risk";
  title: string;
  body: string;
}
