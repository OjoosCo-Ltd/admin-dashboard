import { useQuery } from "@tanstack/react-query";

import {
  bulkReviewVerificationsAction,
  getDocumentRequirementsAction,
  getVerificationAction,
  getVerificationStatsAction,
  listVerificationsAction,
  overrideAutoStatusAction,
  retryAutoVerificationAction,
  reviewVerificationAction,
} from "@/actions/verification-actions";
import { queryKeys } from "@/libs/react-query/query-client";
import type {
  AdminReviewVerificationDto,
  BulkReviewVerificationsDto,
  GetAllVerificationsQuery,
  OverrideAutoStatusDto,
} from "@/types/api-dtos";

import { useInvalidatingMutation } from "./mutation";

// A decision changes the queue, the stats and the member's badge in the users lists.
const AFTER_REVIEW = [queryKeys.verification.all, queryKeys.users.all, queryKeys.dashboard.all];

export function useVerifications(query: GetAllVerificationsQuery = {}) {
  return useQuery({
    queryKey: queryKeys.verification.list(query),
    queryFn: () => listVerificationsAction(query),
  });
}

export function useVerificationStats() {
  return useQuery({
    queryKey: queryKeys.verification.stats(),
    queryFn: getVerificationStatsAction,
  });
}

export function useVerification(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.verification.detail(userId ?? ""),
    queryFn: () => getVerificationAction(userId!),
    enabled: Boolean(userId),
  });
}

export function useDocumentRequirements(documentType: string | undefined) {
  return useQuery({
    queryKey: queryKeys.verification.requirements(documentType ?? ""),
    queryFn: () => getDocumentRequirementsAction(documentType!),
    enabled: Boolean(documentType),
    // Fixed per document type.
    staleTime: Infinity,
  });
}

export function useReviewVerification() {
  return useInvalidatingMutation(
    ({ userId, ...body }: { userId: string } & AdminReviewVerificationDto) =>
      reviewVerificationAction(userId, body),
    AFTER_REVIEW,
  );
}

export function useBulkReviewVerifications() {
  return useInvalidatingMutation(
    (body: BulkReviewVerificationsDto) => bulkReviewVerificationsAction(body),
    AFTER_REVIEW,
  );
}

export function useRetryAutoVerification() {
  return useInvalidatingMutation(
    (userId: string) => retryAutoVerificationAction(userId),
    AFTER_REVIEW,
  );
}

export function useOverrideAutoStatus() {
  return useInvalidatingMutation(
    ({ userId, ...body }: { userId: string } & OverrideAutoStatusDto) =>
      overrideAutoStatusAction(userId, body),
    AFTER_REVIEW,
  );
}
