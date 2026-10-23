import { apiClient } from "@/libs/api/client";
import { ENDPOINTS } from "@/libs/api/endpoints";
import { toPage, unwrap } from "@/libs/api/normalize";
import type { InvalidateMatchDto, ListMatchesQuery, UpdateMatchWeightsDto } from "@/types/api-dtos";

// ⚠️ PROVISIONAL: responses stay `unknown` until each route is typed from a live sample.

export const getMatchingStatsAction = () =>
  apiClient.get<unknown>(ENDPOINTS.matching.stats).then(unwrap<unknown>);

/** `minScore` is 0-1 here, while member responses score 0-100. */
export const listMatchesAction = (query: ListMatchesQuery = {}) =>
  apiClient
    .get<unknown>(ENDPOINTS.matching.list, { params: { ...query } })
    .then((body) => toPage<unknown>(body, query));

export const getMatchAction = (matchId: string) =>
  apiClient.get<unknown>(ENDPOINTS.matching.detail(matchId)).then(unwrap<unknown>);

/** Ends the match and archives its conversation. */
export const invalidateMatchAction = (matchId: string, body: InvalidateMatchDto) =>
  apiClient.post<unknown>(ENDPOINTS.matching.invalidate(matchId), body);

export const generateMatchesAction = (userId: string) =>
  apiClient.post<unknown>(ENDPOINTS.matching.generate(userId));

/** Clears the member's rejected-match penalties so they can be matched again. */
export const resetMatchPenaltiesAction = (userId: string) =>
  apiClient.post<unknown>(ENDPOINTS.matching.resetPenalties(userId));

export const getMatchWeightsAction = () =>
  apiClient.get<unknown>(ENDPOINTS.matching.weights).then(unwrap<unknown>);

/** All five weights must add up to 1. */
export const updateMatchWeightsAction = (body: UpdateMatchWeightsDto) =>
  apiClient.patch<unknown>(ENDPOINTS.matching.weights, body);
