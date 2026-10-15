import { portrait } from "@/constants/sample-portraits";
import type {
  ActivityRange,
  ActivitySeries,
  AiEngagementFeature,
  Conversation,
  ConversationHealthSummary,
  ConversationParticipant,
} from "@/types/conversations";
import type { CompactKpi } from "@/types/kpi";

// UI only: the figures from the conversations Figma, so the page renders
// before /admin/chat/* is typed and wired. Replace with API data.

export const SAMPLE_CONVERSATION_KPIS: CompactKpi[] = [
  {
    id: "active-conversations",
    label: "Active Conversations",
    value: "12,482",
    change: { label: "12%", direction: "up", favorable: true, comparison: "vs last month" },
  },
  {
    id: "messages-today",
    label: "Messages Today",
    value: "84.2k",
    change: { label: "5.4%", direction: "up", favorable: true, comparison: "vs yesterday" },
  },
  {
    id: "avg-response-time",
    label: "Avg Response Time",
    value: "14m",
    // The Figma draws this one red, though a faster reply reads as good news.
    change: { label: "-2m", direction: "down", favorable: false, comparison: "vs last month" },
  },
  {
    id: "ai-starters",
    label: "AI Starters Used",
    value: "32.1%",
    status: { label: "Stable", tone: "steady" },
  },
  {
    id: "flagged-conversations",
    label: "Flagged Conversations",
    value: "142",
    status: { label: "Critical", tone: "critical" },
  },
  {
    id: "moderation-cases",
    label: "Moderation Cases",
    value: "24",
    change: { label: "0.8%", direction: "up", favorable: true, comparison: "vs last month" },
  },
];

const HOURS = ["00:00", "12:00"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** A smooth, repeatable wave for the longer ranges (no randomness, so server and client agree). */
const wave = (index: number, base: number, swing: number, growth: number) =>
  Math.round(
    base + swing * Math.sin(index * 0.9) + swing * 0.4 * Math.sin(index * 2.3) + growth * index,
  );

const JUNE_TO_JULY = Array.from({ length: 30 }, (_, index) =>
  index < 6 ? `Jun ${25 + index}` : `Jul ${index - 5}`,
);
const MONTHS = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

/** Conversations active per period. The 7D week is sampled twice a day to follow the Figma's curve. */
export const SAMPLE_CONVERSATION_ACTIVITY: Record<ActivityRange, ActivitySeries> = {
  // The week so far: the line stops at "now" (Sat 21:00), as the Figma's does, with Sun still on the axis.
  "7d": {
    points: [
      ...[2000, 2620, 2500, 2770, 4860, 6300, 4270, 1980, 4920, 8910, 9250, 6940].map(
        (value, index) => ({
          x: index / 2,
          label: `${DAYS[Math.floor(index / 2)]} ${HOURS[index % 2]}`,
          value,
        }),
      ),
      { x: 5.875, label: "Sat 21:00", value: 5250 },
    ],
    ticks: DAYS.map((label, x) => ({ x, label })),
  },
  "30d": {
    points: JUNE_TO_JULY.map((label, x) => ({ x, label, value: wave(x, 4200, 900, 95) })),
    ticks: [0, 5, 10, 15, 20, 25, 29].map((x) => ({ x, label: JUNE_TO_JULY[x] })),
  },
  "90d": {
    points: Array.from({ length: 13 }, (_, x) => ({
      x,
      label: `Week ${x + 1}`,
      value: wave(x, 28_000, 4_000, 900),
    })),
    ticks: Array.from({ length: 13 }, (_, x) => ({ x, label: `W${x + 1}` })),
  },
  "1y": {
    points: MONTHS.map((label, x) => ({ x, label, value: wave(x, 96_000, 14_000, 5_200) })),
    ticks: MONTHS.map((label, x) => ({ x, label })),
  },
};

/** Adds up to the 12,482 active conversations. */
export const SAMPLE_CONVERSATION_HEALTH: ConversationHealthSummary = {
  score: 94,
  verdict: "Optimal",
  segments: [
    { id: "healthy", label: "Healthy", count: 7_812 },
    { id: "reported", label: "Reported", count: 142 },
    { id: "flagged", label: "Flagged", count: 84 },
    { id: "inactive", label: "Inactive", count: 4_444 },
  ],
};

export const SAMPLE_AI_FEATURES: AiEngagementFeature[] = [
  { id: "ice-breakers", label: "Ice Breakers", value: 64 },
  { id: "reply-suggestions", label: "Reply Suggestions", value: 42 },
  { id: "date-suggestions", label: "Date Suggestions", value: 18 },
];

const person = (
  id: string,
  name: string,
  handle: string,
  avatar: Parameters<typeof portrait>[0],
  location: string,
  standing: ConversationParticipant["standing"] = "good",
  accountStatus = "Good Standing",
): ConversationParticipant => ({
  id,
  name,
  handle,
  avatarUrl: portrait(avatar),
  location,
  standing,
  accountStatus,
});

const SARAH = person("sarah-jenkins", "Sarah Jenkins", "@sarahj_ny", "women/12", "New York, USA");
const MARK = person(
  "mark-thompson",
  "Mark Thompson",
  "@m_thompson_92",
  "men/22",
  "London, UK",
  "restricted",
  "Restricted Visibility",
);
const JAMES = person("james-carter", "James Carter", "@jcarter", "men/52", "Toronto, Canada");
const ELENA = person("elena-rossi", "Elena Rossi", "@elena.rossi", "women/57", "Milan, Italy");
const ALEX = person(
  "alex-morgan",
  "Alex Morgan",
  "@alexm_atx",
  "men/14",
  "Austin, USA",
  "restricted",
  "Under Investigation",
);
const SAM = person("sam-patel", "Sam Patel", "@sam_patel", "women/33", "Leeds, UK");

export const SAMPLE_CONVERSATIONS: Conversation[] = [
  {
    id: "CNV-84920",
    participants: [SARAH, MARK],
    matchedOn: "Oct 12, 2023",
    messageCount: 142,
    lastActivity: "2m ago",
    aiAssist: "high",
    safety: "healthy",
    state: "active",
    duration: "4d 12h",
    avgReply: "14m",
    mediaShared: 12,
    quality: 92,
    featuresUsed: ["Ice Breakers", "Date Suggestions"],
    sentiment: [41, 61, 81, 70, 100],
    safetyChecks: [
      { id: "harassment", label: "Harassment Risk", result: "safe" },
      { id: "spam", label: "Spam Detection", result: "safe" },
      { id: "language", label: "Inappropriate Language", result: "needs-review" },
    ],
    flaggedParticipantId: MARK.id,
    evidence: {
      caseId: "REV-99284",
      priority: "high",
      incidentTime: "Oct 24, 2023, 14:32:11 GMT-5",
      day: "October 24, 2023",
      lastLog: "2 mins ago by system-bot",
      messages: [
        {
          id: "1",
          authorId: SARAH.id,
          time: "14:15:02",
          text: "Hey Mark, did you get a chance to look over the proposal for the virtual date environment? I think we can optimize the shader performance.",
        },
        {
          id: "2",
          authorId: MARK.id,
          time: "14:16:45",
          redaction: "PRIVACY: PERSONAL CONTACT INFORMATION",
        },
        {
          id: "3",
          authorId: SARAH.id,
          time: "14:18:10",
          text: "I understand, thanks for being cautious. Anyway, the client is asking for a much more aggressive timeline than we agreed on.",
        },
        { id: "4", authorId: MARK.id, time: "14:19:33", redaction: "PRIVACY" },
        {
          id: "5",
          authorId: MARK.id,
          time: "14:32:11",
          text: "This is absolutely ridiculous. You guys are incompetent. I am done with this service. [Explicit Language Removed] you and the whole support team.",
          violation: "Inappropriate Language Policy Violation (Section 4.2)",
        },
        {
          id: "6",
          authorId: SARAH.id,
          time: "14:33:05",
          text: "Mark, I think that was meant for someone else. Let's pick this up tomorrow, once you've had a chance to look over the timeline the client sent.",
        },
      ],
    },
  },
  {
    id: "CNV-84921",
    participants: [JAMES, ELENA],
    matchedOn: "Oct 11, 2023",
    messageCount: 28,
    lastActivity: "14m ago",
    aiAssist: "none",
    safety: "under-review",
    state: "active",
    duration: "1d 3h",
    avgReply: "42m",
    mediaShared: 3,
    quality: 58,
    featuresUsed: [],
    sentiment: [72, 64, 51, 42, 30],
    safetyChecks: [
      { id: "harassment", label: "Harassment Risk", result: "safe" },
      { id: "spam", label: "Spam Detection", result: "needs-review" },
      { id: "language", label: "Inappropriate Language", result: "safe" },
    ],
    flaggedParticipantId: JAMES.id,
    evidence: {
      caseId: "REV-99301",
      priority: "medium",
      incidentTime: "Oct 11, 2023, 21:07:44 GMT+1",
      day: "October 11, 2023",
      lastLog: "1 hour ago by system-bot",
      messages: [
        {
          id: "1",
          authorId: ELENA.id,
          time: "21:02:10",
          text: "Hi James! I loved your photos from Banff. Was that last summer?",
        },
        {
          id: "2",
          authorId: JAMES.id,
          time: "21:04:52",
          text: "Yes! I post everything on my other profile, it's easier to chat there.",
        },
        { id: "3", authorId: JAMES.id, time: "21:05:30", redaction: "PRIVACY: EXTERNAL LINK" },
        {
          id: "4",
          authorId: JAMES.id,
          time: "21:07:44",
          text: "Seriously, just message me there. I can get you a discount code too.",
          violation: "Off-Platform Solicitation Policy Violation (Section 3.1)",
        },
        {
          id: "5",
          authorId: ELENA.id,
          time: "21:09:15",
          text: "I'd rather keep chatting here for now.",
        },
      ],
    },
  },
  {
    id: "CNV-84922",
    participants: [ALEX, SAM],
    matchedOn: "Oct 11, 2023",
    messageCount: 452,
    lastActivity: "Active Now",
    aiAssist: "medium",
    safety: "reported",
    state: "active",
    duration: "4d 2h",
    avgReply: "6m",
    mediaShared: 31,
    quality: 71,
    featuresUsed: ["Reply Suggestions"],
    sentiment: [80, 66, 49, 33, 18],
    safetyChecks: [
      { id: "harassment", label: "Harassment Risk", result: "needs-review" },
      { id: "spam", label: "Spam Detection", result: "safe" },
      { id: "language", label: "Inappropriate Language", result: "needs-review" },
    ],
    flaggedParticipantId: ALEX.id,
    evidence: {
      caseId: "REV-99317",
      priority: "high",
      incidentTime: "Oct 11, 2023, 23:41:09 GMT-6",
      day: "October 11, 2023",
      lastLog: "Just now by system-bot",
      messages: [
        {
          id: "1",
          authorId: SAM.id,
          time: "23:30:02",
          text: "I'm not ready to meet this weekend. Can we keep it virtual for now?",
        },
        {
          id: "2",
          authorId: ALEX.id,
          time: "23:32:48",
          text: "You keep saying that. I already booked the restaurant.",
        },
        {
          id: "3",
          authorId: SAM.id,
          time: "23:35:10",
          text: "I didn't ask you to. Please don't push me on this.",
        },
        {
          id: "4",
          authorId: ALEX.id,
          time: "23:41:09",
          text: "You're wasting my time. Answer me or I'll come find you myself.",
          violation: "Harassment & Threats Policy Violation (Section 2.3)",
        },
        {
          id: "5",
          authorId: SAM.id,
          time: "23:41:40",
          text: "I'm reporting this conversation.",
        },
      ],
    },
  },
];

/** For "Showing 1 to 10 of 12,482 conversations". */
export const SAMPLE_CONVERSATION_TOTAL = 12_482;
