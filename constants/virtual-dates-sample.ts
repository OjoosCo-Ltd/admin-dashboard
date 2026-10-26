import { portrait } from "@/constants/sample-portraits";
import type { CompactKpi } from "@/types/kpi";
import type {
  DateActivityPoint,
  DateInsight,
  DateParticipant,
  Satisfaction,
  SessionStatusSummary,
  ThemeShare,
  VirtualDateSession,
} from "@/types/virtual-dates";

// UI only: the figures from the Virtual Dates Figma, so the page renders
// before /admin/virtual-dates and its stats are typed and wired.

// Average Session Duration reads "↗ 15m" up top and "↗ 0.8%" below in the
// Figma; the card shows one change, so both read 15m here.
export const SAMPLE_DATE_KPIS: CompactKpi[] = [
  {
    id: "scheduled",
    label: "Virtual Dates Scheduled",
    value: "1,482",
    change: { label: "12%", direction: "up", favorable: true, comparison: "vs last month" },
  },
  {
    id: "completed",
    label: "Completed Dates",
    value: "1,204",
    change: { label: "5.4%", direction: "up", favorable: true, comparison: "vs yesterday" },
  },
  {
    id: "completion-rate",
    label: "Completion Rate",
    value: "81.2%",
    change: { label: "2.1%", direction: "down", favorable: false, comparison: "vs last month" },
  },
  {
    id: "avg-duration",
    feature: "dateAttendance",
    label: "Average Session Duration",
    value: "42 min",
    change: { label: "15m", direction: "up", favorable: true, comparison: "vs last month" },
  },
  {
    id: "avg-rating",
    label: "Average Rating",
    value: "4.72",
    badge: { label: "4.8 avg", tone: "emerald" },
    change: { label: "12%", direction: "up", favorable: true, comparison: "vs last month" },
  },
  {
    id: "revenue",
    feature: "payments",
    label: "Revenue Generated",
    value: "$14,290",
    change: { label: "5.4%", direction: "up", favorable: true, comparison: "vs yesterday" },
  },
  {
    id: "upcoming",
    label: "Upcoming Sessions",
    value: "256",
    badge: { label: "Active", tone: "indigo" },
    change: { label: "12%", direction: "up", favorable: true, comparison: "vs last month" },
  },
  {
    id: "reported",
    feature: "dateReports",
    label: "Reported Sessions",
    value: "14",
    change: { label: "+3", direction: "up", favorable: false, comparison: "vs last month" },
  },
];

const BOOKINGS = [
  38, 39, 40, 40, 40, 39, 38, 38, 38, 38, 39, 40, 42, 45, 49, 52, 54, 54, 54, 53, 49, 44, 38, 33,
  31, 31, 34, 41, 50, 57,
];
const REVENUE = [
  880, 890, 900, 905, 905, 900, 895, 890, 885, 890, 900, 930, 980, 1_050, 1_130, 1_190, 1_220,
  1_240, 1_240, 1_235, 1_225, 1_210, 1_195, 1_180, 1_165, 1_150, 1_135, 1_120, 1_100, 1_080,
];

const day = new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", timeZone: "UTC" });

/** Daily bookings and revenue, Sep 15 to Oct 14. */
export const SAMPLE_DATE_ACTIVITY: DateActivityPoint[] = BOOKINGS.map((bookings, index) => ({
  label: day.format(Date.UTC(2026, 8, 15 + index)),
  bookings,
  revenue: REVENUE[index],
}));

export const SAMPLE_SESSION_STATUS: SessionStatusSummary = {
  total: 1_204,
  shares: [
    { id: "completed", label: "Completed", percent: 68 },
    { id: "upcoming", label: "Upcoming", percent: 22 },
    { id: "cancelled", label: "Cancelled", percent: 10 },
  ],
};

export const SAMPLE_DATE_THEMES: ThemeShare[] = [
  { id: "movie", label: "Movie Date", percent: 40 },
  { id: "game", label: "Game Date", percent: 30 },
  { id: "meal", label: "Plan a Meal", percent: 20 },
  { id: "shop", label: "Shop Together", percent: 10 },
];

export const SAMPLE_DATE_INSIGHTS: DateInsight[] = [
  {
    id: "theme-shift",
    title: "Trending Theme Shift",
    body: '"Game Date" has increased by 14% this week. Consider promoting "Shop Together" to evening users.',
  },
  {
    id: "retention",
    title: "Retention Alert",
    body: 'Engagement drops after 20 minutes in "Movie Date" sessions. AI suggests adding interactive mini-games.',
  },
];

export const SAMPLE_SATISFACTION: Satisfaction = {
  average: 4.7,
  shares: [1, 1, 3, 22, 73],
};

const person = (
  id: string,
  name: string,
  photo?: Parameters<typeof portrait>[0],
): DateParticipant => ({
  id,
  name,
  avatarUrl: photo && portrait(photo),
});

// Reported sessions hide who took part until a moderator opens them.
const anonymous: [DateParticipant, DateParticipant] = [
  { id: "anon-a", name: "User A" },
  { id: "anon-b", name: "User B" },
];

/** Every session, for the count and pages while no filter is set. */
export const SAMPLE_SESSION_COUNT = 1_204;

export const SAMPLE_DATE_SESSIONS: VirtualDateSession[] = [
  {
    id: "vd-89421",
    publicId: "VD-89421",
    participants: [person("u-alex", "Alex", "men/51"), person("u-sarah", "Sarah", "women/45")],
    title: "Game Date",
    theme: "game",
    startsAt: "2026-10-16T14:00:00Z",
    endsAt: "2026-10-16T14:45:00Z",
    durationMinutes: 45,
    attendance: "both",
    rating: 4.8,
    status: "completed",
    flagged: false,
  },
  {
    id: "vd-89422",
    publicId: "VD-89422",
    participants: [person("u-mike", "Mike", "men/53"), person("u-lena", "Lena", "women/62")],
    title: "Dinner Date",
    theme: "meal",
    startsAt: "2026-10-16T19:30:00Z",
    endsAt: "2026-10-16T21:00:00Z",
    durationMinutes: 90,
    attendance: "one",
    status: "live",
    flagged: false,
  },
  {
    id: "vd-89423",
    publicId: "VD-89423",
    participants: [person("u-chris", "Chris", "men/56"), person("u-joi", "Joi", "women/89")],
    title: "Movie Date",
    theme: "movie",
    startsAt: "2026-10-17T10:00:00Z",
    endsAt: "2026-10-17T11:00:00Z",
    durationMinutes: 60,
    attendance: "pending",
    status: "upcoming",
    flagged: false,
  },
  {
    id: "vd-89424",
    publicId: "VD-89424",
    participants: anonymous,
    title: "Movie Night",
    theme: "movie",
    startsAt: "2026-10-15T22:00:00Z",
    endsAt: "2026-10-16T00:00:00Z",
    durationMinutes: 120,
    attendance: "no-show",
    status: "cancelled",
    flagged: true,
  },
  {
    id: "vd-89425",
    publicId: "VD-89425",
    participants: [person("u-nina", "Nina", "women/80"), person("u-omar", "Omar", "men/86")],
    title: "Shop Together",
    theme: "shop",
    startsAt: "2026-10-17T16:00:00Z",
    endsAt: "2026-10-17T16:40:00Z",
    durationMinutes: 40,
    attendance: "pending",
    status: "upcoming",
    flagged: false,
  },
  {
    id: "vd-89426",
    publicId: "VD-89426",
    participants: [person("u-grace", "Grace", "women/85"), person("u-leo", "Leo", "men/62")],
    title: "Game Date",
    theme: "game",
    startsAt: "2026-10-15T18:00:00Z",
    endsAt: "2026-10-15T18:50:00Z",
    durationMinutes: 50,
    attendance: "both",
    rating: 4.6,
    status: "completed",
    flagged: false,
  },
  {
    id: "vd-89427",
    publicId: "VD-89427",
    participants: [person("u-priya", "Priya", "women/19"), person("u-daniel", "Daniel", "men/49")],
    title: "Plan a Meal",
    theme: "meal",
    startsAt: "2026-10-15T20:00:00Z",
    endsAt: "2026-10-15T21:15:00Z",
    durationMinutes: 75,
    attendance: "both",
    rating: 4.9,
    status: "completed",
    flagged: false,
  },
  {
    id: "vd-89428",
    publicId: "VD-89428",
    participants: [person("u-ava", "Ava", "women/94"), person("u-ethan", "Ethan", "men/97")],
    title: "Movie Date",
    theme: "movie",
    startsAt: "2026-10-16T21:00:00Z",
    endsAt: "2026-10-16T22:30:00Z",
    durationMinutes: 90,
    attendance: "both",
    status: "live",
    flagged: false,
  },
  {
    id: "vd-89429",
    publicId: "VD-89429",
    participants: [person("u-zoe", "Zoe", "women/56"), person("u-ryan", "Ryan", "men/88")],
    title: "Game Date",
    theme: "game",
    startsAt: "2026-10-18T12:00:00Z",
    endsAt: "2026-10-18T12:45:00Z",
    durationMinutes: 45,
    attendance: "pending",
    status: "upcoming",
    flagged: false,
  },
  {
    id: "vd-89430",
    publicId: "VD-89430",
    participants: [person("u-maya", "Maya", "women/90"), person("u-lucas", "Lucas", "men/33")],
    title: "Shop Together",
    theme: "shop",
    startsAt: "2026-10-14T17:00:00Z",
    endsAt: "2026-10-14T17:30:00Z",
    durationMinutes: 30,
    attendance: "no-show",
    status: "cancelled",
    flagged: false,
  },
];
