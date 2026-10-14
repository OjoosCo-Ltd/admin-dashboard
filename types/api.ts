/**
 * Shared API shapes. Enum values match the backend's spelling in its DTOs
 * and query params. All DTOs use `forbidNonWhitelisted`, so an extra
 * property in a request body is a 400, not silently ignored.
 */

export type UserRole = "User" | "Admin" | "Moderator";
export type AccountStatus = "ACTIVE" | "PAUSED" | "SUSPENDED" | "DELETED";
export type OnboardingStatus = "IN_PROGRESS" | "COMPLETED";
export type VerificationStatus = "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "EXPIRED";
export type ReportStatus = "PENDING" | "REVIEWED" | "ACTIONED" | "DISMISSED";
export type StatsPeriod = "day" | "week" | "month";
export type SortOrder = "asc" | "desc";

/** NestJS error body. `message` is a string[] when DTO validation fails. */
export interface ApiErrorBody {
  message: string | string[];
  error?: string;
  statusCode: number;
}

/**
 * ⚠️ PROVISIONAL: the `{ success, message, data }` envelope used by the app's
 * profile routes. Check it against each admin route before relying on it.
 */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

/** ⚠️ PROVISIONAL: the shape /matching/history uses. Confirm per admin list. */
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PageParams {
  page?: number;
  limit?: number;
}
