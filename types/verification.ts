import type { VerificationStatus } from "@/types/api";

/**
 * Shapes the verification UI renders. ⚠️ PROVISIONAL: modeled on the Figma,
 * not on API responses. Map /verification/admin/all, /admin/verification/stats
 * and /admin/verification/{userId} onto these when they're wired.
 */

export type RiskLevel = "low" | "medium" | "high";

/** What an admin can ask a user to upload again. */
export type ResubmissionDocument = "id-front" | "id-back" | "selfie";

export interface VerificationDocument {
  id: string;
  /** "Passport (Front)", "Selfie / Liveness". */
  label: string;
  /** Null when the image is no longer stored. */
  url: string | null;
}

export interface OcrField {
  id: string;
  label: string;
  value: string;
  /** A value the checks didn't accept. Shown in red. */
  flagged?: boolean;
}

export interface CaseEvent {
  id: string;
  title: string;
  /** Already formatted, e.g. "Today at 09:12 AM". */
  time: string;
  /** User and moderator events get a primary dot, system events a muted one. */
  actor: "user" | "moderator" | "system";
}

/** One row of the verification queue, with everything its review sheet shows. */
export interface VerificationCase {
  /** What the review endpoints take. */
  userId: string;
  /** Display reference, e.g. "XP-8829". */
  caseId: string;
  name: string;
  avatarUrl?: string;
  /** Display string, e.g. "Passport (United Kingdom)". */
  documentType: string;
  /** ISO 3166-1 alpha-3, e.g. "GBR". */
  country: string;
  /** Face match score, percent. */
  faceMatch: number;
  risk: RiskLevel;
  status: VerificationStatus;
  /** An admin's name, "System (Auto)", or null while nobody has the case. */
  reviewer: string | null;
  /** Already relative, e.g. "2h ago". */
  submitted: string;
  documents: VerificationDocument[];
  /** The other automated checks (percent), and what they add up to. */
  liveness: number;
  authenticity: number;
  summary: string;
  ocr: OcrField[];
  history: CaseEvent[];
  /** Problems the checks found per document. Those documents start ticked in "Request New Documents". */
  documentIssues?: Partial<Record<ResubmissionDocument, string>>;
}

export interface TrendPoint {
  /** Day of the week, e.g. "MON". */
  label: string;
  submissions: number;
  approvals: number;
}

export interface ApprovalSlice {
  id: "approved" | "pending" | "rejected";
  label: string;
  /** Percent of all decisions. The slices sum to 100. */
  value: number;
}

export interface ApprovalDistribution {
  total: number;
  slices: ApprovalSlice[];
}

export interface FraudSignal {
  id: "duplicate-ids" | "forged-documents" | "banned-face-match" | "sanctioned-countries";
  label: string;
  value: number;
  /** "+8% vs last month", "Stable". */
  note: string;
}

export interface TopModerator {
  id: string;
  name: string;
  reviews: number;
}
