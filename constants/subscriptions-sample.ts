import { portrait } from "@/constants/sample-portraits";
import { formatCompactMoney } from "@/libs/money";
import type { CompactKpi } from "@/types/kpi";
import type {
  ChurnPeriod,
  ChurnReason,
  MembershipPlan,
  PlanMove,
  SubscriberMonth,
  Subscription,
} from "@/types/subscriptions";

// UI only: the subscriptions Figma's figures, so the pages render before any
// subscription routes exist. Replace with API data.

const plan = (
  id: MembershipPlan["id"],
  name: string,
  monthly: number,
  activeSubscribers: number,
  extra: Partial<MembershipPlan>,
): MembershipPlan => ({
  id,
  name,
  // Quarterly saves about 10%; yearly saves 20%, as the plan toggle says.
  prices: {
    monthly,
    quarterly: Math.round(monthly * 3 * 0.9),
    annual: Math.round(monthly * 12 * 0.8 * 100) / 100,
  },
  activeSubscribers,
  createdOn: "Jan 12, 2024",
  churnRate: 2.4,
  churnChange: -0.5,
  features: [],
  ...extra,
});

export const SAMPLE_PLANS: MembershipPlan[] = [
  plan("free", "Free", 0, 3_450, {
    conversionToPaid: 12,
    createdOn: "Mar 3, 2023",
    churnRate: 4.1,
    churnChange: 0.3,
    features: [
      {
        id: "matches",
        title: "5 AI matches a day",
        detail: "Daily curated suggestions",
        included: true,
      },
      { id: "chat", title: "Messaging with matches", detail: "Text chat only", included: true },
      { id: "virtual", title: "Virtual dates", detail: "Available from Basic", included: false },
    ],
  }),
  plan("basic", "Basic", 14.99, 2_840, {
    createdOn: "Mar 3, 2023",
    churnRate: 3.2,
    churnChange: -0.2,
    features: [
      {
        id: "matches",
        title: "20 AI matches a day",
        detail: "Daily curated suggestions",
        included: true,
      },
      {
        id: "virtual",
        title: "2 Virtual Dates/month",
        detail: "Movie and meal themes",
        included: true,
      },
      {
        id: "support",
        title: "Priority support",
        detail: "Available from Premium",
        included: false,
      },
    ],
  }),
  plan("premium", "Premium", 29.99, 2_100, {
    features: [
      {
        id: "matching",
        title: "Unlimited AI matching",
        detail: "Core feature for premium tier",
        included: true,
      },
      {
        id: "support",
        title: "Priority support",
        detail: "24/7 dedicated channel",
        included: true,
      },
      {
        id: "virtual",
        title: "5 Virtual Dates/month",
        detail: "Every theme, with AI date ideas",
        included: true,
      },
      {
        id: "coach",
        title: "Dating coach sessions",
        detail: "Available on Elite",
        included: false,
      },
    ],
  }),
  plan("elite", "Elite", 39.99, 1_432, {
    createdOn: "Jun 1, 2024",
    churnRate: 1.6,
    churnChange: -0.4,
    features: [
      {
        id: "matching",
        title: "Unlimited AI matching",
        detail: "With compatibility deep-dives",
        included: true,
      },
      {
        id: "support",
        title: "Priority support",
        detail: "24/7 dedicated channel",
        included: true,
      },
      {
        id: "virtual",
        title: "Unlimited Virtual Dates",
        detail: "Every theme, with AI date ideas",
        included: true,
      },
      { id: "coach", title: "Dating coach sessions", detail: "Two a month", included: true },
    ],
  }),
];

/** Plan revenue for the month, from each paid plan's price and members. */
const mrr = SAMPLE_PLANS.reduce(
  (sum, item) => sum + item.prices.monthly * item.activeSubscribers,
  0,
);

export const SAMPLE_SUBSCRIPTION_KPIS: CompactKpi[] = [
  {
    id: "total-subscribers",
    label: "Total Subscribers",
    value: "9,842",
    change: { label: "12%", direction: "up", favorable: true, comparison: "vs last month" },
    trend: [3, 4, 3, 5, 6, 5, 7, 6, 8, 7, 9, 8, 10, 12],
  },
  {
    id: "mrr",
    label: "MRR",
    // The Figma shows 4,216 here; this is the plans' own monthly revenue.
    value: formatCompactMoney(mrr),
    change: { label: "5.4%", direction: "up", favorable: true, comparison: "vs yesterday" },
    trend: [9, 11, 10, 18, 7, 14, 13, 21, 13, 27],
  },
  {
    id: "active-subs",
    label: "Active Subs",
    value: "9,120",
    change: { label: "2.1%", direction: "down", favorable: false, comparison: "vs last month" },
    trend: [3, 7, 7, 17, 17, 25, 23, 17, 19, 35, 38, 33, 47, 47, 41, 52, 60, 63],
  },
  {
    id: "new-subs",
    label: "New Subs (30D)",
    value: "452",
    change: { label: "-15", direction: "down", favorable: false, comparison: "vs last month" },
    trend: [4, 5, 4, 6, 7, 6, 8, 9, 8, 10, 11, 12, 11, 14],
  },
  {
    id: "churn-rate",
    label: "Churn Rate",
    value: "2.4%",
    change: { label: "0.3%", direction: "up", favorable: false, comparison: "vs last month" },
    trend: [2, 3, 3, 5, 4, 6, 6, 9, 8, 10, 9, 12, 13, 16],
  },
  {
    id: "renewal-rate",
    label: "Renewal Rate",
    value: "94.2%",
    change: { label: "0.8%", direction: "up", favorable: true, comparison: "vs last month" },
    trend: [3, 4, 4, 5, 5, 7, 6, 8, 9, 9, 11, 10, 12, 14],
  },
];

export const SAMPLE_SUBSCRIBER_GROWTH: SubscriberMonth[] = [
  { month: "Dec", subscribers: 5_120, revenue: 92_400 },
  { month: "Jan", subscribers: 5_480, revenue: 98_900 },
  { month: "Feb", subscribers: 6_210, revenue: 109_300 },
  { month: "Mar", subscribers: 5_940, revenue: 107_100 },
  { month: "Apr", subscribers: 6_980, revenue: 124_800 },
  { month: "May", subscribers: 7_910, revenue: 138_200 },
  { month: "Jun", subscribers: 8_630, revenue: 151_600 },
  { month: "Jul", subscribers: 9_842, revenue: Math.round(mrr) },
];

/** Revenue by paid plan for each toggle: the month, the quarter and the year so far. */
export const SAMPLE_PLAN_REVENUE: Record<
  "monthly" | "quarterly" | "yearly",
  { plan: string; revenue: number }[]
> = {
  monthly: SAMPLE_PLANS.filter((item) => item.id !== "free").map((item) => ({
    plan: item.name,
    revenue: Math.round(item.prices.monthly * item.activeSubscribers),
  })),
  quarterly: [
    { plan: "Basic", revenue: 121_300 },
    { plan: "Premium", revenue: 178_600 },
    { plan: "Elite", revenue: 160_900 },
  ],
  yearly: [
    { plan: "Basic", revenue: 284_700 },
    { plan: "Premium", revenue: 416_200 },
    { plan: "Elite", revenue: 371_500 },
  ],
};

export const SAMPLE_PLAN_MOVES: { upgrades: PlanMove[]; downgrades: PlanMove[] } = {
  upgrades: [
    { from: "free", to: "basic", count: 124 },
    { from: "basic", to: "premium", count: 89 },
    { from: "premium", to: "elite", count: 42 },
  ],
  downgrades: [
    { from: "elite", to: "premium", count: 15 },
    { from: "premium", to: "basic", count: 28 },
    { from: "basic", to: "free", count: 64 },
  ],
};

export const SAMPLE_CHURN: Record<ChurnPeriod, ChurnReason[]> = {
  "30d": [
    { id: "voluntary", label: "Voluntary Churn", count: 112 },
    { id: "involuntary", label: "Failed Renewals (Involuntary)", count: 85 },
    { id: "expired", label: "Expired Subscriptions", count: 40 },
    { id: "cancelled", label: "Cancellations", count: 23 },
  ],
  "90d": [
    { id: "voluntary", label: "Voluntary Churn", count: 318 },
    { id: "involuntary", label: "Failed Renewals (Involuntary)", count: 246 },
    { id: "expired", label: "Expired Subscriptions", count: 131 },
    { id: "cancelled", label: "Cancellations", count: 72 },
  ],
  "1y": [
    { id: "voluntary", label: "Voluntary Churn", count: 1_204 },
    { id: "involuntary", label: "Failed Renewals (Involuntary)", count: 968 },
    { id: "expired", label: "Expired Subscriptions", count: 455 },
    { id: "cancelled", label: "Cancellations", count: 289 },
  ],
};

const person = (
  name: string,
  email: string,
  userId: string,
  location: string,
  avatar?: Parameters<typeof portrait>[0],
) => ({ name, email, userId, location, avatarUrl: avatar ? portrait(avatar) : undefined });

export const SAMPLE_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "SUB-89021",
    user: person("Sarah Jenkins", "sarah.j@example.com", "USR-8492A", "London, UK", "women/44"),
    plan: "elite",
    cycle: "monthly",
    amount: 39.99,
    startedOn: "Oct 24, 2022",
    nextRenewal: "Oct 24, 2023",
    status: "active",
    autoRenew: true,
    totalPaid: 479.88,
    lastPayment: { date: "Sep 24, 2023", method: "Visa ****4242", amount: 39.99 },
    timeline: [
      { id: "1", label: "Payment Successful", date: "Sep 24, 2023", tone: "success" },
      { id: "2", label: "Payment Successful", date: "Aug 24, 2023", tone: "success" },
      { id: "3", label: "Upgraded from Premium to Elite", date: "Apr 24, 2023", tone: "neutral" },
      { id: "4", label: "Subscribed to Premium", date: "Oct 24, 2022", tone: "neutral" },
    ],
  },
  {
    id: "SUB-89020",
    user: person("Marcus Cole", "marcus.cole@example.com", "USR-7731C", "Manchester, UK"),
    plan: "premium",
    cycle: "annual",
    amount: 287.9,
    startedOn: "Nov 10, 2023",
    nextRenewal: "Nov 12, 2023",
    status: "trial",
    trialDaysLeft: 2,
    autoRenew: true,
    totalPaid: 0,
    timeline: [
      { id: "1", label: "Started a 14-day Premium trial", date: "Oct 29, 2023", tone: "neutral" },
    ],
  },
  {
    id: "SUB-89019",
    user: person("David Chen", "d.chen@example.com", "USR-6604D", "Leeds, UK", "men/32"),
    plan: "free",
    cycle: null,
    amount: 0,
    startedOn: "Feb 2, 2023",
    status: "cancelled",
    autoRenew: false,
    totalPaid: 119.94,
    timeline: [
      { id: "1", label: "Moved to Free", date: "Sep 30, 2023", tone: "neutral" },
      { id: "2", label: "Cancelled Basic", date: "Sep 2, 2023", tone: "warning" },
      { id: "3", label: "Subscribed to Basic", date: "Feb 2, 2023", tone: "neutral" },
    ],
  },
  {
    id: "SUB-89018",
    user: person("Elena Rodriguez", "elena.r@example.com", "USR-5519E", "Bristol, UK", "women/68"),
    plan: "basic",
    cycle: "monthly",
    amount: 14.99,
    startedOn: "May 20, 2023",
    nextRenewal: "Oct 20, 2023",
    status: "payment-failed",
    autoRenew: true,
    totalPaid: 74.95,
    lastPayment: { date: "Aug 20, 2023", method: "Mastercard ****8810", amount: 14.99 },
    timeline: [
      { id: "1", label: "Renewal payment failed", date: "Sep 20, 2023", tone: "warning" },
      { id: "2", label: "Payment Successful", date: "Aug 20, 2023", tone: "success" },
      { id: "3", label: "Subscribed to Basic", date: "May 20, 2023", tone: "neutral" },
    ],
  },
  {
    id: "SUB-89017",
    user: person("Marcus Thorne", "m.thorne@techcorp.io", "USR-4410F", "Edinburgh, UK", "men/46"),
    plan: "premium",
    cycle: "monthly",
    amount: 29.99,
    startedOn: "Jan 05, 2024",
    nextRenewal: "Feb 05, 2024",
    status: "active",
    autoRenew: true,
    totalPaid: 29.99,
    lastPayment: { date: "Jan 05, 2024", method: "Visa ****1179", amount: 29.99 },
    timeline: [{ id: "1", label: "Subscribed to Premium", date: "Jan 05, 2024", tone: "neutral" }],
  },
  {
    id: "SUB-89016",
    user: person("Amanda Lewis", "amanda.l@design.co", "USR-3302G", "Cardiff, UK"),
    plan: "basic",
    cycle: "monthly",
    amount: 14.99,
    startedOn: "Nov 20, 2023",
    status: "cancelled",
    autoRenew: false,
    totalPaid: 14.99,
    timeline: [
      { id: "1", label: "Cancelled Basic", date: "Dec 18, 2023", tone: "warning" },
      { id: "2", label: "Subscribed to Basic", date: "Nov 20, 2023", tone: "neutral" },
    ],
  },
  {
    id: "SUB-89015",
    user: person("Priya Nair", "priya.n@example.com", "USR-2287H", "Birmingham, UK", "women/65"),
    plan: "elite",
    cycle: "annual",
    amount: 383.9,
    startedOn: "Mar 14, 2023",
    nextRenewal: "Mar 14, 2024",
    status: "active",
    autoRenew: true,
    totalPaid: 383.9,
    lastPayment: { date: "Mar 14, 2023", method: "Amex ****3005", amount: 383.9 },
    timeline: [
      { id: "1", label: "Subscribed to Elite (Yearly)", date: "Mar 14, 2023", tone: "neutral" },
    ],
  },
  {
    id: "SUB-89014",
    user: person("Tom Becker", "tom.b@example.com", "USR-1175J", "Glasgow, UK", "men/75"),
    plan: "basic",
    cycle: "quarterly",
    amount: 40,
    startedOn: "Aug 1, 2023",
    nextRenewal: "Nov 1, 2023",
    status: "active",
    autoRenew: false,
    totalPaid: 40,
    lastPayment: { date: "Aug 1, 2023", method: "Visa ****6620", amount: 40 },
    timeline: [
      { id: "1", label: "Subscribed to Basic (Quarterly)", date: "Aug 1, 2023", tone: "neutral" },
    ],
  },
];

/** For "Showing 1 to 10 of 9,842 results". */
export const SAMPLE_SUBSCRIBER_TOTAL = 9_842;
