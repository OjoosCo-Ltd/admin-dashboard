import type { Feature } from "@/constants/features";

/**
 * Shapes the Matches page renders. ⚠️ PROVISIONAL: modeled on the Figma, not on
 * API responses. GET /admin/matching (ENDPOINTS.matching.list) filters by a
 * status of PENDING | ACCEPTED | REJECTED | EXPIRED | UNMATCHED, so the
 * Figma's "Reported" has no backend status yet; Remove Match maps onto
 * POST /admin/matching/{id}/invalidate. Flag and Exclude have no endpoints.
 */

export interface MatchParticipant {
  id: string;
  /** As the insight sheet prints it: "4421-SJ". */
  uid: string;
  name: string;
  avatarUrl?: string;
}

export type MatchStatus = "active" | "reported" | "pending";

/** How the pair's conversation is going, as the table's pill reads it. */
export type ConversationHealth = "high-engagement" | "flagged-terms" | "no-contact";

export interface MatchTimelineEvent {
  id: string;
  title: string;
  at: string;
  /** What or who triggered it: "AI Engine v4.2". */
  source: string;
}

export interface MatchDetail {
  id: string;
  /** The public ID shown with a leading #, e.g. "MX-90210". */
  publicId: string;
  users: [MatchParticipant, MatchParticipant];
  /** Compatibility score, percent. */
  compatibility: number;
  /** How sure the engine is of the score, percent. */
  aiConfidence: number;
  matchedAt: string;
  conversation: ConversationHealth;
  status: MatchStatus;
  breakdown: { label: string; percent: number }[];
  totalMessages: number;
  avgReplyMinutes: number;
  timeline: MatchTimelineEvent[];
}

export type MatchStatusFilter = "all" | MatchStatus;

export interface MatchActivityPoint {
  label: string;
  generated: number;
  accepted: number;
}

export interface FunnelStage {
  label: string;
  /** Share of generated matches that reach this stage. */
  percent: number;
  /** The capability the stage waits on, while the backend can't count it. */
  feature?: Feature;
}

export interface ScoreDistribution {
  /** Average compatibility, percent. */
  average: number;
  bands: { label: string; percent: number }[];
}
