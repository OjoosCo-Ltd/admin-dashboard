import type { ConversationParticipant } from "@/types/conversations";
import type { CompactKpi } from "@/types/kpi";

// ⚠️ PROVISIONAL: modeled on the Reports & Safety Figma. The backend's report
// routes (/admin/chat/reports, /admin/community/reports) aren't typed yet.

export type ReportCategory = "harassment" | "spam" | "fake-profile" | "scam" | "other";

export type ReportPriority = "critical" | "high" | "medium" | "low";

export type ReportStatus = "new" | "reviewing" | "resolved" | "dismissed";

/**
 * Someone named in a report. It carries what the Conversations warn and
 * suspend dialogs show, so they can act on a reported user directly.
 */
export interface ReportPerson extends ConversationParticipant {
  /** "90210". */
  uid: string;
}

export interface ReportedUser extends ReportPerson {
  flagged: boolean;
  /** Earlier warnings on the account. */
  priorWarnings: number;
}

export type Reporter =
  | (ReportPerson & { kind: "member"; verified: boolean; trustScore: number })
  | { kind: "system"; name: string };

export interface SafetyReport {
  /** "REP-8291". */
  id: string;
  reportedUser: ReportedUser;
  reporter: Reporter;
  category: ReportCategory;
  /** 0–100. */
  aiRisk: number;
  priority: ReportPriority;
  /** ISO date-time. */
  submittedAt: string;
  status: ReportStatus;
  evidence: {
    transcript: string;
    imageUrl?: string;
  };
  /** The AI's scores, 0–100, highest concern first. */
  analysis: { label: string; score: number }[];
}

export type ReportKpiId =
  | "open"
  | "resolved-today"
  | "high-priority"
  | "suspended"
  | "banned"
  | "fraud-prevented"
  | "ai-alerts"
  | "resolution-time";

export interface ReportKpi extends CompactKpi {
  id: ReportKpiId;
}

/** One month of Safety Trends; months still to come have no figures. */
export interface SafetyTrendPoint {
  month: string;
  submitted: number | null;
  resolved: number | null;
}

export interface ReportShare {
  category: "fake-profile" | "harassment" | "spam" | "other";
  label: string;
  /** Percent of all reports. */
  share: number;
}

export interface ReportDistribution {
  total: number;
  shares: ReportShare[];
}

export interface SafetyIntelligence {
  threats: {
    count: number;
    description: string;
    /** 0–100, how far the bar fills. */
    progress: number;
  };
  filters: {
    successRate: string;
    description: string;
  };
}

export interface ResolutionSource {
  id: "ai" | "moderator" | "admin";
  label: string;
  share: number;
}

export interface Moderator {
  id: string;
  name: string;
  avatarUrl?: string;
  presence: "online" | "away" | "offline";
  resolved: number;
  /** Percent. */
  accuracy: number;
}
