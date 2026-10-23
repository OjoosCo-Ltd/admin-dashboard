import { useQuery } from "@tanstack/react-query";

import {
  cancelVirtualDateAction,
  getVirtualDateAction,
  getVirtualDateStatsAction,
  listVirtualDatesAction,
} from "@/actions/virtual-dates-actions";
import { queryKeys } from "@/libs/react-query/query-client";
import type { AdminCancelVirtualDateDto, ListVirtualDatesQuery } from "@/types/api-dtos";

import { useInvalidatingMutation } from "./mutation";

export function useVirtualDates(query: ListVirtualDatesQuery = {}) {
  return useQuery({
    queryKey: queryKeys.virtualDates.list(query),
    queryFn: () => listVirtualDatesAction(query),
  });
}

export function useVirtualDateStats() {
  return useQuery({
    queryKey: queryKeys.virtualDates.stats(),
    queryFn: getVirtualDateStatsAction,
  });
}

export function useVirtualDate(invitationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.virtualDates.detail(invitationId ?? ""),
    queryFn: () => getVirtualDateAction(invitationId!),
    enabled: Boolean(invitationId),
  });
}

export function useCancelVirtualDate() {
  return useInvalidatingMutation(
    ({ invitationId, ...body }: { invitationId: string } & AdminCancelVirtualDateDto) =>
      cancelVirtualDateAction(invitationId, body),
    [queryKeys.virtualDates.all],
  );
}
