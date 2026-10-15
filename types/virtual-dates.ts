/**
 * Shapes the Virtual Dates page renders. ⚠️ PROVISIONAL: modeled on the Figma.
 * GET /admin/virtual-dates (ENDPOINTS.virtualDates.list) pages by `status`
 * (PENDING | ACCEPTED | RESCHEDULE_REQUESTED | DECLINED | CANCELLED | EXPIRED |
 * COMPLETED | MISSED) and `kind` (MOVIE | MEAL | GAME | SHOP). The Figma's
 * "Live" has no backend status; POST …/{id}/cancel cancels a date.
 */

/** The four date kinds, as the backend's `kind` names them. */
export type DateTheme = "movie" | "game" | "meal" | "shop";

export interface DateActivityPoint {
  label: string;
  bookings: number;
  /** US dollars. */
  revenue: number;
}

export interface SessionStatusSummary {
  total: number;
  shares: { id: "completed" | "upcoming" | "cancelled"; label: string; percent: number }[];
}

export interface ThemeShare {
  id: DateTheme;
  label: string;
  percent: number;
}

export interface DateInsight {
  id: string;
  title: string;
  body: string;
}

export interface Satisfaction {
  /** Average rating out of 5. */
  average: number;
  /** Share of ratings at each star, 1★ first, percent. */
  shares: number[];
}

export interface DateParticipant {
  id: string;
  name: string;
  avatarUrl?: string;
}

/** Who turned up: both, one of the two, not yet (pending), or neither. */
export type DateAttendance = "both" | "one" | "pending" | "no-show";

export type DateSessionStatus = "completed" | "live" | "upcoming" | "cancelled";

export type DateStatusFilter = "all" | DateSessionStatus;

export interface VirtualDateSession {
  id: string;
  /** The public ID shown with a leading #, e.g. "VD-89421". */
  publicId: string;
  participants: [DateParticipant, DateParticipant];
  /** Shown as the session's theme: "Game Date", "Movie Night". */
  title: string;
  theme: DateTheme;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  attendance: DateAttendance;
  /** Out of 5, once both have rated it. */
  rating?: number;
  status: DateSessionStatus;
  /** Reported or under moderation: the row turns red and its action opens the review. */
  flagged: boolean;
}
