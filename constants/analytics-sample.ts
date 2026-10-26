import { formatCompactMoney } from "@/libs/money";
import type {
  AlgorithmPerformance,
  AnalyticsEvent,
  AnalyticsInsight,
  AnalyticsKpi,
  CompatibilityDistribution,
  CountryShare,
  EngagementStats,
  EngagementSummary,
  FunnelStage,
  ModelEfficiency,
  SubscriptionRevenue,
  TierShare,
  TrustMetrics,
  UserGrowthPoint,
} from "@/types/analytics";

/** "Now" for the sample's relative times, so the server's render and the browser's agree. */
export const SAMPLE_ANALYTICS_NOW = "2026-10-20T12:00:00Z";

const monthly = "vs last month";

export const SAMPLE_ANALYTICS_KPIS: AnalyticsKpi[] = [
  {
    id: "total-users",
    label: "Total Users",
    value: "185,420",
    change: { label: "12%", direction: "up", favorable: true, comparison: monthly },
    trend: [10, 11, 10.5, 12, 11.8, 13, 12.6, 14, 13.8, 15, 15.6, 15.2, 16.4, 17.6, 19],
  },
  {
    id: "active-users",
    label: "Active Users",
    value: "42,318",
    change: { label: "5.4%", direction: "up", favorable: true, comparison: "vs yesterday" },
    trend: [18, 19, 28, 22, 17, 23, 22, 30, 25, 23, 33],
  },
  {
    id: "matches-created",
    label: "Matches Created",
    value: "12,402",
    change: { label: "2.1%", direction: "down", favorable: false, comparison: monthly },
    // A trend's last points must agree with change.direction: this one turns down.
    trend: [12, 13, 12, 15, 14, 14, 17, 16, 19, 18, 22, 21, 19.5, 18],
  },
  {
    id: "active-conversations",
    label: "Active Convos",
    value: "8,194",
    // The Figma's "-15s" is a response time; a count of conversations changes by a share.
    change: { label: "1.5%", direction: "down", favorable: false, comparison: monthly },
    trend: [10, 11, 10, 12, 11, 12, 15, 14, 15, 14, 17, 16.5, 15.5, 14.5],
  },
  {
    id: "virtual-dates",
    label: "Virtual Dates",
    value: "638",
    change: { label: "0.3%", direction: "up", favorable: true, comparison: monthly },
    trend: [10, 10.5, 10, 11, 11, 12, 12.5, 12, 13.5, 13, 15, 14.5, 17, 18.5],
  },
  {
    id: "revenue",
    feature: "payments",
    label: "Revenue",
    value: formatCompactMoney(82_400),
    change: { label: "0.8%", direction: "up", favorable: true, comparison: monthly },
    trend: [10, 11, 10.5, 12, 11.5, 13, 12.5, 14.5, 14, 15, 15.8, 15.2, 17, 18],
  },
];

/** The last twelve full months. */
export const SAMPLE_USER_GROWTH: UserGrowthPoint[] = [
  { month: "2025-10", label: "Oct", registrations: 4_920, activeUsers: 21_400 },
  { month: "2025-11", label: "Nov", registrations: 6_180, activeUsers: 22_850 },
  { month: "2025-12", label: "Dec", registrations: 8_640, activeUsers: 24_100 },
  { month: "2026-01", label: "Jan", registrations: 7_310, activeUsers: 25_020 },
  { month: "2026-02", label: "Feb", registrations: 10_980, activeUsers: 26_930 },
  { month: "2026-03", label: "Mar", registrations: 12_260, activeUsers: 28_310 },
  { month: "2026-04", label: "Apr", registrations: 14_830, activeUsers: 30_180 },
  { month: "2026-05", label: "May", registrations: 13_470, activeUsers: 31_620 },
  { month: "2026-06", label: "Jun", registrations: 17_180, activeUsers: 33_940 },
  { month: "2026-07", label: "Jul", registrations: 20_840, activeUsers: 36_410 },
  { month: "2026-08", label: "Aug", registrations: 18_290, activeUsers: 38_150 },
  { month: "2026-09", label: "Sep", registrations: 22_060, activeUsers: 40_720 },
];

export const SAMPLE_ENGAGEMENT: EngagementSummary = {
  stickiness: 34.2,
  stickinessVerdict: "healthy",
  avgSessionSeconds: 764,
  returningUsers: 78.4,
};

export const SAMPLE_ALGORITHM: AlgorithmPerformance = {
  predictionAccuracy: 94.2,
  // The same figure as Compatibility Distribution's global average: the Figma's two (88.5% and 86.4%) contradict each other.
  avgMatchScore: 86.4,
};

/** The last 30 days. */
export const SAMPLE_MATCH_FUNNEL: FunnelStage[] = [
  { id: "generated", label: "Generated Matches", count: 1_200_000 },
  { id: "viewed", label: "Viewed Profiles", count: 984_000, feature: "profileViews" },
  { id: "accepted", label: "Accepted", count: 540_000 },
  { id: "conversation", label: "Conversation", count: 264_000 },
  { id: "virtual-date", label: "Virtual Date", count: 57_000 },
];

export const SAMPLE_MODEL_EFFICIENCY: ModelEfficiency = {
  accuracy: 94.2,
  weeklyChange: 1.2,
  description:
    "Matchmaking accuracy based on user post-date feedback loops and compatibility scoring models.",
  model: "v4.2.1 (DeepLink Pro)",
  status: "active",
};

// Five-point bands, so equal columns compare like with like (the Figma's run 50, 60 ... 90, 95, 100,
// mixing 10-, 5- and 1-point bands). The counts follow the Figma's column heights.
export const SAMPLE_COMPATIBILITY: CompatibilityDistribution = {
  bands: [
    { label: "65%", from: 65, to: 69, matches: 16_600 },
    { label: "70%", from: 70, to: 74, matches: 42_400 },
    { label: "75%", from: 75, to: 79, matches: 76_500 },
    { label: "80%", from: 80, to: 84, matches: 119_900 },
    { label: "85%", from: 85, to: 89, matches: 236_000 },
    { label: "90%", from: 90, to: 94, matches: 146_600 },
    { label: "95%", from: 95, to: 100, matches: 50_700 },
  ],
  average: 86.4,
};

export const SAMPLE_ENGAGEMENT_STATS: EngagementStats = {
  completionRate: 88,
  avgRating: 4.8,
  avgDateMinutes: 42,
  activeThreads: 8_194,
  inactiveThreads: 2_400,
};

export const SAMPLE_SUBSCRIPTION_REVENUE: SubscriptionRevenue = {
  monthly: [
    { label: "Apr", period: "April 2026", elite: 8_844, premium: 6_432, basic: 4_824 },
    { label: "May", period: "May 2026", elite: 13_590, premium: 9_664, basic: 6_946 },
    { label: "Jun", period: "June 2026", elite: 20_492, premium: 13_516, basic: 9_592 },
    { label: "Jul", period: "July 2026", elite: 25_872, premium: 16_709, basic: 11_319 },
    { label: "Aug", period: "August 2026", elite: 33_197, premium: 20_832, basic: 13_171 },
    { label: "Sep", period: "September 2026", elite: 31_694, premium: 19_809, basic: 12_397 },
    { label: "Oct", period: "October 2026 so far", elite: 32_980, premium: 20_612, basic: 12_367 },
  ],
  weekly: [
    { label: "Aug 24", period: "Week of Aug 24", elite: 33_200, premium: 20_584, basic: 12_616 },
    { label: "Aug 31", period: "Week of Aug 31", elite: 32_190, premium: 20_119, basic: 12_591 },
    { label: "Sep 7", period: "Week of Sep 7", elite: 31_284, premium: 19_592, basic: 12_324 },
    { label: "Sep 14", period: "Week of Sep 14", elite: 30_541, premium: 19_127, basic: 12_032 },
    { label: "Sep 21", period: "Week of Sep 21", elite: 31_086, premium: 19_468, basic: 12_246 },
    { label: "Sep 28", period: "Week of Sep 28", elite: 31_694, premium: 19_809, basic: 12_397 },
    { label: "Oct 5", period: "Week of Oct 5", elite: 32_355, premium: 20_181, basic: 12_564 },
    { label: "Oct 12", period: "Week of Oct 12", elite: 32_980, premium: 20_612, basic: 12_367 },
  ],
};

/** Members by plan, with each plan's monthly recurring revenue. Matches the latest revenue point. */
export const SAMPLE_USER_TIERS: TierShare[] = [
  { tier: "elite", label: "Elite", users: 74_168, mrr: 32_980 },
  { tier: "premium", label: "Premium", users: 46_355, mrr: 20_612 },
  { tier: "basic", label: "Basic", users: 27_813, mrr: 12_367 },
  { tier: "free", label: "Free", users: 37_084, mrr: 0 },
];

export const SAMPLE_COUNTRIES: CountryShare[] = [
  { id: "gb", label: "UK", share: 42 },
  { id: "us", label: "USA", share: 28 },
  { id: "de", label: "Germany", share: 15 },
  { id: "other", label: "Others", share: 15 },
];

export const SAMPLE_TRUST: TrustMetrics = {
  verificationRate: 92.4,
  reportRate: 0.42,
  fraudBlocked: 12_500,
  status: "healthy",
};

export const SAMPLE_ANALYTICS_INSIGHTS: AnalyticsInsight[] = [
  {
    id: "growth-anomaly",
    kind: "growth",
    title: "High Growth Anomaly",
    body: "User registrations in the 18-24 age group increased by 12.4% following the Summer Campaign launch.",
  },
  {
    id: "feature-optimization",
    kind: "feature",
    title: "Feature Optimization",
    body: "Virtual Date acceptance improved by 8.2% after the introduction of 'Ice Breaker' prompts.",
  },
  {
    id: "tier-conversion",
    kind: "conversion",
    title: "Tier Conversion",
    body: "Premium tier conversion is 15% higher for users who complete at least 2 Virtual Dates.",
  },
  {
    id: "chat-latency",
    kind: "alert",
    title: "Chat Latency Alert",
    body: "System logs show a minor 50ms latency increase in US-East conversation processing.",
  },
];

export const SAMPLE_ANALYTICS_EVENTS: AnalyticsEvent[] = [
  { id: "milestone", kind: "milestone", title: "185K User Milestone", at: "2026-10-20T08:42:00Z" },
  { id: "deploy", kind: "deploy", title: "v4.2.1 Model Deployed", at: "2026-10-19T23:30:00Z" },
  { id: "report", kind: "report", title: "Weekly Report Generated", at: "2026-10-14T09:00:00Z" },
  { id: "audit", kind: "security", title: "Security Audit Passed", at: "2026-10-12T14:15:00Z" },
];
