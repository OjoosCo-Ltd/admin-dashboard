import { apiClient } from "@/libs/api/client";
import { ENDPOINTS } from "@/libs/api/endpoints";
import { toPage, unwrap } from "@/libs/api/normalize";
import type {
  AdminReviewVerificationDto,
  BulkReviewVerificationsDto,
  GetAllVerificationsQuery,
  OverrideAutoStatusDto,
} from "@/types/api-dtos";

// ⚠️ PROVISIONAL: responses stay `unknown` until each route is typed from a live sample.

/** The review queue. It lives under /verification/admin, not /admin/verification. */
export const listVerificationsAction = (query: GetAllVerificationsQuery = {}) =>
  apiClient
    .get<unknown>(ENDPOINTS.verification.list, { params: { ...query } })
    .then((body) => toPage<unknown>(body, query));

export const getVerificationStatsAction = () =>
  apiClient.get<unknown>(ENDPOINTS.verification.stats).then(unwrap<unknown>);

/** The full case, OCR and face data included. */
export const getVerificationAction = (userId: string) =>
  apiClient.get<unknown>(ENDPOINTS.verification.detail(userId)).then(unwrap<unknown>);

export const getDocumentRequirementsAction = (documentType: string) =>
  apiClient.get<unknown>(ENDPOINTS.verification.requirements(documentType)).then(unwrap<unknown>);

/** `rejectionReason` is required with REJECTED, and the member reads it. */
export const reviewVerificationAction = (userId: string, body: AdminReviewVerificationDto) =>
  apiClient.put<unknown>(ENDPOINTS.verification.review(userId), body);

export const bulkReviewVerificationsAction = (body: BulkReviewVerificationsDto) =>
  apiClient.post<unknown>(ENDPOINTS.verification.bulkReview, body);

export const retryAutoVerificationAction = (userId: string) =>
  apiClient.post<unknown>(ENDPOINTS.verification.retryAuto(userId));

export const overrideAutoStatusAction = (userId: string, body: OverrideAutoStatusDto) =>
  apiClient.patch<unknown>(ENDPOINTS.verification.autoStatus(userId), body);
