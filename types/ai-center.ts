/**
 * Shapes the AI Center renders. ⚠️ PROVISIONAL: modeled on the Figma. The
 * backend has no AI metrics routes yet; only the matching weights
 * (ENDPOINTS.matching.weights) relate to this page.
 */

export interface AiPerformancePoint {
  label: string;
  /** Match accuracy, percent. */
  accuracy: number;
  /** AI requests that day. */
  requests: number;
}

export interface AiFeatureShare {
  id: "matchmaking" | "starters" | "suggestions" | "other";
  label: string;
  percent: number;
}

export interface AiFeatureUsage {
  /** AI services running. */
  services: number;
  shares: AiFeatureShare[];
}

/** One reading on the health strip: a state with a dot, a figure, or plain text. */
export interface AiHealthReading {
  id: string;
  label: string;
  value: string;
  tone: "healthy" | "fast" | "critical" | "plain";
}

export interface AiService {
  id: string;
  name: string;
  /** Formatted: "42.1k". */
  requestsToday: string;
  /** Percent. */
  successRate: number;
  /** Seconds. */
  avgResponse: number;
  /** Share of eligible users on it, percent. */
  adoption: number;
  status: "active" | "degraded" | "offline";
}

/** A sentence with some phrases picked out, as the Smart Insights cards set them. */
export interface AiInsight {
  id: string;
  kind: "trend" | "behavior" | "idea";
  parts: { text: string; highlight?: boolean }[];
}

export interface SafetySignal {
  id: "fakes" | "spam" | "flagged";
  label: string;
  /** Formatted: "2.4k". */
  value: string;
  period: string;
}
