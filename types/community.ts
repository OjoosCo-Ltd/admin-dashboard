/**
 * Shapes the community UI renders. ⚠️ PROVISIONAL: modeled on the Figma, not on
 * API responses. Map /admin/community/* (libs/api/endpoints.ts) onto these when
 * they're wired.
 */

export type GroupStatus = "active" | "inactive";

export type GroupPrivacy = "public" | "private";

/**
 * The glyph a group without a photo shows, and the one on its dashboard's
 * header tile. ⚠️ PROVISIONAL: the backend has no group icons yet.
 */
export type GroupGlyph = "books" | "camera" | "hiking" | "plant";

export interface CommunityGroup {
  /** The URL slug: /community/groups/{id}. */
  id: string;
  name: string;
  description: string;
  /**
   * The Figma's labels ("Lifestyle", "Creative", "Outdoors"). The backend's
   * categories are its ten interest enums (GROUP_CATEGORIES).
   */
  category: string;
  /** A photo thumbnail. Without one the group shows its glyph on a tile. */
  imageUrl?: string;
  glyph: GroupGlyph;
  privacy: GroupPrivacy;
  /** Already formatted: "Jul 2026". */
  createdOn: string;
  members: number;
  /** Members active in the last 30 days. */
  activeMembers: number;
  /** The Figma's change under the active count, as shown: "~0.6%". */
  activeChange: string;
  discussions: number;
  /** Already relative: "Today, 10:42 AM", "Yesterday". */
  lastActivity: string;
  status: GroupStatus;
}

/** One point of Community Growth. `day` counts from Jan 1, which places it on the month axis. */
export interface CommunityGrowthPoint {
  day: number;
  /** Names the point in the tooltip: "Jan 26". */
  label: string;
  activeMembers: number;
  newMembers: number;
}

/** A Recent Activity entry on the Groups tab's timeline. */
export interface CommunityActivity {
  id: string;
  /** Bold first line: `New group created: "Urban Gardeners"`. */
  title: string;
  /** Second line: `by Admin Sarah • 10m ago`. */
  detail: string;
  /** The dot's color: creations teal, platform signals slate, publishing grey. */
  tone: "action" | "review" | "neutral";
}

/** The Groups tab's Smart Insight card. */
export interface CommunityInsight {
  text: string;
  /** The group "View Group Details" opens. */
  groupId: string;
}

export type MemberStatus = "active" | "muted" | "banned";

export interface GroupMember {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  /** Already formatted: "Oct 12, 2023". */
  joinedOn: string;
  /** Already relative: "2 hours ago". */
  lastActive: string;
  /** 0–100. */
  activityScore: number;
  status: MemberStatus;
}

export type DiscussionStatus = "open" | "pinned" | "locked";

export interface GroupDiscussion {
  id: string;
  title: string;
  /** The opening lines, already shortened: "Let's compile a list…". */
  excerpt: string;
  creator: { name: string; avatarUrl?: string };
  replies: number;
  /** Already formatted: "3.2k". Discussions under report show their report count instead. */
  views?: string;
  reports?: number;
  status: DiscussionStatus;
}

/** A Top Discussions entry: its rank, reply count and an optional tag. */
export interface TopDiscussion {
  id: string;
  title: string;
  replies: number;
  tag?: { label: string; tone: "trending" | "event" };
}

export type ReportReason = "harassment" | "spam" | "nsfw";

export type ReportPriority = "medium" | "high" | "critical";

export type ReportStatus = "new" | "reviewing";

export interface GroupReport {
  /** "REP-8942". The UI adds the "#". */
  id: string;
  /** What was reported, as the queue shows it: a quote or a description. */
  content: string;
  /** Where it was posted: "Comment on Post #442". */
  source: string;
  /** Picks the content tile: a comment, a link post, or a profile photo. */
  kind: "comment" | "link" | "image";
  /** The reported image, for `image` reports. Shown blurred. */
  imageUrl?: string;
  reason: ReportReason;
  /** "@jane_doe", or "Auto-Mod" when the filters raised it. */
  reporter: string;
  /** Already formatted: "Today, 10:42 AM". */
  reportedAt: string;
  priority: ReportPriority;
  status: ReportStatus;
}

/** A Recent Activity entry on a group's overview. */
export interface GroupActivity {
  id: string;
  text: string;
  /** Already relative: "2 mins ago". */
  time: string;
  kind: "joined" | "discussion" | "report";
}

/** New members in one week of Member Growth. */
export interface MemberGrowthWeek {
  /** "Jun 8 – 14". */
  label: string;
  members: number;
}

export type EventStatus = "draft" | "upcoming" | "live" | "completed" | "cancelled";

/** The backend's event types (CreateEventDto.type). */
export type EventType = "virtual" | "physical";

/** Where an event is held: a group, or the platform-wide "General Community". */
export interface EventCommunity {
  name: string;
  /** Set when the community is a group with a dashboard. */
  groupId?: string;
}

/** A Recent Activity entry in an event's sheet. */
export interface EventActivity {
  id: string;
  text: string;
  /** Already relative: "10 mins ago". */
  time: string;
  /** Joins are teal, cancelled RSVPs red. */
  kind: "joined" | "cancelled";
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  /** The table's thumbnail and the sheet's banner. */
  imageUrl: string;
  /** The table's date and time: "July 20th, 2025", "10:30 PM". */
  date: string;
  time: string;
  /** The sheet's date and span: "Jul 20, 2025", "10:30 PM - 12:00 AM EST". */
  shortDate: string;
  timeRange: string;
  /** Local start, for the edit form's inputs: "2025-07-20T22:30". */
  startsAt: string;
  community: EventCommunity;
  type: EventType;
  attendees: number;
  /** Without one the event is unlimited. */
  capacity?: number;
  status: EventStatus;
  activity: EventActivity[];
}

export type ModerationPriority = "low" | "medium" | "high" | "critical";

export type ModerationStatus = "new" | "under-review";

/** A row of the cross-community Moderation Queue. */
export interface ModerationCase {
  /** "REP-1024". The UI adds the "#". */
  id: string;
  /** What was reported, as the queue quotes it. */
  content: string;
  community: string;
  /** "Sarah J.", or "Auto-Mod". */
  reporter: string;
  /** "Spam", "Harassment", "Profanity". */
  reason: string;
  /** Already relative: "10m ago". */
  submitted: string;
  priority: ModerationPriority;
  status: ModerationStatus;
}
