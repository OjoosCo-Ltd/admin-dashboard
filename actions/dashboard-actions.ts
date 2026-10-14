import { apiClient } from "@/libs/api/client";
import { ENDPOINTS } from "@/libs/api/endpoints";
import type { StatsPeriod } from "@/types/api";

// ⚠️ PROVISIONAL: the spec documents no response bodies for these routes.
// They return `unknown` until each one is typed from a live sample.

export interface StatsRange {
  period?: StatsPeriod;
  from?: string;
  to?: string;
}

export const getDashboardOverviewAction = () =>
  apiClient.get<unknown>(ENDPOINTS.dashboard.overview);

export const getUserGrowthAction = (params: StatsRange = {}) =>
  apiClient.get<unknown>(ENDPOINTS.dashboard.userGrowth, { params: { ...params } });

export const getEngagementAction = (params: StatsRange & { days?: number } = {}) =>
  apiClient.get<unknown>(ENDPOINTS.dashboard.engagement, { params: { ...params } });
