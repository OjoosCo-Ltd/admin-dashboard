import { cn } from "cn";
import type { Metadata } from "next";

import { AnalyticsInsightsCard } from "@/components/analytics/analytics-insights-card";
import { AnalyticsKpiRow } from "@/components/analytics/analytics-kpi-row";
import { AnalyticsTrustCard } from "@/components/analytics/analytics-trust-card";
import { CompatibilityCard } from "@/components/analytics/compatibility-card";
import { EngagementColumn } from "@/components/analytics/engagement-column";
import { EngagementStatsRow } from "@/components/analytics/engagement-stats-row";
import { GeographicCard } from "@/components/analytics/geographic-card";
import { MatchFunnelCard } from "@/components/analytics/match-funnel-card";
import { ModelEfficiencyCard } from "@/components/analytics/model-efficiency-card";
import { RecentEventsCard } from "@/components/analytics/recent-events-card";
import { SubscriptionRevenueCard } from "@/components/analytics/subscription-revenue-card";
import { UserGrowthCard } from "@/components/analytics/user-growth-card";
import { UserTiersCard } from "@/components/analytics/user-tiers-card";
import { DashboardExportButton } from "@/components/dashboard/dashboard-export-button";
import { PageHeader } from "@/components/layout/page-header";
import { DateRangeSelect } from "@/components/layout/page-header-actions";
import { FEATURES } from "@/constants/features";
import {
  SAMPLE_ALGORITHM,
  SAMPLE_ANALYTICS_EVENTS,
  SAMPLE_ANALYTICS_INSIGHTS,
  SAMPLE_ANALYTICS_KPIS,
  SAMPLE_ANALYTICS_NOW,
  SAMPLE_COMPATIBILITY,
  SAMPLE_COUNTRIES,
  SAMPLE_ENGAGEMENT,
  SAMPLE_ENGAGEMENT_STATS,
  SAMPLE_MATCH_FUNNEL,
  SAMPLE_MODEL_EFFICIENCY,
  SAMPLE_SUBSCRIPTION_REVENUE,
  SAMPLE_TRUST,
  SAMPLE_USER_GROWTH,
  SAMPLE_USER_TIERS,
} from "@/constants/analytics-sample";

export const metadata: Metadata = { title: "Analytics" };

// The description names only what the page shows: revenue comes from the
// Revenue KPI (payments) and Subscription Revenue (subscriptions).
const TOPICS = [
  "user growth",
  "engagement",
  "matchmaking performance",
  (FEATURES.payments || FEATURES.subscriptions) && "revenue",
  "the overall health of the Xparience platform",
].filter((topic) => typeof topic === "string");

// UI only: the Figma's sample figures. GET /admin/dashboard/* is the nearest
// backend source, and it isn't typed or wired yet. Cards with no backend
// source wait on their feature flag; the rows close up around them.
export default function AnalyticsPage() {
  const sideCards = FEATURES.insights && FEATURES.auditLog;
  return (
    <>
      <PageHeader
        title="Analytics"
        description={`Understand ${new Intl.ListFormat("en-US").format(TOPICS)}.`}
        descriptionClassName="text-pretty xl:max-w-160"
      >
        <DateRangeSelect />
        <DashboardExportButton />
      </PageHeader>
      <AnalyticsKpiRow kpis={SAMPLE_ANALYTICS_KPIS} />
      <div className="grid items-stretch gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <UserGrowthCard data={SAMPLE_USER_GROWTH} />
        <EngagementColumn engagement={SAMPLE_ENGAGEMENT} algorithm={SAMPLE_ALGORITHM} />
      </div>
      <div className="grid items-stretch gap-6 lg:grid-cols-2 xl:grid-cols-[3fr_2fr_2fr]">
        <MatchFunnelCard stages={SAMPLE_MATCH_FUNNEL} className="lg:col-span-2 xl:col-span-1" />
        <ModelEfficiencyCard model={SAMPLE_MODEL_EFFICIENCY} />
        <CompatibilityCard data={SAMPLE_COMPATIBILITY} />
      </div>
      <EngagementStatsRow stats={SAMPLE_ENGAGEMENT_STATS} />
      {FEATURES.subscriptions && (
        <div className="grid items-stretch gap-6 lg:grid-cols-2">
          <SubscriptionRevenueCard data={SAMPLE_SUBSCRIPTION_REVENUE} />
          <UserTiersCard tiers={SAMPLE_USER_TIERS} />
        </div>
      )}
      {FEATURES.geoBreakdown ? (
        <div className="grid items-stretch gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <GeographicCard countries={SAMPLE_COUNTRIES} />
          <AnalyticsTrustCard trust={SAMPLE_TRUST} />
        </div>
      ) : (
        <AnalyticsTrustCard trust={SAMPLE_TRUST} spansRow />
      )}
      {(FEATURES.insights || FEATURES.auditLog) && (
        <div className={cn("grid items-stretch gap-6", sideCards && "xl:grid-cols-4")}>
          {FEATURES.insights && (
            <AnalyticsInsightsCard
              insights={SAMPLE_ANALYTICS_INSIGHTS}
              className={cn(sideCards && "xl:col-span-3")}
            />
          )}
          {FEATURES.auditLog && (
            <RecentEventsCard events={SAMPLE_ANALYTICS_EVENTS} now={SAMPLE_ANALYTICS_NOW} />
          )}
        </div>
      )}
    </>
  );
}
