import { portrait, sampleCover } from "@/constants/sample-portraits";
import type {
  CommunityActivity,
  CommunityEvent,
  CommunityGroup,
  CommunityGrowthPoint,
  CommunityInsight,
  GroupActivity,
  GroupDiscussion,
  GroupMember,
  GroupReport,
  MemberGrowthWeek,
  ModerationCase,
  TopDiscussion,
} from "@/types/community";
import type { CompactKpi } from "@/types/kpi";

// UI only: the figures from the community Figma, so the pages render before
// /admin/community/* is typed and wired. Replace with API data.

export const SAMPLE_COMMUNITY_KPIS: CompactKpi[] = [
  {
    id: "total-groups",
    label: "Total Groups",
    value: "142",
    change: { label: "12%", direction: "up", favorable: true, comparison: "vs last month" },
  },
  {
    id: "total-members",
    label: "Total Members",
    value: "45,210",
    change: { label: "5.4%", direction: "up", favorable: true, comparison: "vs yesterday" },
  },
  {
    id: "active-members",
    label: "Active Members",
    value: "8,194",
    badge: { label: "High", tone: "warm" },
    status: { label: "Stable", tone: "steady" },
  },
  {
    id: "upcoming-events",
    label: "Upcoming Events",
    value: "24",
    badge: { label: "Stable", tone: "cool" },
    change: { label: "0.8%", direction: "up", favorable: true, comparison: "vs last month" },
  },
];

export const SAMPLE_GROUPS: CommunityGroup[] = [
  {
    id: "book-lovers",
    name: "Book Lovers",
    description: "Discussing classics to modern sci-fi, one chapter at a time.",
    category: "Lifestyle",
    imageUrl: "/images/sample/community-books.jpg",
    glyph: "books",
    privacy: "public",
    createdOn: "Jul 2026",
    members: 13_000,
    activeMembers: 89,
    activeChange: "~0.6%",
    discussions: 1_204,
    lastActivity: "Today, 10:42 AM",
    status: "active",
  },
  {
    id: "photography-pros",
    name: "Photography Pros",
    description: "Gear talk and photo critiques.",
    category: "Creative",
    imageUrl: "/images/sample/community-camera.jpg",
    glyph: "camera",
    privacy: "public",
    createdOn: "May 2026",
    members: 8_450,
    activeMembers: 412,
    activeChange: "~4.8%",
    discussions: 856,
    lastActivity: "Yesterday",
    status: "active",
  },
  {
    id: "weekend-hikers",
    name: "Weekend Hikers",
    description: "Trail reviews and meetups.",
    category: "Outdoors",
    glyph: "hiking",
    privacy: "private",
    createdOn: "Mar 2026",
    members: 4_120,
    activeMembers: 32,
    activeChange: "~0.7%",
    discussions: 142,
    lastActivity: "3 days ago",
    status: "inactive",
  },
];

/** For "Showing 1-3 of 142 groups". */
export const SAMPLE_GROUP_TOTAL = 142;

/** Every four weeks or so from Jan 1, up to early May (the Figma's line stops short of Jun). */
export const SAMPLE_COMMUNITY_GROWTH: CommunityGrowthPoint[] = [
  { day: 0, label: "Jan 1", activeMembers: 1_000, newMembers: 470 },
  { day: 26, label: "Jan 27", activeMembers: 1_550, newMembers: 780 },
  { day: 52, label: "Feb 22", activeMembers: 3_100, newMembers: 1_250 },
  { day: 77, label: "Mar 19", activeMembers: 2_600, newMembers: 2_060 },
  { day: 103, label: "Apr 14", activeMembers: 5_300, newMembers: 1_550 },
  { day: 128, label: "May 9", activeMembers: 5_800, newMembers: 2_600 },
];

export const SAMPLE_COMMUNITY_INSIGHT: CommunityInsight = {
  text: "“Book Lovers” is currently the most active community, driving 34% of all platform discussions this week.",
  groupId: "book-lovers",
};

export const SAMPLE_COMMUNITY_ACTIVITY: CommunityActivity[] = [
  {
    id: "1",
    title: "New group created: “Urban Gardeners”",
    detail: "by Admin Sarah • 10m ago",
    tone: "action",
  },
  {
    id: "2",
    title: "Mass join event detected",
    detail: "45 users joined “Book Lovers” • 1h ago",
    tone: "review",
  },
  {
    id: "3",
    title: "Event published",
    detail: "“Sunset Photography Walk” • 3h ago",
    tone: "neutral",
  },
];

// A group's dashboard. Every group shows Book Lovers' figures for now.

export const SAMPLE_GROUP_OVERVIEW_KPIS: CompactKpi[] = [
  {
    id: "total-members",
    label: "Total Members",
    value: "45,210",
    change: { label: "5.4%", direction: "up", favorable: true, comparison: "vs yesterday" },
  },
  {
    id: "active-discussions",
    label: "Active Discussions",
    value: "142",
    change: { label: "12%", direction: "up", favorable: true, comparison: "vs last month" },
  },
  {
    id: "engagement-rate",
    label: "Engagement Rate",
    value: "8,194",
    badge: { label: "High", tone: "warm" },
    status: { label: "Stable", tone: "steady" },
  },
  {
    id: "reported-content",
    label: "Reported Content",
    value: "24",
    valueTone: "critical",
    badge: { label: "Stable", tone: "cool" },
    status: { label: "Action required", tone: "critical" },
  },
];

/** New members per week, oldest first. The last is the current week. */
export const SAMPLE_MEMBER_GROWTH: MemberGrowthWeek[] = [
  { label: "Jun 8 – 14", members: 820 },
  { label: "Jun 15 – 21", members: 920 },
  { label: "Jun 22 – 28", members: 1_120 },
  { label: "Jun 29 – Jul 5", members: 1_020 },
  { label: "Jul 6 – 12", members: 1_320 },
  { label: "Jul 13 – 19", members: 1_420 },
  { label: "Jul 20 – 26", members: 1_740 },
];

export const SAMPLE_GROUP_ACTIVITY: GroupActivity[] = [
  { id: "1", text: "Sarah J. joined the group.", time: "2 mins ago", kind: "joined" },
  { id: "2", text: "Mark T. started a new discussion.", time: "1 hour ago", kind: "discussion" },
  { id: "3", text: "A post was reported for spam.", time: "3 hours ago", kind: "report" },
];

export const SAMPLE_MEMBER_KPIS: CompactKpi[] = [
  {
    id: "total-members",
    label: "Total Members",
    value: "45,210",
    change: { label: "5.4%", direction: "up", favorable: true, comparison: "vs yesterday" },
  },
  {
    id: "new-members",
    label: "New Members (30 Days)",
    value: "142",
    change: { label: "12%", direction: "up", favorable: true, comparison: "vs last month" },
  },
  {
    id: "active-members",
    label: "Active Members",
    value: "89%",
    badge: { label: "High", tone: "warm" },
    status: { label: "Stable", tone: "steady" },
  },
];

export const SAMPLE_MEMBERS: GroupMember[] = [
  {
    id: "sarah-jenkins",
    name: "Sarah Jenkins",
    email: "sarah.j@example.com",
    avatarUrl: portrait("women/44"),
    joinedOn: "Oct 12, 2023",
    lastActive: "2 hours ago",
    activityScore: 92,
    status: "active",
  },
  {
    id: "marcus-thorne",
    name: "Marcus Thorne",
    email: "m.thorne@example.com",
    avatarUrl: portrait("men/32"),
    joinedOn: "Nov 05, 2023",
    lastActive: "1 day ago",
    activityScore: 75,
    status: "active",
  },
  {
    id: "elena-rossi",
    name: "Elena Rossi",
    email: "e.rossi@example.com",
    joinedOn: "Jan 22, 2024",
    lastActive: "3 weeks ago",
    activityScore: 15,
    status: "muted",
  },
];

/** For "Showing 1 to 10 of 1,248 members". */
export const SAMPLE_MEMBER_TOTAL = 1_248;

export const SAMPLE_DISCUSSIONS: GroupDiscussion[] = [
  {
    id: "best-sci-fi-2024",
    title: "Best Sci-Fi Reads of 2024",
    excerpt: "Let's compile a list of the most anticipated science fiction releases…",
    creator: { name: "Jane Smith" },
    replies: 142,
    views: "3.2k",
    status: "pinned",
  },
  {
    id: "spoiler-last-chapter",
    title: "Spoiler discussion: The Last Chapter",
    excerpt: "I can't believe they killed off the main character without warning…",
    creator: { name: "Alex Lee" },
    replies: 45,
    reports: 5,
    status: "open",
  },
  {
    id: "off-topic-friday",
    title: "Off-topic Friday",
    excerpt: "Thread locked due to excessive rule violations regarding politics.",
    creator: { name: "Mark R." },
    replies: 89,
    views: "1.1k",
    status: "locked",
  },
];

/** For "Showing 1-10 of 124 discussions", and the Reported filter's count. */
export const SAMPLE_DISCUSSION_TOTAL = 124;
export const SAMPLE_REPORTED_DISCUSSIONS = 3;

export const SAMPLE_TOP_DISCUSSIONS: TopDiscussion[] = [
  {
    id: "best-sci-fi-2024",
    title: "Best Sci-Fi Reads of 2024",
    replies: 142,
    tag: { label: "Hot", tone: "trending" },
  },
  {
    id: "author-qa-brandon",
    title: "Author Q&A: Brandon S.",
    replies: 98,
    tag: { label: "Event", tone: "event" },
  },
  { id: "monthly-book-club", title: "Monthly Book Club Choice", replies: 85 },
];

export const SAMPLE_REPORT_KPIS: CompactKpi[] = [
  {
    id: "open-reports",
    label: "Open Reports",
    value: "45,210",
    badge: { label: "Past 24h", tone: "neutral" },
  },
  {
    id: "flagged-content",
    label: "Flagged Content",
    value: "142",
    badge: { label: "Past 7 days", tone: "neutral" },
  },
  {
    id: "avg-resolution",
    label: "Avg. Resolution Time",
    value: "4.2 hrs",
    badge: { label: "Current", tone: "neutral" },
  },
];

export const SAMPLE_REPORTS: GroupReport[] = [
  {
    id: "REP-8942",
    content: "“You're an absolute idiot if you think that ending made sense…”",
    source: "Comment on Post #442",
    kind: "comment",
    reason: "harassment",
    reporter: "@jane_doe",
    reportedAt: "Today, 10:42 AM",
    priority: "high",
    status: "new",
  },
  {
    id: "REP-8941",
    content: "“Click here for free e-books of every bestseller…”",
    source: "New Post",
    kind: "link",
    reason: "spam",
    reporter: "Auto-Mod",
    reportedAt: "Today, 09:15 AM",
    priority: "medium",
    status: "reviewing",
  },
  {
    id: "REP-8938",
    content: "Inappropriate Profile Picture",
    source: "User Profile: @reader_x",
    kind: "image",
    imageUrl: portrait("men/75"),
    reason: "nsfw",
    reporter: "@bookworm99",
    reportedAt: "Yesterday, 11:20 PM",
    priority: "critical",
    status: "new",
  },
];

/** For "Showing 1 to 3 of 42 entries". */
export const SAMPLE_REPORT_TOTAL = 42;

// The Events tab.

export const SAMPLE_EVENT_KPIS: CompactKpi[] = [
  {
    id: "total-events",
    label: "Total Events",
    value: "342",
    change: { label: "12%", direction: "up", favorable: true, comparison: "vs last month" },
  },
  {
    id: "upcoming-events",
    label: "Upcoming Events",
    value: "28",
    change: { label: "5.4%", direction: "up", favorable: true, comparison: "vs yesterday" },
  },
  {
    id: "completed-events",
    label: "Completed Events",
    value: "314",
    badge: { label: "High", tone: "warm" },
    status: { label: "Stable", tone: "steady" },
  },
  {
    id: "total-attendees",
    label: "Total Attendees",
    value: "12.4k",
    badge: { label: "Stable", tone: "cool" },
    change: { label: "0.8%", direction: "up", favorable: true, comparison: "vs last month" },
  },
];

/** Where an event can be held: the platform-wide community, or one of the groups. */
export const SAMPLE_EVENT_COMMUNITIES = [
  { name: "General Community" },
  ...SAMPLE_GROUPS.map((group) => ({ name: group.name, groupId: group.id })),
  { name: "Entrepreneurs Group" },
  { name: "Wellness Hub" },
];

export const SAMPLE_EVENTS: CommunityEvent[] = [
  {
    id: "stay-strong-as-one",
    title: "How to Stay Strong as a One",
    description:
      "A focused session on building resilience and maintaining strength during challenging transitions. Designed for community leaders and active participants looking to fortify their foundational skills.",
    imageUrl: sampleCover("stay-strong-keynote", 960, 400),
    date: "July 20th, 2025",
    time: "10:30 PM",
    shortDate: "Jul 20, 2025",
    startsAt: "2025-07-20T22:30",
    timeRange: "10:30 PM - 12:00 AM EST",
    community: { name: "General Community" },
    type: "physical",
    attendees: 128,
    capacity: 250,
    status: "upcoming",
    activity: [
      { id: "1", text: "Sarah Jenkins joined the event.", time: "10 mins ago", kind: "joined" },
      { id: "2", text: "Michael Chen cancelled RSVP.", time: "1 hour ago", kind: "cancelled" },
      { id: "3", text: "David Ross joined the event.", time: "2 hours ago", kind: "joined" },
    ],
  },
  {
    id: "tech-founders-mixer",
    title: "Tech Founders Mixer",
    description:
      "An evening of introductions for founders and early teams: short pitches, open networking and a chance to meet members building in the same space.",
    imageUrl: sampleCover("founders-mixer-network", 960, 400),
    date: "July 15th, 2025",
    time: "6:00 PM",
    shortDate: "Jul 15, 2025",
    startsAt: "2025-07-15T18:00",
    timeRange: "6:00 PM - 8:30 PM EST",
    community: { name: "Entrepreneurs Group" },
    type: "physical",
    attendees: 45,
    capacity: 50,
    status: "live",
    activity: [
      { id: "1", text: "Priya Nair joined the event.", time: "5 mins ago", kind: "joined" },
      { id: "2", text: "Tom Becker joined the event.", time: "20 mins ago", kind: "joined" },
      { id: "3", text: "Lena Fischer cancelled RSVP.", time: "3 hours ago", kind: "cancelled" },
    ],
  },
  {
    id: "mindfulness-workshop",
    title: "Mindfulness Workshop Series",
    description:
      "A guided series on staying present in conversations and on dates: breathing practices, journaling prompts and a calm space to reflect together.",
    imageUrl: sampleCover("mindfulness-hills", 960, 400),
    date: "July 10th, 2025",
    time: "9:00 AM",
    shortDate: "Jul 10, 2025",
    startsAt: "2025-07-10T09:00",
    timeRange: "9:00 AM - 10:30 AM EST",
    community: { name: "Wellness Hub" },
    type: "virtual",
    attendees: 210,
    status: "completed",
    activity: [
      {
        id: "1",
        text: "The session ended with 210 attendees.",
        time: "1 week ago",
        kind: "joined",
      },
      { id: "2", text: "Ana Silva joined the event.", time: "1 week ago", kind: "joined" },
    ],
  },
];

/** For "Showing 1 to 3 of 342 entries". */
export const SAMPLE_EVENT_TOTAL = 342;

// The Moderation tab.

export const SAMPLE_MODERATION_KPIS: CompactKpi[] = [
  {
    id: "open-reports",
    label: "Open Reports",
    value: "142",
    change: { label: "12%", direction: "up", favorable: true, comparison: "vs last month" },
  },
  {
    id: "flagged-discussions",
    label: "Flagged Discussions",
    value: "38",
    change: { label: "5.4%", direction: "up", favorable: true, comparison: "vs yesterday" },
  },
  {
    id: "reported-users",
    label: "Reported Users",
    value: "64",
    badge: { label: "High", tone: "warm" },
    status: { label: "Stable", tone: "steady" },
  },
  {
    id: "resolved-cases",
    label: "Resolved Cases (24h)",
    value: "215",
    badge: { label: "Stable", tone: "cool" },
    change: { label: "0.8%", direction: "up", favorable: true, comparison: "vs last month" },
  },
];

export const SAMPLE_MODERATION_CASES: ModerationCase[] = [
  {
    id: "REP-1024",
    content: "\u201cDiscussion: Unfiltered Takes on the Finale\u201d",
    community: "Book Lovers",
    reporter: "Sarah J.",
    reason: "Spam",
    submitted: "10m ago",
    priority: "medium",
    status: "new",
  },
  {
    id: "REP-1023",
    content: "\u201cImage upload in gallery\u201d",
    community: "Tech Startups",
    reporter: "Mike R.",
    reason: "Harassment",
    submitted: "25m ago",
    priority: "critical",
    status: "under-review",
  },
  {
    id: "REP-1022",
    content: "\u201cUser profile description\u201d",
    community: "Global Nomads",
    reporter: "Auto-Mod",
    reason: "Profanity",
    submitted: "1h ago",
    priority: "low",
    status: "new",
  },
];

/** For "Showing 1 to 3 of 142 entries". */
export const SAMPLE_MODERATION_TOTAL = 142;
