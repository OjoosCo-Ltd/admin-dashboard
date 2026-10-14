import { useQuery } from "@tanstack/react-query";

import {
  getDashboardOverviewAction,
  getEngagementAction,
  getUserGrowthAction,
  type StatsRange,
} from "@/actions/dashboard-actions";
import { queryKeys } from "@/libs/react-query/query-client";

export function useDashboardOverview() {
  return useQuery({
    queryKey: queryKeys.dashboard.overview(),
    queryFn: getDashboardOverviewAction,
  });
}

export function useUserGrowth(params: StatsRange = {}) {
  return useQuery({
    queryKey: queryKeys.dashboard.userGrowth(params),
    queryFn: () => getUserGrowthAction(params),
  });
}

export function useEngagement(params: StatsRange & { days?: number } = {}) {
  return useQuery({
    queryKey: queryKeys.dashboard.engagement(params),
    queryFn: () => getEngagementAction(params),
  });
}
