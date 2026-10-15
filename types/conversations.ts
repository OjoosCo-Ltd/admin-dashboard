import type { GrowthRange } from "@/types/dashboard";

/**
 * Shapes the conversations UI renders. ⚠️ PROVISIONAL: modeled on the Figma,
 * not on API responses. Map /admin/chat/stats, /admin/chat/conversations and
 * /admin/chat/conversations/{id}/messages onto these when they're wired.
 */

/** The table's Safety Status, and what the status filter narrows by. */
export type SafetyStatus = "healthy" | "under-review" | "reported";

/** How much the AI features (ice breakers, reply and date suggestions) were used. */
export type AiAssist = "high" | "medium" | "low" | "none";

export interface ConversationParticipant {
  id: string;
  name: string;
  /** "@m_thompson_92". */
  handle: string;
  avatarUrl?: string;
  /** "New York, USA". */
  location: string;
  /** Where the account stands, which colors its status: good is neutral, restricted amber, suspended red. */
  standing: "good" | "restricted" | "suspended";
  /** The account's state as moderators see it, e.g. "Restricted Visibility". */
  accountStatus: string;
}

export interface SafetyCheck {
  id: string;
  label: string;
  result: "safe" | "needs-review";
}

interface EvidenceMessageBase {
  id: string;
  /** A participant's id. */
  authorId: string;
  /** Local to the incident's zone, e.g. "14:15:02". */
  time: string;
}

/**
 * One message in the evidence transcript: its text, with any removed words
 * already marked ("[Explicit Language Removed]"), or only the reason the AI
 * withheld all of it ("PRIVACY: PERSONAL CONTACT INFORMATION").
 */
export type EvidenceMessage =
  | (EvidenceMessageBase & {
      text: string;
      /** Set on the message that tripped a safety rule, e.g. "Inappropriate Language Policy Violation (Section 4.2)". */
      violation?: string;
      redaction?: never;
    })
  | (EvidenceMessageBase & { redaction: string; text?: never; violation?: never });

/** The reviewable record of a reported or flagged conversation. */
export interface ConversationEvidence {
  /** "REV-99284". */
  caseId: string;
  priority: "low" | "medium" | "high";
  /** Already formatted with its zone, e.g. "Oct 24, 2023, 14:32:11 GMT-5". */
  incidentTime: string;
  /** The transcript's day, e.g. "October 24, 2023". */
  day: string;
  /** Oldest first. */
  messages: EvidenceMessage[];
  /** "2 mins ago by system-bot". */
  lastLog: string;
}

/** One row of Conversation Management, with everything its detail sheet shows. */
export interface Conversation {
  /** "CNV-84920". The UI adds the "#". */
  id: string;
  participants: [ConversationParticipant, ConversationParticipant];
  /** Already formatted, e.g. "Oct 12, 2023". */
  matchedOn: string;
  messageCount: number;
  /** Already relative, e.g. "2m ago", or "Active Now". */
  lastActivity: string;
  aiAssist: AiAssist;
  safety: SafetyStatus;
  /** Shown beside the id in the sheet. */
  state: "active" | "paused" | "closed";
  /** Already formatted: "4d 12h". */
  duration: string;
  /** Already formatted: "14m". */
  avgReply: string;
  mediaShared: number;
  /** The AI's conversation quality score, percent. */
  quality: number;
  /** The AI features the pair used, e.g. ["Ice Breakers", "Date Suggestions"]. */
  featuresUsed: string[];
  /** Sentiment per period, oldest first, 0–100. */
  sentiment: number[];
  safetyChecks: SafetyCheck[];
  /** The participant the safety systems flagged: who a warning or suspension targets first. */
  flaggedParticipantId?: string;
  /**
   * Present only when the content may be reviewed: the conversation was
   * reported, flagged by the safety systems, or needs moderation.
   */
  evidence?: ConversationEvidence;
}

/** The 7D / 30D / 90D / 1Y switch the dashboard's growth chart uses (GROWTH_RANGES). */
export type ActivityRange = GrowthRange;

/** Conversation Activity for one range. `x` runs in the ticks' units (e.g. days since the range began). */
export interface ActivitySeries {
  /** Oldest to newest. `label` names the point in the tooltip, e.g. "Wed 12:00". */
  points: { x: number; label: string; value: number }[];
  /** The x-axis labels and where they sit. */
  ticks: { x: number; label: string }[];
}

export interface HealthSegment {
  id: "healthy" | "reported" | "flagged" | "inactive";
  label: string;
  count: number;
}

export interface ConversationHealthSummary {
  /** Percent, shown in the donut's center. */
  score: number;
  /** The word under the score, e.g. "Optimal". */
  verdict: string;
  segments: HealthSegment[];
}

export interface AiEngagementFeature {
  id: string;
  label: string;
  /** Percent of conversations that used it. */
  value: number;
}
