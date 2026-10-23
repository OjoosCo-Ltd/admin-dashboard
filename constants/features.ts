/**
 * Admin features the backend can't serve yet. Each flag guards the UI that
 * needs one missing backend capability, and stays false until that capability
 * ships. Every gated feature, with the request that would unblock it, is listed
 * in the "Admin Endpoint Audit" doc (2026-10-22). When an endpoint lands, flip
 * its flag, wire the feature, and mark the request Shipped there.
 */
const flags = {
  // Whole sections
  /** Well-being, resources, assessments and coaching: no routes at all. */
  wellbeing: false,
  /** Plans and subscriptions: no subscription, plan or tier data anywhere. */
  subscriptions: false,
  /** Payments, transactions and revenue: no routes. */
  payments: false,
  /** AI usage, latency, accuracy and model status: no AI metrics routes. */
  aiMetrics: false,
  /** An admin notification feed: GET /notifications is each member's own. */
  adminNotifications: false,
  /** Per-admin notification preferences: no route. */
  notificationPreferences: false,
  /** Role permission grants and custom roles: roles are fixed (User, Admin, Moderator). */
  rolePermissions: false,
  /** An audit log of admin and member actions: nothing records them. */
  auditLog: false,
  /** Platform settings (name, contact, maintenance mode): no settings route. */
  platformSettings: false,
  /** Matching switches, expiry, threshold and daily limit: only the weights have a route. */
  matchingSettings: false,
  /** Community settings (switches, limits, thresholds): no route. */
  communitySettings: false,
  /** An admin's language, date format and timezone: no preferences route. */
  adminPreferences: false,
  /** Email invitations and first-admin setup links: no invite or setup route. */
  adminInvites: false,
  /** A group's member list: no route lists the members of a group. */
  groupMembers: false,

  // Shared page controls
  /** Report and CSV exports: no export route. */
  exports: false,
  /** Date ranges on the page headers: no stats or list route takes from/to. */
  dateRanges: false,
  /** Platform announcements to members: no announcement or push route. */
  announcements: false,
  /** Online status and last-seen: no presence data. */
  presence: false,
  /** Server-generated insight cards: no insights route. */
  insights: false,

  // The signed-in admin
  /** Listing and ending an admin's sessions and devices: no session routes. */
  adminSessions: false,
  /** Two-factor sign-in: no MFA routes. */
  mfa: false,
  /** An admin's phone, photo, timezone and password-change date: no fields or routes. */
  adminProfileExtras: false,

  // Trust and safety
  /** Fraud counts (duplicate or forged IDs, banned faces): nothing records them. */
  fraudSignals: false,
  /** Verification risk and priority: no risk field. */
  verificationRisk: false,
  /** Internal notes on a verification case: no notes field or route. */
  verificationNotes: false,
  /** Asking a member for new documents: no resubmission status or route. */
  verificationResubmission: false,
  /** Breakdowns by country (verifications, members): no route groups by country. */
  geoBreakdown: false,
  /** Report priority: no priority field, enum or filter. */
  reportPriority: false,
  /** Assigning a report to a moderator: no assignee field. */
  reportAssignment: false,
  /** What closed each report: no resolution source is recorded. */
  reportAnalytics: false,
  /** Searching report lists: neither report list takes a search param. */
  reportSearch: false,
  /** Reports on comments and profile photos: only posts can be reported. */
  replyReports: false,
  /** Platform security status: no security status route. */
  securityStatus: false,

  // Matching and conversations
  /** Flagging a match for review, and a Reported state: no match report or flag route. */
  matchFlags: false,
  /** Keeping a pair out of future matching: no exclusion route. */
  matchExclusion: false,
  /** Flagging a conversation for senior review: no flag route. */
  conversationFlags: false,
  /** Profile views: a match records no viewedAt. */
  profileViews: false,

  // Virtual dates
  /** Attendance, duration and a live state: an invitation records only its start. */
  dateAttendance: false,
  /** Reporting a virtual date: no report route or field. */
  dateReports: false,
  /** Messaging members from the admin: no admin notify route. */
  memberMessaging: false,

  // Community
  /** Event photos and group icons: no image field or upload route. */
  eventMedia: false,
  /** Searching events and filtering by attendance: no search or capacity params. */
  eventFilters: false,
  /** A group's privacy: no privacy field. */
  groupPrivacy: false,
  /** Per-group growth, activity and resolution metrics: no group stats route. */
  groupAnalytics: false,
  /** Adding members to a group: only the member themselves can join. */
  groupInvites: false,
  /** Locking a thread: posts have no lock. */
  threadLocks: false,
  /** Muting a group member: no mute route. */
  memberMutes: false,

  // Members
  /** A member's job title and company: no headline field. */
  profileHeadline: false,
} satisfies Record<string, boolean>;

export type Feature = keyof typeof flags;

/** Read as `FEATURES.payments && <PaymentsCard />`; typed `boolean` so a flip needs no other change. */
export const FEATURES: Record<Feature, boolean> = flags;

/** Keeps the items whose feature is on. Items without a `feature` always stay. */
export function enabled<T extends { feature?: Feature }>(items: readonly T[]): T[] {
  return items.filter((item) => !item.feature || FEATURES[item.feature]);
}
