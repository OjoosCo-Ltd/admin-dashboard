import { portrait } from "@/constants/sample-portraits";
import type {
  ActivityItem,
  AnnouncementAudience,
  AiPerformance,
  GrowthPoint,
  GrowthRange,
  KpiStat,
  MatchEngagement,
  OpsMetric,
  RecentUser,
  RevenueLine,
  TrustSafety,
  VerificationRequest,
} from "@/types/dashboard";

// UI only: the figures from the dashboard Figma, so the overview renders
// before /admin/dashboard/* is typed and wired. Replace with API data.

export const SAMPLE_KPIS: KpiStat[] = [
  {
    id: "total-users",
    label: "Total Users",
    value: 185_420,
    change: 8.3,
    comparison: "vs last month",
    tone: "primary",
    trend: [12, 13, 15, 14, 16, 16, 18, 17, 19, 18, 21, 21, 23, 23, 25, 24, 27, 27, 30, 29, 32, 33],
  },
  {
    id: "verified-profiles",
    label: "Verified Profiles",
    value: 142_300,
    change: 5.2,
    comparison: "vs last month",
    tone: "success",
    trend: [10, 11, 11, 13, 13, 14, 16, 16, 15, 15, 19, 21, 20, 23, 23, 22, 24, 26, 28],
  },
  {
    id: "active-matches",
    label: "Active Matches Today",
    value: 4_216,
    change: 12,
    comparison: "vs yesterday",
    tone: "success-strong",
    trend: [10, 9, 18, 12, 7, 14, 13, 20, 16, 12, 26],
  },
  {
    id: "premium-subscribers",
    label: "Premium Subscribers",
    value: 9_842,
    change: 6,
    comparison: "vs last month",
    tone: "premium",
    trend: [10, 9, 11, 10, 12, 11, 12, 12, 15, 14, 15, 17, 16, 18, 17, 20, 19, 21, 23],
  },
];

export const SAMPLE_METRICS: OpsMetric[] = [
  {
    id: "revenue",
    label: "Revenue This Month",
    value: "$82,450",
    note: "+14% vs last month",
    tone: "positive",
  },
  {
    id: "ai-match",
    label: "AI Match Success Rate",
    value: "91%",
    note: "Optimal target achieved",
    tone: "primary",
  },
  {
    id: "virtual-dates",
    label: "Virtual Dates Completed",
    value: "638",
    note: "Average 21 per day",
    tone: "neutral",
  },
  {
    id: "pending-verifications",
    label: "Pending Verifications",
    value: "47",
    note: "Needs attention now",
    tone: "attention",
  },
];

const range = (labels: string[], values: number[]): GrowthPoint[] =>
  labels.map((label, index) => ({ label, value: values[index] }));

export const SAMPLE_USER_GROWTH: Record<GrowthRange, GrowthPoint[]> = {
  "7d": range(
    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    [1050, 1380, 1670, 2080, 3330, 3120, 4650],
  ),
  "30d": range(
    // Jun 25 – Jul 24
    Array.from({ length: 30 }, (_, index) =>
      index < 6 ? `Jun ${25 + index}` : `Jul ${index - 5}`,
    ),
    [
      980, 1120, 1040, 1310, 1260, 1450, 1390, 1210, 1530, 1600, 1480, 1720, 1850, 1690, 1940, 2010,
      1870, 2160, 2240, 2080, 2390, 2520, 2350, 2680, 2810, 2600, 3050, 3330, 3120, 4650,
    ],
  ),
  "90d": range(
    ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12", "W13"],
    [7200, 7900, 7500, 8800, 9400, 9100, 10600, 11300, 10900, 12800, 13500, 14900, 17280],
  ),
  "1y": range(
    ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    [21000, 23500, 22800, 26400, 29100, 27600, 31800, 34500, 33200, 38900, 42100, 46800],
  ),
};

export const SAMPLE_AI_PERFORMANCE: AiPerformance = {
  accuracy: 94.2,
  change: 1.2,
  avgResponseSeconds: 1.2,
  suggestions: 12_400,
};

export const SAMPLE_TRUST_SAFETY: TrustSafety = {
  fraudAttempts: 12,
  fraudChange: -40,
  reportedProfiles: 28,
  verificationThroughput: 88,
};

/** Adds up to the "Revenue This Month" card. */
export const SAMPLE_REVENUE: RevenueLine[] = [
  { id: "premium", label: "Premium", amount: 42_300 },
  { id: "elite", label: "Elite", amount: 28_150 },
  { id: "boosts", label: "Boosts & Dates", amount: 12_000 },
];

export const SAMPLE_MATCH_ENGAGEMENT: MatchEngagement = {
  activeShare: 84,
  segments: [
    { id: "accepted", label: "Accepted", value: 52 },
    { id: "active-chat", label: "Active Chat", value: 20 },
    { id: "scheduled", label: "Scheduled", value: 12 },
  ],
};

export const SAMPLE_LIVE_ACTIVITY: ActivityItem[] = [
  {
    id: "1",
    kind: "verification",
    message: "Sarah Jenkins completed ID verification.",
    unread: true,
    time: "2 mins ago",
  },
  {
    id: "2",
    kind: "upgrade",
    message: "David Miller upgraded to Elite membership.",
    unread: true,
    time: "14 mins ago",
  },
  {
    id: "3",
    kind: "virtual-date",
    message: "New virtual date booked: Avery & Sam.",
    unread: false,
    time: "45 mins ago",
  },
];

/** ⚠️ Sample: the backend has no photo for the signed-in admin yet. */
export const SAMPLE_ADMIN_AVATAR_URL = portrait("men/75");

export const SAMPLE_RECENT_USERS: RecentUser[] = [
  {
    id: "1",
    name: "Emma Thompson",
    email: "emma.t@gmail.com",
    avatarUrl: portrait("women/26"),
    age: 28,
    country: "United Kingdom",
    verification: "verified",
    plan: "elite",
    online: true,
    lastActive: "Just now",
  },
  {
    id: "2",
    name: "Lucas Chen",
    email: "l.chen@outlook.com",
    avatarUrl: portrait("men/32"),
    age: 31,
    country: "Singapore",
    verification: "pending",
    plan: "premium",
    online: true,
    lastActive: "14m ago",
  },
  {
    id: "3",
    name: "Sofia Rossi",
    email: "sofia_r@libero.it",
    avatarUrl: portrait("women/68"),
    age: 26,
    country: "Italy",
    verification: "verified",
    plan: "free",
    online: false,
    lastActive: "2h ago",
  },
];

/** For the table's "Show all 185k users" link. */
export const SAMPLE_TOTAL_USERS = 185_420;

/**
 * The request the Review Verification dialog opens on. The two images are
 * cropped from the Figma frame (public/images/sample) until uploads come from
 * the verification endpoints.
 */
export const SAMPLE_VERIFICATION_REQUEST: VerificationRequest = {
  id: "VER-9981-XP",
  legalName: "Marcus Alexander Thorne",
  documentType: "Passport (United Kingdom)",
  submittedAt: "2026-07-24T14:22:00Z",
  photoUrl: "/images/sample/verification-photo.jpg",
  documentUrl: "/images/sample/verification-document.jpg",
  checks: [
    { id: "mrz", label: "MRZ Deciphered", status: "passed" },
    { id: "expiry", label: "Expiry Check", status: "passed" },
    { id: "address", label: "Address Link", status: "warning" },
  ],
};

/**
 * Reach of each announcement audience. The Figma says 1,240,432 for all users,
 * which contradicts its own 185,420 Total Users; these follow the KPIs.
 */
export const SAMPLE_AUDIENCE_SIZES: Record<AnnouncementAudience, number> = {
  all: 185_420,
  premium: 9_842,
  new: 17_280,
};
