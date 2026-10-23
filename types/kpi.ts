import type { Feature } from "@/constants/features";

/**
 * A figure for the compact KPI card (components/dashboard/compact-kpi-card.tsx),
 * the row the verification, conversations and matches Figmas share.
 * ⚠️ PROVISIONAL: modeled on the Figma, not on API responses.
 */
export interface CompactKpi {
  id: string;
  /** Hidden while this feature is off (filter the row with `enabled`). */
  feature?: Feature;
  label: string;
  /** Formatted for display: "142", "4.2m", "84.2k". */
  value: string;
  /** The change against the comparison period, shown top right and again under the value. */
  change?: {
    /** Formatted, with a sign only where the Figma shows one: "12%", "-15s", "+3". */
    label: string;
    direction: "up" | "down";
    /** Whether the change is good news: green when it is, red when not. */
    favorable: boolean;
    /** "vs last month". */
    comparison: string;
  };
  /** A state in place of a change, under the value: "Stable", "Critical". */
  status?: { label: string; tone: "steady" | "critical" };
  /** A pill in the top corner, in place of the change there: "High", "Uptime", "Past 24h". */
  badge?: { label: string; tone: "warm" | "cool" | "emerald" | "indigo" | "neutral" };
  /** Colors the value itself, as Community's "Reported Content" sets it in red. */
  valueTone?: "critical";
  /** Oldest to newest. Without one the card has no sparkline. */
  trend?: number[];
}
