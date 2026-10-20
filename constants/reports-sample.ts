import { portrait, sampleCover } from "@/constants/sample-portraits";
import type {
  Moderator,
  ReportDistribution,
  ReportKpi,
  ResolutionSource,
  SafetyIntelligence,
  SafetyReport,
  SafetyTrendPoint,
} from "@/types/reports";

/** "Now" for the sample's relative times, so the server and browser agree. */
export const SAMPLE_REPORTS_NOW = "2026-10-20T12:00:00Z";

const monthly = "vs last month";

// Where the Figma's corner figure and the one under the value disagree, both use the lower one.
export const SAMPLE_REPORT_KPIS: ReportKpi[] = [
  {
    id: "open",
    label: "Open Reports",
    value: "432",
    change: { label: "12%", direction: "up", favorable: false, comparison: monthly },
    trend: [12, 14, 13, 16, 15, 18, 17, 19, 21, 20, 23, 22, 25, 26, 29],
  },
  {
    id: "resolved-today",
    label: "Reports Resolved Today",
    value: "89",
    change: { label: "5.4%", direction: "up", favorable: true, comparison: "vs yesterday" },
    trend: [20, 21, 30, 24, 18, 25, 24, 31, 27, 24, 34],
  },
  {
    id: "high-priority",
    label: "High Priority Cases",
    value: "24",
    change: { label: "2.1%", direction: "down", favorable: false, comparison: monthly },
    trend: [10, 11, 10, 12, 11, 12, 15, 14, 15, 14, 16, 15, 17, 18],
  },
  {
    id: "suspended",
    label: "Suspended Accounts",
    value: "12",
    change: { label: "0.8%", direction: "up", favorable: true, comparison: monthly },
    trend: [10, 11, 10, 12, 11, 12, 15, 14, 15, 14, 16, 15, 17, 18],
  },
  {
    id: "banned",
    label: "Permanently Banned",
    value: "5",
    change: { label: "2.1%", direction: "down", favorable: true, comparison: monthly },
    trend: [12, 14, 13, 16, 15, 18, 17, 19, 21, 20, 23, 22, 25, 26, 29],
  },
  {
    id: "fraud-prevented",
    label: "Fraud Prevented",
    value: "1,204",
    change: { label: "5.4%", direction: "up", favorable: true, comparison: monthly },
    trend: [20, 21, 30, 24, 18, 25, 24, 31, 27, 24, 34],
  },
  {
    id: "ai-alerts",
    label: "AI Safety Alerts",
    value: "56",
    change: { label: "2.1%", direction: "down", favorable: true, comparison: monthly },
    trend: [10, 11, 10, 12, 11, 12, 15, 14, 15, 14, 16, 15, 17, 18],
  },
  {
    id: "resolution-time",
    label: "Avg Resolution Time",
    value: "42m",
    change: { label: "8%", direction: "up", favorable: false, comparison: monthly },
    trend: [10, 11, 10, 12, 11, 12, 15, 14, 15, 14, 16, 15, 17, 18],
  },
];

export const SAMPLE_SAFETY_TRENDS: SafetyTrendPoint[] = [
  { month: "Jan", submitted: 290, resolved: 250 },
  { month: "Feb", submitted: 300, resolved: 238 },
  { month: "Mar", submitted: 90, resolved: 170 },
  { month: "Apr", submitted: 280, resolved: 242 },
  { month: "May", submitted: 410, resolved: 286 },
  { month: "Jun", submitted: 300, resolved: 262 },
  { month: "Jul", submitted: 70, resolved: 160 },
  { month: "Aug", submitted: 370, resolved: 268 },
  { month: "Sep", submitted: 560, resolved: 380 },
  { month: "Oct", submitted: 432, resolved: 300 },
  { month: "Nov", submitted: null, resolved: null },
  { month: "Dec", submitted: null, resolved: null },
];

export const SAMPLE_REPORT_DISTRIBUTION: ReportDistribution = {
  total: 432,
  shares: [
    { category: "fake-profile", label: "Fake Profile", share: 40 },
    { category: "harassment", label: "Harassment", share: 25 },
    { category: "spam", label: "Spam", share: 20 },
    { category: "other", label: "Other", share: 15 },
  ],
};

export const SAMPLE_REPORT_TOTAL = 432;

export const SAMPLE_REPORTS: SafetyReport[] = [
  {
    id: "REP-8291",
    reportedUser: {
      id: "user-julian",
      uid: "90210",
      name: "Julian V.",
      handle: "@julian_v",
      avatarUrl: portrait("men/41"),
      location: "Los Angeles, USA",
      standing: "restricted",
      accountStatus: "Flagged for Review",
      flagged: true,
      priorWarnings: 2,
    },
    reporter: {
      kind: "member",
      id: "user-sarah",
      uid: "77341",
      name: "Sarah Jenkins",
      handle: "@sarahj",
      avatarUrl: portrait("women/12"),
      location: "Austin, USA",
      standing: "good",
      accountStatus: "Active",
      verified: true,
      trustScore: 98,
    },
    category: "harassment",
    aiRisk: 92,
    priority: "critical",
    submittedAt: "2026-10-20T11:58:00Z",
    status: "new",
    evidence: {
      transcript:
        "…I don't care what you think, you [EXPLETIVE]. Just wait until I find out where you work…",
      imageUrl: sampleCover("report-8291", 640, 240),
    },
    analysis: [
      { label: "Toxic Language", score: 94 },
      { label: "Harassment Probability", score: 89 },
      { label: "Identity Risk", score: 12 },
    ],
  },
  {
    id: "REP-8285",
    reportedUser: {
      id: "user-cryptoking",
      uid: "44102",
      name: "CryptoKing99",
      handle: "@cryptoking99",
      avatarUrl: portrait("men/86"),
      location: "Unknown",
      standing: "restricted",
      accountStatus: "Restricted Visibility",
      flagged: true,
      priorWarnings: 0,
    },
    reporter: { kind: "system", name: "AI Detection System" },
    category: "spam",
    aiRisk: 68,
    priority: "medium",
    submittedAt: "2026-10-20T11:46:00Z",
    status: "reviewing",
    evidence: {
      transcript:
        "…Hey! Want to double your money this week? Message me on the link in my bio, limited spots…",
    },
    analysis: [
      { label: "Spam Pattern Match", score: 71 },
      { label: "Scam Link Risk", score: 64 },
      { label: "Toxic Language", score: 8 },
    ],
  },
  {
    id: "REP-8277",
    reportedUser: {
      id: "user-diana",
      uid: "11223",
      name: "Diana Ross",
      handle: "@diana.r",
      avatarUrl: portrait("women/50"),
      location: "Chicago, USA",
      standing: "good",
      accountStatus: "Active",
      flagged: false,
      priorWarnings: 0,
    },
    reporter: {
      kind: "member",
      id: "user-marc",
      uid: "55890",
      name: "Marc Jacobs",
      handle: "@marcj",
      avatarUrl: portrait("men/18"),
      location: "Denver, USA",
      standing: "good",
      accountStatus: "Active",
      verified: true,
      trustScore: 91,
    },
    category: "fake-profile",
    aiRisk: 85,
    priority: "high",
    submittedAt: "2026-10-20T10:00:00Z",
    status: "new",
    evidence: {
      transcript:
        "…Her photos come up in a reverse image search under a different name, and she won't video call…",
      imageUrl: sampleCover("report-8277", 640, 240),
    },
    analysis: [
      { label: "Identity Risk", score: 87 },
      { label: "Photo Reuse Match", score: 82 },
      { label: "Toxic Language", score: 3 },
    ],
  },
];

export const SAMPLE_SAFETY_INTELLIGENCE: SafetyIntelligence = {
  threats: {
    count: 1402,
    description: "Fake profiles detected and shadow-banned in the last 24h.",
    progress: 85,
  },
  filters: {
    successRate: "99.8%",
    description:
      "System successfully mitigated a potential credential stuffing attack originating from IP range 192.x.x.x at 04:12 UTC.",
  },
};

export const SAMPLE_RESOLUTION_SOURCES: ResolutionSource[] = [
  { id: "ai", label: "AI Auto-Resolve", share: 62 },
  { id: "moderator", label: "L1 Moderator", share: 28 },
  { id: "admin", label: "Admin Escalation", share: 10 },
];

export const SAMPLE_SAFETY_INSIGHTS = [
  'Spike in #REP-Financial reports correlates with the recent "Gold Token" event. Recommend tightening keyword filters for "Airdrop".',
  'Moderator "Sarah K." is 25% faster than average on Harassment cases. Consider her for the specialized Lead Reviewer role.',
];

export const SAMPLE_MODERATORS: Moderator[] = [
  {
    id: "mod-liam",
    name: "Liam Carter",
    avatarUrl: portrait("men/29"),
    presence: "online",
    resolved: 142,
    accuracy: 98,
  },
  {
    id: "mod-sarah",
    name: "Sarah K.",
    avatarUrl: portrait("women/57"),
    presence: "online",
    resolved: 128,
    accuracy: 99,
  },
  {
    id: "mod-johnathan",
    name: "Johnathan D.",
    avatarUrl: portrait("men/61"),
    presence: "away",
    resolved: 115,
    accuracy: 95,
  },
];

export const SAMPLE_ACTIVE_MODS = { active: 24, total: 30 };
