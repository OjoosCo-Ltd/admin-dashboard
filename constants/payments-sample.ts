import { portrait } from "@/constants/sample-portraits";
import { SAMPLE_PLANS } from "@/constants/subscriptions-sample";
import { formatCompactMoney } from "@/libs/money";
import type { CompactKpi } from "@/types/kpi";
import type {
  FinancialInsight,
  RevenuePoint,
  RevenueRange,
  Transaction,
  TransactionEvent,
} from "@/types/payments";
import type { BillingCycle, PlanId } from "@/types/subscriptions";

// UI only: the payments Figma's figures, so the page renders before any
// payment routes exist. Replace with API data.

export const SAMPLE_PAYMENT_KPIS: CompactKpi[] = [
  {
    id: "total-revenue",
    label: "Total Revenue",
    value: formatCompactMoney(842_500),
    change: { label: "12%", direction: "up", favorable: true, comparison: "vs last month" },
    trend: [3, 4, 3, 5, 6, 5, 7, 6, 8, 7, 9, 8, 10, 12],
  },
  {
    id: "todays-revenue",
    label: "Today’s Revenue",
    value: formatCompactMoney(12_400),
    change: { label: "5.4%", direction: "up", favorable: true, comparison: "vs yesterday" },
    trend: [9, 11, 10, 18, 7, 14, 13, 21, 13, 27],
  },
  {
    id: "net-revenue",
    label: "Net Revenue",
    // Total revenue less refunds: £842.5k − £8.2k.
    value: formatCompactMoney(834_300),
    change: { label: "2.1%", direction: "down", favorable: false, comparison: "vs last month" },
    trend: [3, 7, 7, 17, 17, 25, 23, 17, 19, 35, 38, 33, 47, 47, 41, 52, 60, 63],
  },
  {
    id: "successful-payments",
    label: "Successful Payments",
    value: "24.1k",
    // The Figma reuses verification's "-15s" here, in green; a fall in successful payments isn't good news.
    change: { label: "1.5%", direction: "up", favorable: true, comparison: "vs last month" },
    trend: [4, 5, 4, 6, 7, 6, 8, 9, 8, 10, 11, 12, 11, 14],
  },
  {
    id: "failed-payments",
    label: "Failed Payments",
    value: "432",
    change: { label: "0.3%", direction: "up", favorable: false, comparison: "vs last month" },
    trend: [2, 3, 3, 5, 4, 6, 6, 9, 8, 10, 9, 12, 13, 16],
  },
  {
    id: "refunds",
    label: "Refunds",
    value: formatCompactMoney(8_200),
    // The Figma draws this rise in green; more refunds read as bad news, so it's red here.
    change: { label: "0.8%", direction: "up", favorable: false, comparison: "vs last month" },
    trend: [3, 4, 4, 5, 5, 7, 6, 8, 9, 9, 11, 10, 12, 14],
  },
];

/** Net is what's kept after gateway fees (about 3%) and refunds (about 1%). */
const KEPT = 0.958;

/** A smooth, repeatable wave (no randomness, so the server's render and the browser's agree). */
const wave = (index: number, base: number, swing: number, growth: number) =>
  Math.round(
    base + swing * Math.sin(index * 0.7) + swing * 0.4 * Math.sin(index * 1.9) + growth * index,
  );

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
const DAY_MS = 86_400_000;
/** The last seven days' gross: today's £12.4k is 5.4% up on yesterday, as the KPIs say. */
const LAST_WEEK = [10_800, 11_600, 9_900, 12_100, 13_400, 11_760, 12_400];

interface SampleDay {
  /** 0 is January. */
  month: number;
  date: number;
  gross: number;
  net: number;
}

// One repeatable day-by-day series from Jan 1 to today, Tuesday, Oct 20, 2026
// (the sample "now" the reports and analytics pages use too). Every range is
// cut from it, so a day reads the same in 7D and 1M, and the weeks and months
// add up. The dates come from UTC arithmetic, which doesn't depend on the
// server's or the browser's time zone.
const DAY_COUNT = 293;
const DAYS: SampleDay[] = Array.from({ length: DAY_COUNT }, (_, index) => {
  const day = new Date(Date.UTC(2026, 0, 1) + index * DAY_MS);
  const fromEnd = DAY_COUNT - 1 - index;
  const gross =
    fromEnd < LAST_WEEK.length
      ? LAST_WEEK[LAST_WEEK.length - 1 - fromEnd]
      : wave(index, 8_600, 1_000, 10);
  return { month: day.getUTCMonth(), date: day.getUTCDate(), gross, net: Math.round(gross * KEPT) };
});
const TODAY = DAYS[DAYS.length - 1];

const dayLabel = (day: SampleDay) => `${MONTHS[day.month]} ${day.date}`;
// A day, week or month. Its net is its days' nets added up rather than rounded
// again, so a week or a month matches its days to the pound.
const point = (label: string, detail: string, days: SampleDay[]): RevenuePoint => ({
  label,
  detail,
  gross: days.reduce((sum, day) => sum + day.gross, 0),
  net: days.reduce((sum, day) => sum + day.net, 0),
});
const daily = (days: SampleDay[]) =>
  days.map((day) =>
    point(dayLabel(day), `${dayLabel(day)}, 2026${day === TODAY ? " (today)" : ""}`, [day]),
  );

// 3M is thirteen rolling weeks, each the seven days up to its date, so the
// last point is a whole week ending today rather than a week just begun.
const WEEKS = Array.from({ length: 13 }, (_, week) => {
  const end = DAY_COUNT - (12 - week) * 7;
  return DAYS.slice(end - 7, end);
});
const weekSpan = (first: SampleDay, last: SampleDay) =>
  first.month === last.month
    ? `${dayLabel(first)}–${last.date}, 2026`
    : `${dayLabel(first)} – ${dayLabel(last)}, 2026`;

/** Gross and net revenue for each range. October, still in progress in YTD, says "to date". */
export const SAMPLE_REVENUE: Record<RevenueRange, RevenuePoint[]> = {
  "7d": daily(DAYS.slice(-7)),
  "1m": daily(DAYS.slice(-30)),
  "3m": WEEKS.map((days) => point(dayLabel(days[6]), weekSpan(days[0], days[6]), days)),
  ytd: MONTHS.map((month, index) =>
    point(
      month,
      `${month} 2026${index === TODAY.month ? " (to date)" : ""}`,
      DAYS.filter((day) => day.month === index),
    ),
  ),
};

// The Top Performer insight is worked out from the plans, so it agrees with the Subscriptions page.
const paidPlans = SAMPLE_PLANS.filter((plan) => plan.prices.monthly > 0);
const planRevenue = (plan: (typeof SAMPLE_PLANS)[number]) =>
  plan.prices.monthly * plan.activeSubscribers;
const totalMrr = paidPlans.reduce((sum, plan) => sum + planRevenue(plan), 0);
const topPlan = paidPlans.reduce((best, plan) =>
  planRevenue(plan) > planRevenue(best) ? plan : best,
);

export const SAMPLE_FINANCIAL_INSIGHTS: FinancialInsight[] = [
  {
    id: "top-performer",
    tone: "info",
    title: "Top Performer",
    body: `${topPlan.name} Subscriptions generate the highest revenue, accounting for ${Math.round((planRevenue(topPlan) / totalMrr) * 100)}% of total MRR.`,
  },
  {
    id: "retention",
    tone: "success",
    title: "Retention Alert",
    body: "Yearly plans show significantly stronger retention rates (92%) compared to monthly (68%). Consider targeted upsells.",
  },
  {
    id: "risk",
    tone: "risk",
    title: "Risk Flag",
    body: "Failed payments spiked on Visa this week, up 18% on last week. Most were expired cards, so a card-update reminder could recover them.",
  },
];

/** What a plan costs on a cycle, from the Subscriptions sample, so the two pages agree. */
const priceOf = (plan: PlanId, cycle: BillingCycle) =>
  SAMPLE_PLANS.find((item) => item.id === plan)?.prices[cycle] ?? 0;

/** The gateways' cut in this sample: a flat 3% (£1.20 on £39.99, as the Figma's sheet shows). */
const feeOn = (amount: number) => Math.round(amount * 3) / 100;

const events = (
  date: string,
  steps: [label: string, time: string, state: TransactionEvent["state"]][],
): TransactionEvent[] =>
  steps.map(([label, time, state], index) => ({
    id: String(index + 1),
    label,
    at: `${date} · ${time}`,
    state,
  }));

const charge = (
  base: Omit<Transaction, "amount" | "fee"> & { amount?: number },
  captured: boolean,
): Transaction => {
  const amount = base.amount ?? priceOf(base.plan, base.cycle);
  return { ...base, amount, fee: captured ? feeOn(amount) : 0 };
};

export const SAMPLE_TRANSACTIONS: Transaction[] = [
  charge(
    {
      id: "TRX-8942-A1",
      customer: {
        name: "Sarah Jenkins",
        email: "sarah.j@example.com",
        userId: "USR-8492-A",
        country: "United Kingdom",
        avatarUrl: portrait("women/44"),
      },
      plan: "premium",
      cycle: "annual",
      kind: "renewal",
      method: { kind: "card", label: "Visa", shortLabel: "Visa", last4: "4242" },
      gateway: "Stripe",
      authStatus: "Captured",
      reference: "ch_3Nkx...9lqX",
      date: "Oct 20, 2026",
      time: "14:32",
      status: "successful",
      nextRenewal: "Oct 20, 2027",
      timeline: events("Oct 20, 2026", [
        ["Receipt Sent", "14:32:45", "done"],
        ["Payment Successful", "14:32:12", "done"],
        ["Processing", "14:32:05", "step"],
        ["Initiated", "14:32:00", "step"],
      ]),
    },
    true,
  ),
  charge(
    {
      id: "TRX-8943-B2",
      customer: {
        name: "Marcus R.",
        email: "marcus.r@example.com",
        userId: "USR-7731-C",
        country: "United Kingdom",
      },
      plan: "basic",
      cycle: "quarterly",
      kind: "new-subscription",
      method: { kind: "paypal", label: "PayPal" },
      gateway: "PayPal",
      authStatus: "Captured",
      reference: "PAYID-M5K...7Q2A",
      date: "Oct 20, 2026",
      time: "12:15",
      status: "successful",
      nextRenewal: "Jan 20, 2027",
      timeline: events("Oct 20, 2026", [
        ["Receipt Sent", "12:15:31", "done"],
        ["Payment Successful", "12:15:09", "done"],
        ["Processing", "12:15:02", "step"],
        ["Initiated", "12:14:58", "step"],
      ]),
    },
    true,
  ),
  charge(
    {
      id: "TRX-8944-C3",
      customer: {
        name: "Alex Thompson",
        email: "alex.t@example.com",
        userId: "USR-6604-D",
        country: "Ireland",
        avatarUrl: portrait("men/12"),
      },
      plan: "elite",
      cycle: "quarterly",
      kind: "renewal",
      method: { kind: "apple-pay", label: "Apple Pay" },
      gateway: "Apple Pay",
      authStatus: "Declined",
      reference: "ap_7Hq2...xT0c",
      date: "Oct 20, 2026",
      time: "10:05",
      status: "failed",
      timeline: events("Oct 20, 2026", [
        ["Payment Failed: card declined", "10:05:14", "failed"],
        ["Processing", "10:05:06", "step"],
        ["Initiated", "10:05:00", "step"],
      ]),
    },
    false,
  ),
  charge(
    {
      id: "TRX-8930-X9",
      customer: {
        name: "Elena L.",
        email: "elena@example.com",
        userId: "USR-5519-E",
        country: "Spain",
      },
      plan: "basic",
      cycle: "monthly",
      kind: "renewal",
      method: { kind: "card", label: "Mastercard", shortLabel: "MC", last4: "8891" },
      gateway: "Stripe",
      authStatus: "Refunded",
      reference: "ch_9Wb1...4KpM",
      date: "Oct 19, 2026",
      time: "21:40",
      status: "refunded",
      refunded: priceOf("basic", "monthly"),
      timeline: events("Oct 19, 2026", [
        ["Refund Issued", "22:10:03", "done"],
        ["Payment Successful", "21:40:16", "done"],
        ["Processing", "21:40:08", "step"],
        ["Initiated", "21:40:00", "step"],
      ]),
    },
    true,
  ),
  charge(
    {
      id: "TRX-8925-P4",
      customer: {
        name: "David Chen",
        email: "d.chen@example.com",
        userId: "USR-4410-F",
        country: "United Kingdom",
        avatarUrl: portrait("men/32"),
      },
      plan: "elite",
      cycle: "annual",
      kind: "upgrade",
      method: { kind: "bank-transfer", label: "Bank Transfer" },
      gateway: "Bank transfer",
      authStatus: "Awaiting funds",
      reference: "bt_2Lm8...Q91z",
      date: "Oct 19, 2026",
      time: "18:05",
      status: "pending",
      nextRenewal: "Oct 19, 2027",
      timeline: events("Oct 19, 2026", [
        ["Awaiting bank transfer", "18:05:20", "waiting"],
        ["Initiated", "18:05:00", "step"],
      ]),
    },
    false,
  ),
  charge(
    {
      id: "TRX-8919-K7",
      customer: {
        name: "Priya Nair",
        email: "priya.n@example.com",
        userId: "USR-2287-H",
        country: "United Kingdom",
        avatarUrl: portrait("women/65"),
      },
      plan: "premium",
      cycle: "monthly",
      kind: "renewal",
      method: { kind: "card", label: "Visa", shortLabel: "Visa", last4: "1179" },
      gateway: "Stripe",
      authStatus: "Captured",
      reference: "ch_5Tc0...8VnB",
      date: "Oct 19, 2026",
      time: "15:20",
      status: "successful",
      nextRenewal: "Nov 19, 2026",
      timeline: events("Oct 19, 2026", [
        ["Receipt Sent", "15:20:40", "done"],
        ["Payment Successful", "15:20:11", "done"],
        ["Processing", "15:20:04", "step"],
        ["Initiated", "15:20:00", "step"],
      ]),
    },
    true,
  ),
  charge(
    {
      id: "TRX-8911-M2",
      customer: {
        name: "Tom Becker",
        email: "tom.b@example.com",
        userId: "USR-1175-J",
        country: "Germany",
        avatarUrl: portrait("men/75"),
      },
      plan: "basic",
      cycle: "annual",
      kind: "upgrade",
      method: { kind: "card", label: "Visa", shortLabel: "Visa", last4: "6620" },
      gateway: "Stripe",
      authStatus: "Captured",
      reference: "ch_1Rf7...2DsK",
      date: "Oct 18, 2026",
      time: "09:41",
      status: "successful",
      nextRenewal: "Oct 18, 2027",
      timeline: events("Oct 18, 2026", [
        ["Receipt Sent", "09:41:52", "done"],
        ["Payment Successful", "09:41:20", "done"],
        ["Processing", "09:41:09", "step"],
        ["Initiated", "09:41:00", "step"],
      ]),
    },
    true,
  ),
];

/** For "Showing 1 to 5 of 2,492 entries". */
export const SAMPLE_TRANSACTION_TOTAL = 2_492;
