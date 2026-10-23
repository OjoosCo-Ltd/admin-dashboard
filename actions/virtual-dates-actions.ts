import { apiClient } from "@/libs/api/client";
import { ENDPOINTS } from "@/libs/api/endpoints";
import { toPage, unwrap } from "@/libs/api/normalize";
import type { AdminCancelVirtualDateDto, ListVirtualDatesQuery } from "@/types/api-dtos";

// ⚠️ PROVISIONAL: responses stay `unknown` until each route is typed from a live sample.

export const listVirtualDatesAction = (query: ListVirtualDatesQuery = {}) =>
  apiClient
    .get<unknown>(ENDPOINTS.virtualDates.list, { params: { ...query } })
    .then((body) => toPage<unknown>(body, query));

export const getVirtualDateStatsAction = () =>
  apiClient.get<unknown>(ENDPOINTS.virtualDates.stats).then(unwrap<unknown>);

export const getVirtualDateAction = (invitationId: string) =>
  apiClient.get<unknown>(ENDPOINTS.virtualDates.detail(invitationId)).then(unwrap<unknown>);

export const cancelVirtualDateAction = (invitationId: string, body: AdminCancelVirtualDateDto) =>
  apiClient.post<unknown>(ENDPOINTS.virtualDates.cancel(invitationId), body);
