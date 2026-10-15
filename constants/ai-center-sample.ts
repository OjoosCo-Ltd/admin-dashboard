import type {
  AiFeatureUsage,
  AiHealthReading,
  AiInsight,
  AiPerformancePoint,
  AiService,
  SafetySignal,
} from "@/types/ai-center";
import type { CompactKpi } from "@/types/kpi";

// UI only: the figures from the AI Center Figma, so the page renders before
// any AI metrics endpoint exists.

// Avg Response Time reads "↗ 12%" in green in the Figma; a faster response is a
// drop, so it's shown going down.
export const SAMPLE_AI_KPIS: CompactKpi[] = [
  {
    id: "match-accuracy",
    label: "AI Match Accuracy",
    value: "94.2%",
    change: { label: "12%", direction: "up", favorable: true, comparison: "vs last month" },
  },
  {
    id: "conversation-starters",
    label: "Conversation Starters",
    value: "12,408",
    change: { label: "5.4%", direction: "up", favorable: true, comparison: "vs yesterday" },
  },
  {
    id: "date-suggestions",
    label: "Physical Date Suggestions Accepted",
    value: "84%",
    badge: { label: "High", tone: "warm" },
    status: { label: "Stable", tone: "steady" },
  },
  {
    id: "recommendation-acceptance",
    label: "Recommendation Acceptance Rate",
    value: "72%",
    badge: { label: "Stable", tone: "cool" },
    change: { label: "0.8%", direction: "up", favorable: true, comparison: "vs last month" },
  },
  {
    id: "avg-response",
    label: "Avg Response Time",
    value: "1.2s",
    change: { label: "12%", direction: "down", favorable: true, comparison: "vs last month" },
  },
  {
    id: "satisfaction",
    label: "Satisfaction Rating",
    value: "4.8/5",
    badge: { label: "Top", tone: "warm" },
    change: { label: "5.4%", direction: "up", favorable: true, comparison: "vs yesterday" },
  },
  {
    id: "requests-today",
    label: "Requests Today",
    value: "84.2k",
    badge: { label: "Peak", tone: "cool" },
    status: { label: "Stable", tone: "steady" },
  },
  {
    id: "system-health",
    label: "AI System Health",
    value: "99.98%",
    badge: { label: "Uptime", tone: "cool" },
    change: { label: "0.8%", direction: "up", favorable: true, comparison: "vs last month" },
  },
];

/** About every third day over the last 30. */
export const SAMPLE_AI_PERFORMANCE: AiPerformancePoint[] = [
  { label: "Oct 01", accuracy: 93.0, requests: 72_400 },
  { label: "Oct 04", accuracy: 91.0, requests: 68_100 },
  { label: "Oct 07", accuracy: 94.0, requests: 75_300 },
  { label: "Oct 10", accuracy: 93.0, requests: 79_200 },
  { label: "Oct 13", accuracy: 94.6, requests: 74_800 },
  { label: "Oct 16", accuracy: 92.2, requests: 81_000 },
  { label: "Oct 18", accuracy: 97.0, requests: 86_400 },
  { label: "Oct 20", accuracy: 93.0, requests: 83_100 },
  { label: "Oct 24", accuracy: 94.6, requests: 80_300 },
  { label: "Oct 27", accuracy: 94.0, requests: 84_600 },
  { label: "Oct 30", accuracy: 97.0, requests: 88_200 },
];

export const SAMPLE_AI_FEATURE_USAGE: AiFeatureUsage = {
  services: 12,
  shares: [
    { id: "matchmaking", label: "Matchmaking", percent: 35 },
    { id: "starters", label: "Starters", percent: 24 },
    { id: "suggestions", label: "Suggestions", percent: 18 },
    { id: "other", label: "Other", percent: 23 },
  ],
};

export const SAMPLE_AI_HEALTH: AiHealthReading[] = [
  { id: "uptime", label: "API Uptime", value: "Healthy", tone: "healthy" },
  { id: "response", label: "Response Time", value: "Healthy", tone: "healthy" },
  { id: "queue", label: "Queue Size", value: "Healthy", tone: "healthy" },
  { id: "failed", label: "Failed Requests", value: "0.02%", tone: "critical" },
  { id: "speed", label: "Processing Speed", value: "Fast", tone: "fast" },
  { id: "models", label: "Active Models", value: "12 Clusters", tone: "plain" },
];

export const SAMPLE_AI_SERVICES: AiService[] = [
  {
    id: "matchmaking",
    name: "AI Matchmaking",
    requestsToday: "42.1k",
    successRate: 99.9,
    avgResponse: 0.8,
    adoption: 88,
    status: "active",
  },
  {
    id: "starters",
    name: "Conversation Starters",
    requestsToday: "12.4k",
    successRate: 98.4,
    avgResponse: 1.1,
    adoption: 65,
    status: "active",
  },
  {
    id: "date-suggestions",
    name: "Date Suggestions",
    requestsToday: "8.2k",
    successRate: 97.2,
    avgResponse: 1.5,
    adoption: 42,
    status: "active",
  },
  {
    id: "compatibility",
    name: "Compatibility Engine",
    requestsToday: "15.8k",
    successRate: 99.1,
    avgResponse: 0.9,
    adoption: 92,
    status: "active",
  },
  {
    id: "recommendations",
    name: "Profile Recommendations",
    requestsToday: "34.2k",
    successRate: 99.8,
    avgResponse: 0.4,
    adoption: 78,
    status: "active",
  },
  {
    id: "safety",
    name: "Safety Detection",
    requestsToday: "124k",
    successRate: 99.9,
    avgResponse: 0.1,
    adoption: 100,
    status: "active",
  },
];

export const SAMPLE_AI_INSIGHTS: AiInsight[] = [
  {
    id: "accuracy",
    kind: "trend",
    parts: [
      { text: "AI matchmaking accuracy improved by " },
      { text: "5.8%", highlight: true },
      { text: " following the latest neural weights update." },
    ],
  },
  {
    id: "starters",
    kind: "behavior",
    parts: [
      { text: "Users with AI starters are " },
      { text: "31% more likely", highlight: true },
      { text: " to continue chatting past 24 hours." },
    ],
  },
  {
    id: "date-suggestions",
    kind: "idea",
    parts: [
      {
        text: 'New "Date Suggestions" model shows higher engagement in the European demographic.',
      },
    ],
  },
];

export const SAMPLE_SAFETY_SIGNALS: SafetySignal[] = [
  { id: "fakes", label: "Detected Fakes", value: "432", period: "Last 24 hours" },
  { id: "spam", label: "Blocked Spam", value: "2.4k", period: "Last 24 hours" },
  { id: "flagged", label: "Flagged Behavior", value: "187", period: "Last 24 hours" },
];
