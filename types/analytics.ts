import type { Feature } from "@/constants/features";
import type { CompactKpi } from "@/types/kpi";

// ⚠️ PROVISIONAL: modeled on the Analytics Figma. GET /admin/dashboard/* is
// the nearest backend source and isn't typed or wired yet.

export type AnalyticsKpiId =
  | "total-users"
  | "active-users"
  | "matches-created"
  | "active-conversations"
  | "virtual-dates"
  | "revenue";

export interface AnalyticsKpi extends CompactKpi {
  id: AnalyticsKpiId;
}

/** One month of User Growth, oldest first. */
export interface UserGrowthPoint {
  /** "2025-10". */
  month: string;
  /** "Oct". */
  label: string;
  /** Sign-ups that month. */
  registrations: number;
  /** Average daily active users that month. */
  activeUsers: number;
}

export interface EngagementSummary {
  /** DAU / MAU, as a percent. */
  stickiness: number;
  stickinessVerdict: "healthy" | "watch" | "low";
  /** Seconds. */
  avgSessionSeconds: number;
  /** Percent of users who came back this month. */
  returningUsers: number;
}

export interface AlgorithmPerformance {
  /** Percent. */
  predictionAccuracy: number;
  /** Percent. */
  avgMatchScore: number;
}

export type FunnelStageId = "generated" | "viewed" | "accepted" | "conversation" | "virtual-date";

/** A match funnel stage over the last 30 days; its share is its count over the first stage's. */
export interface FunnelStage {
  id: FunnelStageId;
  label: string;
  count: number;
  /** The capability the stage waits on, while the backend can't count it. */
  feature?: Feature;
}

export interface ModelEfficiency {
  /** Percent. */
  accuracy: number;
  /** Percentage points against last week; positive is better. */
  weeklyChange: number;
  description: string;
  /** "v4.2.1 (DeepLink Pro)". */
  model: string;
  status: "active" | "training" | "paused";
}

/**
 * One band of the compatibility histogram, scores `from` to `to` inclusive.
 * Every column is drawn the same width, so bands must be equally wide.
 */
export interface CompatibilityBand {
  /** The axis label: "85%". */
  label: string;
  from: number;
  to: number;
  /** Matches scoring in the band. */
  matches: number;
}

export interface CompatibilityDistribution {
  bands: CompatibilityBand[];
  /** Percent. */
  average: number;
}

export interface EngagementStats {
  /** Percent of virtual dates that ran to the end. */
  completionRate: number;
  /** Out of 5. */
  avgRating: number;
  /** Minutes per virtual date. */
  avgDateMinutes: number;
  activeThreads: number;
  inactiveThreads: number;
}

export type SubscriptionTier = "elite" | "premium" | "basic" | "free";

/** Monthly recurring revenue at the end of a period, by paid tier (Free brings in nothing). */
export interface RevenuePoint {
  /** "Oct", or the date its week starts: "Oct 12". */
  label: string;
  /** What the tooltip names the period: "October 2026", "Week of Oct 12". */
  period: string;
  elite: number;
  premium: number;
  basic: number;
}

export interface SubscriptionRevenue {
  weekly: RevenuePoint[];
  monthly: RevenuePoint[];
}

export interface TierShare {
  tier: SubscriptionTier;
  label: string;
  users: number;
  /** Monthly recurring revenue. */
  mrr: number;
}

export interface CountryShare {
  id: string;
  label: string;
  /** Percent of members. */
  share: number;
}

export interface TrustMetrics {
  /** Percent of profiles verified. */
  verificationRate: number;
  /** Percent of active users reported this month. */
  reportRate: number;
  fraudBlocked: number;
  status: "healthy" | "watch" | "at-risk";
}

export interface AnalyticsInsight {
  id: string;
  kind: "growth" | "feature" | "conversion" | "alert";
  title: string;
  body: string;
}

export interface AnalyticsEvent {
  id: string;
  kind: "milestone" | "deploy" | "report" | "security";
  title: string;
  /** ISO date-time. */
  at: string;
}
