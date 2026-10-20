import { SAMPLE_REPORTS_NOW } from "@/constants/reports-sample";
import type { ReportCategory, ReportPriority, ReportStatus } from "@/types/reports";

export const CATEGORY_LABELS: Record<ReportCategory, string> = {
  harassment: "Harassment",
  spam: "Spam",
  "fake-profile": "Fake Profile",
  scam: "Scam",
  other: "Other",
};

export const PRIORITY: Record<ReportPriority, { label: string; className: string }> = {
  critical: { label: "Critical", className: "text-destructive" },
  high: { label: "High", className: "text-destructive" },
  medium: { label: "Medium", className: "text-caution dark:text-[#e9b97c]" },
  low: { label: "Low", className: "text-outline" },
};

export const STATUS: Record<ReportStatus, { label: string; className: string }> = {
  new: { label: "New", className: "bg-[#e5eff2] text-action dark:bg-action/25 dark:text-primary" },
  reviewing: {
    label: "Reviewing",
    className: "bg-info-soft text-[#314a57] dark:bg-info-soft/20 dark:text-info-soft",
  },
  resolved: {
    label: "Resolved",
    className: "bg-success-soft text-success-strong dark:bg-success/15 dark:text-success",
  },
  dismissed: {
    label: "Dismissed",
    className: "bg-muted-strong text-muted-foreground dark:bg-muted",
  },
};

/** The AI risk score's tint: red from 80, amber from 50, otherwise neutral. */
export const riskTone = (score: number) =>
  score >= 80
    ? "bg-[#f8e7e8] text-destructive dark:bg-destructive/20"
    : score >= 50
      ? "bg-[#f3ede7] text-caution dark:bg-caution/30 dark:text-[#e9b97c]"
      : "bg-muted text-muted-foreground";

/** "Critical" from 90, "High" from 75, "Elevated" from 50, else "Low": the sheet's risk pill. */
export const riskVerdict = (score: number) =>
  score >= 90 ? "Critical" : score >= 75 ? "High" : score >= 50 ? "Elevated" : "Low";

/** "2m ago", "14m ago", "2h ago", "3d ago", against the sample's fixed "now". */
export function formatAgo(iso: string, now = SAMPLE_REPORTS_NOW) {
  const minutes = Math.max(0, Math.round((Date.parse(now) - Date.parse(iso)) / 60_000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export const reportInitials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
