import { portrait } from "@/constants/sample-portraits";
import type { CompactKpi } from "@/types/kpi";
import type {
  FunnelStage,
  MatchActivityPoint,
  MatchDetail,
  MatchParticipant,
  ScoreDistribution,
} from "@/types/matches";

// UI only: the figures from the Matches Figma, so the page renders before
// /admin/matching/* is typed and wired.

// The Figma's copy is adjusted where it doesn't fit the metric: Acceptance Rate
// reads "7z%" there, and Active Chats repeats Verification's "-15s".
export const SAMPLE_MATCH_KPIS: CompactKpi[] = [
  {
    id: "total-matches",
    label: "Total Matches",
    value: "1.2M",
    change: { label: "12%", direction: "up", favorable: true, comparison: "vs last month" },
    trend: [10, 12, 11, 14, 13, 15, 14, 17, 16, 18, 17, 20, 19, 22, 21, 24, 26],
  },
  {
    id: "created-today",
    label: "Created Today",
    value: "4,216",
    change: { label: "5.4%", direction: "up", favorable: true, comparison: "vs yesterday" },
    trend: [10, 9, 18, 12, 7, 14, 13, 20, 16, 12, 26],
  },
  {
    id: "acceptance-rate",
    label: "Acceptance Rate",
    value: "72%",
    change: { label: "2.1%", direction: "down", favorable: false, comparison: "vs last month" },
    trend: [8, 9, 8, 11, 12, 11, 14, 13, 17, 16, 18, 21, 20, 24],
  },
  {
    id: "active-chats",
    label: "Active Chats",
    value: "85.4k",
    change: { label: "4.6%", direction: "up", favorable: true, comparison: "vs last month" },
    trend: [10, 11, 10, 12, 12, 14, 13, 16, 15, 17, 16, 18, 20],
  },
  {
    id: "virtual-dates",
    label: "Virtual Dates",
    value: "12,300",
    change: { label: "0.8%", direction: "up", favorable: true, comparison: "vs last month" },
    trend: [9, 10, 9, 12, 11, 13, 15, 14, 17, 16, 19, 18, 22],
  },
  {
    id: "avg-comp-score",
    label: "Avg Comp Score",
    value: "84%",
    change: { label: "+3", direction: "up", favorable: true, comparison: "vs last month" },
    trend: [7, 8, 7, 9, 8, 10, 12, 11, 14, 13, 15, 17, 16, 20],
  },
];

export const SAMPLE_MATCH_ACTIVITY: MatchActivityPoint[] = [
  { label: "Oct 15", generated: 1_820, accepted: 1_290 },
  { label: "Oct 16", generated: 2_710, accepted: 1_950 },
  { label: "Oct 17", generated: 2_490, accepted: 1_770 },
  { label: "Oct 18", generated: 3_610, accepted: 2_600 },
  { label: "Oct 19", generated: 3_390, accepted: 2_470 },
  { label: "Oct 20", generated: 4_290, accepted: 3_080 },
  { label: "Oct 21", generated: 3_840, accepted: 2_800 },
  { label: "Oct 22", generated: 4_520, accepted: 3_290 },
  { label: "Oct 23", generated: 4_060, accepted: 2_920 },
  { label: "Oct 24", generated: 3_160, accepted: 2_280 },
];

export const SAMPLE_ENGAGEMENT_FUNNEL: FunnelStage[] = [
  { label: "Matches Generated", percent: 100 },
  { label: "Profiles Viewed", percent: 88, feature: "profileViews" },
  { label: "Matches Accepted", percent: 72 },
  { label: "Conversation Started", percent: 45 },
  { label: "Virtual Date", percent: 12 },
];

export const SAMPLE_SCORE_DISTRIBUTION: ScoreDistribution = {
  average: 84,
  bands: [
    { label: "90-100%", percent: 45 },
    { label: "80-89%", percent: 30 },
  ],
};

const person = (
  uid: string,
  name: string,
  photo?: Parameters<typeof portrait>[0],
): MatchParticipant => ({
  id: `u-${uid}`,
  uid,
  name,
  avatarUrl: photo && portrait(photo),
});

const BREAKDOWN_LABELS = [
  "Personality Fit",
  "Shared Interests",
  "Lifestyle Synergy",
  "Goal Alignment",
];

const breakdown = (...percents: number[]) =>
  percents.map((percent, index) => ({ label: BREAKDOWN_LABELS[index], percent }));

/** The engine's three milestones; a pair that hasn't reached one stops short. */
const journey = (generatedAt: string, acceptedAt?: string, firstMessage?: [string, string]) => [
  { id: "generated", title: "Match Generated", at: generatedAt, source: "AI Engine v4.2" },
  ...(acceptedAt
    ? [{ id: "accepted", title: "Both Accepted", at: acceptedAt, source: "Real-time Notification" }]
    : []),
  ...(firstMessage
    ? [
        {
          id: "first-message",
          title: "First Message Sent",
          at: firstMessage[0],
          source: `${firstMessage[1]} initiated`,
        },
      ]
    : []),
];

/** The most confident pairings the engine made recently. */
export const SAMPLE_HIGH_CONFIDENCE_MATCHES: MatchDetail[] = [
  {
    id: "m-9821",
    publicId: "MT-9821",
    users: [
      person("3310-DO", "Daniel Okafor", "men/49"),
      person("7752-MC", "Maya Chen", "women/90"),
    ],
    compatibility: 96,
    aiConfidence: 99.8,
    matchedAt: "2026-10-24T13:05:00Z",
    conversation: "high-engagement",
    status: "active",
    breakdown: breakdown(97, 94, 95, 96),
    totalMessages: 118,
    avgReplyMinutes: 6,
    timeline: journey("2026-10-24T13:05:00Z", "2026-10-24T13:20:00Z", [
      "2026-10-24T13:31:00Z",
      "Maya",
    ]),
  },
  {
    id: "m-9819",
    publicId: "MT-9819",
    users: [
      person("5021-RH", "Ryan Hughes", "men/88"),
      person("6634-ZL", "Zoe Laurent", "women/56"),
    ],
    compatibility: 92,
    aiConfidence: 98.2,
    matchedAt: "2026-10-24T12:48:00Z",
    conversation: "high-engagement",
    status: "active",
    breakdown: breakdown(93, 88, 92, 94),
    totalMessages: 64,
    avgReplyMinutes: 9,
    timeline: journey("2026-10-24T12:48:00Z", "2026-10-24T13:02:00Z", [
      "2026-10-24T13:10:00Z",
      "Ryan",
    ]),
  },
];

/** Every match, for the count and pages while no filter is set. */
export const SAMPLE_MATCH_COUNT = 12_450;

export const SAMPLE_MATCHES: MatchDetail[] = [
  {
    id: "m-90210",
    publicId: "MX-90210",
    users: [
      person("4421-SJ", "Sarah Jenkins", "women/49"),
      person("9022-JC", "James Cooper", "men/79"),
    ],
    compatibility: 94,
    aiConfidence: 97.6,
    matchedAt: "2026-10-24T14:22:00Z",
    conversation: "high-engagement",
    status: "active",
    breakdown: breakdown(98, 82, 91, 89),
    totalMessages: 342,
    avgReplyMinutes: 12,
    timeline: journey("2026-10-24T14:22:00Z", "2026-10-24T14:45:00Z", [
      "2026-10-24T14:52:00Z",
      "Sarah",
    ]),
  },
  {
    id: "m-88432",
    publicId: "MX-88432",
    users: [
      person("2287-EP", "Elena Petrova", "women/60"),
      person("8140-MD", "Mark Davies", "men/41"),
    ],
    compatibility: 88,
    aiConfidence: 94.1,
    matchedAt: "2026-10-24T12:05:00Z",
    conversation: "flagged-terms",
    status: "reported",
    breakdown: breakdown(90, 84, 86, 88),
    totalMessages: 57,
    avgReplyMinutes: 31,
    timeline: journey("2026-10-24T12:05:00Z", "2026-10-24T12:40:00Z", [
      "2026-10-24T12:58:00Z",
      "Mark",
    ]),
  },
  {
    id: "m-87119",
    publicId: "MX-87119",
    users: [person("6608-CM", "Chloe Martin", "women/72"), person("1975-AK", "Alex Kim", "men/67")],
    compatibility: 65,
    aiConfidence: 81.3,
    matchedAt: "2026-10-24T09:30:00Z",
    conversation: "no-contact",
    status: "pending",
    breakdown: breakdown(70, 58, 66, 64),
    totalMessages: 0,
    avgReplyMinutes: 0,
    timeline: journey("2026-10-24T09:30:00Z"),
  },
  {
    id: "m-86940",
    publicId: "MX-86940",
    users: [person("3092-NP", "Nina Park", "women/80"), person("4417-OH", "Omar Haddad", "men/86")],
    compatibility: 91,
    aiConfidence: 96.4,
    matchedAt: "2026-10-23T21:14:00Z",
    conversation: "high-engagement",
    status: "active",
    breakdown: breakdown(92, 89, 90, 93),
    totalMessages: 205,
    avgReplyMinutes: 8,
    timeline: journey("2026-10-23T21:14:00Z", "2026-10-23T21:40:00Z", [
      "2026-10-23T21:47:00Z",
      "Omar",
    ]),
  },
  {
    id: "m-86512",
    publicId: "MX-86512",
    users: [person("7781-GL", "Grace Lee", "women/85"), person("2264-LR", "Leo Russo", "men/62")],
    compatibility: 79,
    aiConfidence: 90.7,
    matchedAt: "2026-10-23T17:02:00Z",
    conversation: "no-contact",
    status: "active",
    breakdown: breakdown(82, 74, 80, 78),
    totalMessages: 0,
    avgReplyMinutes: 0,
    timeline: journey("2026-10-23T17:02:00Z", "2026-10-23T19:30:00Z"),
  },
  {
    id: "m-85977",
    publicId: "MX-85977",
    users: [
      person("9930-AB", "Ava Brooks", "women/94"),
      person("5518-EW", "Ethan Wright", "men/97"),
    ],
    compatibility: 71,
    aiConfidence: 86.9,
    matchedAt: "2026-10-23T11:45:00Z",
    conversation: "no-contact",
    status: "pending",
    breakdown: breakdown(75, 66, 72, 70),
    totalMessages: 0,
    avgReplyMinutes: 0,
    timeline: journey("2026-10-23T11:45:00Z"),
  },
];
