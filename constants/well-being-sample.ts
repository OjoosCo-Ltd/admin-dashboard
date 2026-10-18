import { portrait, sampleCover } from "@/constants/sample-portraits";
import type {
  AssessmentFunnel,
  AssessmentQuestion,
  AssessmentSettings,
  AssessmentStat,
  Coach,
  CoachAvailability,
  CoachKpi,
  CoachServiceConfig,
  CoachSession,
  EngagementRange,
  EngagementSeries,
  WellbeingActivity,
  WellbeingInsight,
  WellbeingKpi,
  WellbeingResource,
} from "@/types/well-being";

// UI only: the figures from the Well-being Figma. The backend has no
// well-being routes yet, so every number here is a stand-in.

export const SAMPLE_WELLBEING_KPIS: WellbeingKpi[] = [
  {
    id: "resources",
    label: "Total Resources",
    value: "24",
    note: "Published well-being resources",
  },
  { id: "views", label: "Resource Views", value: "12,210", note: "Past 30 days" },
  { id: "completions", label: "Assessment Completions", value: "8,194", note: "Total completed" },
  { id: "completion-rate", label: "Completion Rate", value: "72%", progress: 72 },
  {
    id: "coach-sessions",
    label: "Coach Sessions",
    value: "156",
    note: "1-on-1 sessions initiated",
  },
];

const VIEWS_1M = [
  400, 1_300, 1_900, 1_500, 1_000, 2_600, 4_400, 6_100, 6_800, 7_500, 8_000, 8_400, 8_700,
];
const SESSIONS_1M = [3, 5, 6, 5, 4, 7, 9, 11, 12, 13, 14, 15, 16];

export const SAMPLE_ENGAGEMENT: Record<EngagementRange, EngagementSeries> = {
  "1w": {
    ticks: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label, index) => ({
      x: index,
      label,
    })),
    points: [1_850, 2_100, 1_960, 2_300, 2_480, 2_760, 2_610].map((views, index) => ({
      x: index,
      label: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index],
      views,
      sessions: [14, 16, 15, 18, 21, 24, 22][index],
    })),
  },
  // Every two to three days across the month; the axis prints the four weeks.
  "1m": {
    ticks: [0, 4, 8, 12].map((x, index) => ({ x, label: `Week ${index + 1}` })),
    points: VIEWS_1M.map((views, index) => ({
      x: index,
      label: `Week ${Math.min(Math.floor(index / 3.25) + 1, 4)}`,
      views,
      sessions: SESSIONS_1M[index],
    })),
  },
  "1y": {
    ticks: ["Nov", "Jan", "Mar", "May", "Jul", "Sep"].map((label, index) => ({
      x: index * 2,
      label,
    })),
    points: [
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
    ].map((label, index) => ({
      x: index,
      label,
      views: [3_200, 3_900, 4_400, 4_100, 5_300, 6_000, 6_800, 7_400, 8_100, 9_600, 10_900, 12_210][
        index
      ],
      sessions: [40, 52, 61, 58, 70, 84, 92, 101, 118, 131, 144, 156][index],
    })),
  },
};

export const SAMPLE_WELLBEING_INSIGHT: WellbeingInsight = {
  lead: "Mindfulness resources are seeing a",
  highlight: "24% increase in",
  tail: "weekly engagement.",
  detail:
    "Consider highlighting these tools on the member dashboard to capitalize on current trends.",
};

export const SAMPLE_RESOURCE_COUNT = 24;

export const SAMPLE_RESOURCES: WellbeingResource[] = [
  {
    id: "r-anxiety",
    title: "Understanding Dating Anxiety",
    format: "article",
    category: "mindfulness",
    coverUrl: sampleCover("calm-anxiety"),
    views: 12_450,
    engagement: 78,
    publishedAt: "2026-10-12T09:00:00Z",
    status: "published",
  },
  {
    id: "r-confidence",
    title: "Building Confidence",
    format: "audio",
    category: "confidence",
    coverUrl: sampleCover("confidence-growth"),
    views: 8_920,
    engagement: 64,
    publishedAt: "2026-09-05T09:00:00Z",
    status: "published",
  },
  {
    id: "r-communication",
    title: "Healthy Communication",
    format: "video",
    category: "communication",
    coverUrl: sampleCover("talk-bubbles"),
    views: 4_150,
    engagement: 42,
    publishedAt: "2026-10-01T09:00:00Z",
    status: "draft",
  },
  {
    id: "r-expectations",
    title: "Managing Expectations",
    format: "article",
    category: "mindfulness",
    coverUrl: sampleCover("stacked-stones"),
    views: 2_100,
    publishedAt: "2026-08-15T09:00:00Z",
    status: "archived",
  },
  {
    id: "r-boundaries",
    title: "Setting Healthy Boundaries",
    format: "exercise",
    category: "relationships",
    coverUrl: sampleCover("open-path"),
    views: 3_780,
    engagement: 58,
    publishedAt: "2026-09-21T09:00:00Z",
    status: "published",
  },
  {
    id: "r-centering",
    title: "5-Minute Pre-Date Centering",
    format: "audio",
    category: "mindfulness",
    coverUrl: sampleCover("sunrise-breath"),
    views: 1_240,
    engagement: 81,
    publishedAt: "2026-10-18T10:42:00Z",
    status: "published",
  },
];

/** The overview's top three, with what the Figma lists for each. */
export const SAMPLE_TOP_RESOURCES = [
  { id: "r-anxiety", title: "Understanding Dating Anxiety", kind: "Article", reach: "4,210 views" },
  {
    id: "r-confidence",
    title: "Building Confidence in Dating",
    kind: "Audio Guide",
    reach: "3,840 plays",
  },
  {
    id: "r-communication",
    title: "Healthy Communication Basics",
    kind: "Video",
    reach: "2,950 views",
  },
];

export const SAMPLE_WELLBEING_ACTIVITY: WellbeingActivity[] = [
  {
    id: "a-1",
    at: "2026-10-18T10:42:00Z",
    title: "New mindfulness resource published",
    detail: '"5-Minute Pre-Date Centering" added by Admin.',
  },
  {
    id: "a-2",
    at: "2026-10-17T15:15:00Z",
    title: "Assessment updated",
    detail: 'Revised scoring logic for "Attachment Style" quiz.',
  },
  {
    id: "a-3",
    at: "2026-10-14T09:00:00Z",
    title: "Coach availability changed",
    detail: "3 new slots opened for this weekend.",
  },
];

export const SAMPLE_ASSESSMENT_STATS: AssessmentStat[] = [
  {
    id: "completions",
    label: "Total Completions",
    value: "12,450",
    note: "+14% vs last month",
    tone: "positive",
  },
  {
    id: "score",
    label: "Avg. Score (Aggregate)",
    value: "91%",
    note: "Optimal target achieved",
    tone: "primary",
  },
  {
    id: "completion-rate",
    label: "Completion Rate",
    value: "94.2%",
    note: "+14% vs last month",
    tone: "positive",
  },
  {
    id: "time",
    label: "Avg. Completion Time",
    value: "4m 12s",
    note: "-15s vs last quarter",
    tone: "positive",
  },
];

export const SAMPLE_ASSESSMENT_FUNNEL: AssessmentFunnel = {
  started: 13_215,
  inProgress: 765,
  completed: 12_450,
};

export const SAMPLE_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "q-stress",
    text: "How would you rate your overall stress level today?",
    type: "scale",
    required: true,
    status: "active",
    hint: "1: Low, 10: High",
    rules: [],
  },
  {
    id: "q-friction",
    text: "Which areas of your dating life are causing the most friction currently?",
    type: "multiple-choice",
    required: true,
    status: "active",
    hint: "4 Options (Multi-select)",
    rules: [],
  },
  {
    id: "q-support",
    text: "Have you used the Dating Coach or a well-being resource this month?",
    type: "yes-no",
    required: false,
    status: "active",
    rules: [{ id: "rule-1", operator: "is", value: "Yes", skipTo: "q-goal" }],
  },
  {
    id: "q-activity",
    text: "Did you engage in any physical activity yesterday?",
    type: "yes-no",
    required: false,
    status: "active",
    rules: [],
  },
  {
    id: "q-goal",
    text: "Briefly describe your current primary goal.",
    type: "free-text",
    required: false,
    status: "draft",
    rules: [],
  },
];

export const SAMPLE_ASSESSMENT_SETTINGS: AssessmentSettings = {
  title: "Initial Well-being Baseline",
  estimatedTime: "4m 12s",
  scoringModel: "Intentional Wellness v1.2",
  requireCompletion: true,
  showProgress: true,
};

export const SAMPLE_COACH_KPIS: CoachKpi[] = [
  { id: "sessions", label: "Total Sessions", value: "1,428", change: 12 },
  { id: "bookings", label: "Active Bookings", value: "342", change: 12 },
  { id: "rating", label: "Avg. Coach Rating", value: "4.8", suffix: "/ 5.0", change: 12 },
  // The Figma shows £82.4k beside a rate in dollars; the admin reports revenue in dollars elsewhere.
  { id: "revenue", label: "Revenue (MTD)", value: "$82.4k", change: 12 },
];

export const SAMPLE_COACHES: Coach[] = [
  {
    id: "coach-sarah",
    name: "Sarah Jenkins",
    title: "Senior Relationship Coach",
    avatarUrl: portrait("women/44"),
    sessionsHosted: 142,
    rating: 4.9,
    status: "available",
  },
  {
    id: "coach-david",
    name: "David Chen",
    title: "Confidence Coach",
    avatarUrl: portrait("men/46"),
    sessionsHosted: 89,
    rating: 4.7,
    status: "in-session",
  },
  {
    id: "coach-elena",
    name: "Elena Rodriguez",
    title: "Communication Coach",
    avatarUrl: portrait("women/65"),
    sessionsHosted: 215,
    rating: 5,
    status: "available",
  },
];

export const SAMPLE_COACH_SESSIONS: CoachSession[] = [
  {
    id: "cs-1",
    startsAt: "2026-10-24T10:00:00",
    userId: "USR-8892",
    coachId: "coach-sarah",
    theme: "Profile Review",
    status: "completed",
  },
  {
    id: "cs-2",
    startsAt: "2026-10-24T11:30:00",
    userId: "USR-4102",
    coachId: "coach-david",
    theme: "Dating Anxiety",
    status: "scheduled",
  },
  {
    id: "cs-3",
    startsAt: "2026-10-25T09:00:00",
    userId: "USR-9921",
    coachId: "coach-elena",
    theme: "First Date Prep",
    status: "scheduled",
  },
];

export const SAMPLE_COACH_SERVICE: CoachServiceConfig = {
  acceptingBookings: true,
  sessionLength: 45,
  rate: 75,
  description:
    "Get personalized 1-on-1 advice from our certified dating experts to help you navigate your dating journey with confidence.",
};

export const SAMPLE_COACH_AVAILABILITY: CoachAvailability = {
  coachId: "coach-sarah",
  sessionLength: 45,
  timezone: "America/New_York",
  week: {
    mon: [{ start: "09:00", end: "17:00" }],
    tue: [
      { start: "09:00", end: "12:00" },
      { start: "14:00", end: "18:00" },
    ],
    wed: [],
    thu: [{ start: "10:00", end: "19:00" }],
    fri: [],
    sat: [],
    sun: [],
  },
};
