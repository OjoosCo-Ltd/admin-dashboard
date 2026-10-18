/**
 * Shapes the notifications UI renders. ⚠️ PROVISIONAL: modeled on the Figma.
 * The backend's GET /notifications (page, limit) and PATCH /notifications/read
 * serve members' notifications; there's no admin feed to map onto yet.
 */

/** The tabs: what part of the platform a notification comes from. */
export type NotificationType =
  "users" | "verification" | "safety" | "payments" | "community" | "subscriptions";

export type NotificationPriority = "low" | "medium" | "high" | "critical";

export interface AdminNotification {
  id: string;
  type: NotificationType;
  /** The finer grouping the panel shows and the Category filter narrows by: "Identity Auth". */
  category: string;
  priority: NotificationPriority;
  title: string;
  /** The card's line under the title. */
  summary: string;
  /** The panel's full account. */
  description: string;
  /** Which list group it sits in. */
  day: "today" | "yesterday";
  /** Already relative: "12m ago". */
  ago: string;
  /** Already formatted: "Aug 11, 2026, 1:52 PM". */
  date: string;
  /** "VER-10482". */
  refId: string;
  unread: boolean;
  /** Handled: counted under Resolved, and filtered by Status. */
  resolved: boolean;
  /** The member it's about, shown at the foot of the panel. */
  user?: { name: string; id: string; avatarUrl?: string };
  /** Where its button goes: "Review Verification" → /verification. */
  action: { label: string; href: string };
}

export interface NotificationCounts {
  all: number;
  unread: number;
  highPriority: number;
  resolved: number;
}
