import type { VerificationStatus } from "@/types/api";
import type { RiskLevel } from "@/types/verification";

/** Each status as the Figma labels and colors it: the text and its dot share the color. */
export const STATUS_STYLES: Record<VerificationStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "text-attention" },
  UNDER_REVIEW: { label: "Needs Review", className: "text-review dark:text-subtle-foreground" },
  APPROVED: { label: "Approved", className: "text-success" },
  REJECTED: { label: "Rejected", className: "text-destructive" },
  EXPIRED: { label: "Expired", className: "text-muted-foreground" },
};

/** Risk pills: the queue's Risk Level and the review sheet's priority. */
export const RISK_STYLES: Record<RiskLevel, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-[#ddebf0] text-action dark:bg-action/30 dark:text-primary" },
  medium: {
    label: "Medium",
    className: "bg-caution-soft text-caution dark:bg-caution/30 dark:text-amber-300",
  },
  high: {
    label: "High",
    className: "bg-destructive-soft text-destructive dark:bg-destructive/15",
  },
};

export type ScoreBand = "pass" | "review" | "fail";

/** How an automated check's score reads: 90 and up passes, 60 and up needs a look, lower fails. */
export const scoreBand = (score: number): ScoreBand =>
  score >= 90 ? "pass" : score >= 60 ? "review" : "fail";
