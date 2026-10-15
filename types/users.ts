/**
 * Shapes the Users page renders. ⚠️ PROVISIONAL: modeled on the Figma, not on
 * API responses. GET /admin/users (ENDPOINTS.users.list) is untyped, and it
 * filters by `search` and account `status` only: it has no location, plan or
 * verification filter yet.
 */

import type { SubscriptionPlan } from "@/types/dashboard";

export type UserVerification = "verified" | "pending" | "unverified";

export type UserGender = "Female" | "Male" | "Non-binary" | "Other";

/** One row of the user directory. */
export interface UserSummary {
  id: string;
  /** The public ID shown with a leading #, e.g. "XP-99812". */
  publicId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  age: number;
  gender: UserGender;
  /** As the table prints it: "London, UK". */
  location: string;
  country: string;
  verification: UserVerification;
  suspended: boolean;
  online: boolean;
  plan: SubscriptionPlan;
  /** Already relative, e.g. "2 hours ago". */
  lastActive: string;
  lastActiveAt: string;
}

/** The extra detail the profile preview shows. */
export interface UserDetail extends UserSummary {
  /** "Product Designer at BloomTech". */
  headline: string;
  memberSince: string;
  matches: number;
  dates: number;
  /** Average rating out of 5. */
  rating: number;
  /** The document the identity check used, e.g. "Passport". */
  verifiedWith?: string;
  activeReports: number;
}

export type UserStatusFilter = "all" | "verified" | "pending" | "suspended";

export type UserPlanFilter = "all" | SubscriptionPlan;

export interface GenderShare {
  id: "male" | "female" | "non-binary" | "other";
  label: string;
  percent: number;
}

export interface AgeBand {
  label: string;
  percent: number;
}
