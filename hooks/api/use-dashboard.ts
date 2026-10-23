import { useQuery } from "@tanstack/react-query";

import {
  getDashboardOverviewAction,
  getEngagementAction,
  getUserGrowthAction,
} from "@/actions/dashboard-actions";
import { queryKeys } from "@/libs/react-query/query-client";
import type { EngagementAnalyticsQuery, UserGrowthQuery } from "@/types/api-dtos";

export function useDashboardOverview() {
  return useQuery({
    queryKey: queryKeys.dashboard.overview(),
    queryFn: getDashboardOverviewAction,
  });
}

export function useUserGrowth(query: UserGrowthQuery = {}) {
  return useQuery({
    queryKey: queryKeys.dashboard.userGrowth(query),
    queryFn: () => getUserGrowthAction(query),
  });
}

export function useEngagement(query: EngagementAnalyticsQuery = {}) {
  return useQuery({
    queryKey: queryKeys.dashboard.engagement(query),
    queryFn: () => getEngagementAction(query),
  });
}
