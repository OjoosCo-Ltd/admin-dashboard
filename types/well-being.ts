/**
 * Shapes the Well-being section renders. ⚠️ PROVISIONAL: modeled on the Figma.
 * The backend has no well-being, resource, assessment or coach routes yet.
 */

export interface WellbeingKpi {
  id: "resources" | "views" | "completions" | "completion-rate" | "coach-sessions";
  label: string;
  value: string;
  /** The muted line under the value: "Past 30 days". */
  note?: string;
  /** Percent, drawn as a bar under the value instead of a note. */
  progress?: number;
}

export type EngagementRange = "1w" | "1m" | "1y";

export interface EngagementSeries {
  /** Numeric x positions and what the axis prints at each tick. */
  ticks: { x: number; label: string }[];
  points: { x: number; label: string; views: number; sessions: number }[];
}

export interface WellbeingInsight {
  /** The headline, with the figure that's picked out in a lighter tint. */
  lead: string;
  highlight: string;
  tail: string;
  detail: string;
}

export type ResourceFormat = "article" | "audio" | "video" | "exercise";

export type ResourceCategory = "mindfulness" | "confidence" | "communication" | "relationships";

export type ResourceStatus = "published" | "draft" | "archived";

export interface WellbeingResource {
  id: string;
  title: string;
  format: ResourceFormat;
  category: ResourceCategory;
  coverUrl?: string;
  views: number;
  /** Share of viewers who finished it, percent; none until it has data. */
  engagement?: number;
  publishedAt: string;
  status: ResourceStatus;
}

export interface WellbeingActivity {
  id: string;
  at: string;
  title: string;
  detail: string;
}

export type QuestionType = "scale" | "multiple-choice" | "yes-no" | "free-text";

export interface LogicRule {
  id: string;
  operator: "is" | "is-not" | "greater-than" | "less-than";
  value: string;
  /** A question id, or "end" for the end of the assessment. */
  skipTo: string;
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  status: "active" | "draft";
  /** "1: Low, 10: High", "4 Options (Multi-select)". */
  hint?: string;
  rules: LogicRule[];
}

export interface AssessmentStat {
  id: "completions" | "score" | "completion-rate" | "time";
  label: string;
  value: string;
  note: string;
  tone: "positive" | "primary";
}

export interface AssessmentFunnel {
  started: number;
  inProgress: number;
  completed: number;
}

export interface AssessmentSettings {
  title: string;
  /** "4m 12s". */
  estimatedTime: string;
  scoringModel: string;
  requireCompletion: boolean;
  showProgress: boolean;
}

export interface CoachKpi {
  id: "sessions" | "bookings" | "rating" | "revenue";
  label: string;
  value: string;
  /** Printed after the value, e.g. "/ 5.0". */
  suffix?: string;
  /** Percent change against last month. */
  change: number;
}

export type CoachStatus = "available" | "in-session" | "away";

export interface Coach {
  id: string;
  name: string;
  /** "Senior Relationship Coach". */
  title: string;
  avatarUrl?: string;
  sessionsHosted: number;
  rating: number;
  status: CoachStatus;
}

export type CoachSessionStatus = "scheduled" | "completed" | "cancelled";

export interface CoachSession {
  id: string;
  /** ISO date-time. */
  startsAt: string;
  userId: string;
  coachId: string;
  theme: string;
  status: CoachSessionStatus;
}

export interface CoachServiceConfig {
  acceptingBookings: boolean;
  /** Minutes. */
  sessionLength: number;
  /** Dollars per session. */
  rate: number;
  description: string;
}

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

/** A bookable stretch of a day, as 24-hour "HH:mm". */
export interface HoursRange {
  start: string;
  end: string;
}

export interface CoachAvailability {
  coachId: string;
  sessionLength: number;
  timezone: string;
  /** No ranges means the coach is unavailable that day. */
  week: Record<Weekday, HoursRange[]>;
}
