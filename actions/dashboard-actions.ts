import { apiClient } from "@/libs/api/client";
import { ENDPOINTS } from "@/libs/api/endpoints";
import { unwrap } from "@/libs/api/normalize";
import type { EngagementAnalyticsQuery, UserGrowthQuery } from "@/types/api-dtos";

// ⚠️ PROVISIONAL: the spec documents no response bodies for these routes.
// They return `unknown` until each one is typed from a live sample.

export const getDashboardOverviewAction = () =>
  apiClient.get<unknown>(ENDPOINTS.dashboard.overview).then(unwrap<unknown>);

/** Sign-ups per bucket: ?period=day|week|month (default week), ISO from and to. */
export const getUserGrowthAction = (query: UserGrowthQuery = {}) =>
  apiClient
    .get<unknown>(ENDPOINTS.dashboard.userGrowth, { params: { ...query } })
    .then(unwrap<unknown>);

/** Messages, matches and posts per bucket: ?period (default day), from, to, days (default 30). */
export const getEngagementAction = (query: EngagementAnalyticsQuery = {}) =>
  apiClient
    .get<unknown>(ENDPOINTS.dashboard.engagement, { params: { ...query } })
    .then(unwrap<unknown>);
