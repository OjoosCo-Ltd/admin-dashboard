import { useQuery } from "@tanstack/react-query";

import {
  generateMatchesAction,
  getMatchAction,
  getMatchingStatsAction,
  getMatchWeightsAction,
  invalidateMatchAction,
  listMatchesAction,
  resetMatchPenaltiesAction,
  updateMatchWeightsAction,
} from "@/actions/matching-actions";
import { queryKeys } from "@/libs/react-query/query-client";
import type { InvalidateMatchDto, ListMatchesQuery, UpdateMatchWeightsDto } from "@/types/api-dtos";

import { useInvalidatingMutation } from "./mutation";

export function useMatchingStats() {
  return useQuery({ queryKey: queryKeys.matching.stats(), queryFn: getMatchingStatsAction });
}

export function useMatches(query: ListMatchesQuery = {}) {
  return useQuery({
    queryKey: queryKeys.matching.list(query),
    queryFn: () => listMatchesAction(query),
  });
}

export function useMatch(matchId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.matching.detail(matchId ?? ""),
    queryFn: () => getMatchAction(matchId!),
    enabled: Boolean(matchId),
  });
}

export function useMatchWeights() {
  return useQuery({ queryKey: queryKeys.matching.weights(), queryFn: getMatchWeightsAction });
}

/** Ending a match also archives its conversation. */
export function useInvalidateMatch() {
  return useInvalidatingMutation(
    ({ matchId, ...body }: { matchId: string } & InvalidateMatchDto) =>
      invalidateMatchAction(matchId, body),
    [queryKeys.matching.all, queryKeys.chat.all],
  );
}

export function useGenerateMatches() {
  return useInvalidatingMutation(
    (userId: string) => generateMatchesAction(userId),
    [queryKeys.matching.all],
  );
}

export function useResetMatchPenalties() {
  return useInvalidatingMutation(
    (userId: string) => resetMatchPenaltiesAction(userId),
    [queryKeys.matching.all],
  );
}

export function useUpdateMatchWeights() {
  return useInvalidatingMutation(
    (body: UpdateMatchWeightsDto) => updateMatchWeightsAction(body),
    [queryKeys.matching.weights()],
  );
}
