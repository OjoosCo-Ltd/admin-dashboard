/**
 * Shapes the dashboard overview UI renders. ⚠️ PROVISIONAL: modeled on the
 * Figma, not on API responses. The /admin/dashboard/* routes are untyped
 * (see actions/dashboard-actions.ts); map them onto these when they're wired.
 */
import type { Feature } from "@/constants/features";

/** Color family of a headline KPI: its icon tile, sparkline and trend. */
export type KpiTone =
  "primary" | "success" | "success-strong" | "premium" | "destructive" | "caution";

export interface KpiStat {
  id: string;
  /** Hidden while this feature is off (filter the row with `enabled`). */
  feature?: Feature;
  label: string;
  value: number;
  /** Percent change, e.g. 8.3 for +8.3%. */
  change: number;
  /** What the change compares against: "vs last month". */
  comparison: string;
  tone: KpiTone;
  /** Oldest to newest, for the sparkline. A card without one shows its note there. */
  trend?: number[];
  /** Replaces the change in the top corner, e.g. "Action needed". */
  badge?: string;
  /** A line along the bottom, e.g. "Review required within 24h". */
  note?: string;
}

/** The second row of smaller cards. `tone` colors the note; attention highlights the card. */
export interface OpsMetric {
  id: "revenue" | "ai-match" | "virtual-dates" | "pending-verifications";
  /** Hidden while this feature is off (filter the row with `enabled`). */
  feature?: Feature;
  label: string;
  value: string;
  note: string;
  tone: "positive" | "primary" | "neutral" | "attention";
}

export type GrowthRange = "7d" | "30d" | "90d" | "1y";

export interface GrowthPoint {
  label: string;
  /** New users in the bucket. */
  value: number;
}

export interface AiPerformance {
  /** Compatibility accuracy, percent. */
  accuracy: number;
  /** Change in accuracy, percentage points. */
  change: number;
  avgResponseSeconds: number;
  suggestions: number;
}

export interface TrustSafety {
  fraudAttempts: number;
  /** Percent change vs last week, e.g. -40. */
  fraudChange: number;
  reportedProfiles: number;
  /** Verification throughput, percent. */
  verificationThroughput: number;
}

export interface RevenueLine {
  id: "premium" | "elite" | "boosts";
  label: string;
  /** This month, in USD. */
  amount: number;
}

export interface EngagementSegment {
  id: "accepted" | "active-chat" | "scheduled";
  label: string;
  /** Percent of all matches. The segments sum to the active share. */
  value: number;
}

export interface MatchEngagement {
  /** Percent of matches that are active (the segments' total). */
  activeShare: number;
  segments: EngagementSegment[];
}

export interface ActivityItem {
  id: string;
  kind: "verification" | "upgrade" | "virtual-date";
  message: string;
  /** Unread items are bold. */
  unread: boolean;
  /** Already relative, e.g. "2 mins ago". */
  time: string;
}

export type SubscriptionPlan = "elite" | "premium" | "free";

export interface RecentUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  age: number;
  country: string;
  verification: "verified" | "pending";
  plan: SubscriptionPlan;
  online: boolean;
  /** Already relative, e.g. "14m ago". */
  lastActive: string;
}

export interface VerificationCheck {
  id: string;
  label: string;
  status: "passed" | "warning" | "failed";
}

/** An ID verification waiting for an admin's decision. */
export interface VerificationRequest {
  id: string;
  legalName: string;
  /** Display string, e.g. "Passport (United Kingdom)". */
  documentType: string;
  /** ISO 8601. */
  submittedAt: string;
  photoUrl: string;
  documentUrl: string;
  checks: VerificationCheck[];
}

export type AnnouncementAudience = "all" | "premium" | "new";
