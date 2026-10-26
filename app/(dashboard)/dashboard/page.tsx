import { cn } from "cn";
import type { Metadata } from "next";

import { AiPerformanceCard } from "@/components/dashboard/ai-performance-card";
import { DashboardExportButton } from "@/components/dashboard/dashboard-export-button";
import { LiveActivityCard } from "@/components/dashboard/live-activity-card";
import { MatchEngagementCard } from "@/components/dashboard/match-engagement-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { MonthlyRevenueCard } from "@/components/dashboard/monthly-revenue-card";
import { QuickActionsFab } from "@/components/dashboard/quick-actions-fab";
import { RecentUsersTable } from "@/components/dashboard/recent-users-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrustSafetyCard } from "@/components/dashboard/trust-safety-card";
import { UserGrowthCard } from "@/components/dashboard/user-growth-card";
import { PageHeader } from "@/components/layout/page-header";
import { DateRangeSelect } from "@/components/layout/page-header-actions";
import { enabled, FEATURES } from "@/constants/features";
import {
  SAMPLE_AI_PERFORMANCE,
  SAMPLE_AUDIENCE_SIZES,
  SAMPLE_KPIS,
  SAMPLE_LIVE_ACTIVITY,
  SAMPLE_MATCH_ENGAGEMENT,
  SAMPLE_METRICS,
  SAMPLE_RECENT_USERS,
  SAMPLE_REVENUE,
  SAMPLE_TOTAL_USERS,
  SAMPLE_TRUST_SAFETY,
  SAMPLE_USER_GROWTH,
  SAMPLE_VERIFICATION_REQUEST,
} from "@/constants/dashboard-sample";

export const metadata: Metadata = { title: "Dashboard" };

// A row of four, or of three while one card's feature is off. Three sit three
// across from lg, and below that the third fills the two-column row.
const rowColumns = (count: number) => (count === 4 ? "xl:grid-cols-4" : "lg:grid-cols-3");
const fillOddRow = "sm:max-lg:last:odd:col-span-2";

// UI only: every section renders the Figma's sample figures. The
// /admin/dashboard/* hooks in hooks/api/use-dashboard.ts replace them later.
export default function DashboardPage() {
  const kpis = enabled(SAMPLE_KPIS);
  const metrics = enabled(SAMPLE_METRICS);
  // Plan upgrades need subscription data, which the backend doesn't have yet.
  const liveActivity = SAMPLE_LIVE_ACTIVITY.filter(
    (item) => FEATURES.subscriptions || item.kind !== "upgrade",
  );

  return (
    <>
      <PageHeader
        title="Dashboard Overview"
        description="Monitor platform performance, user engagement, trust, AI activity, and business growth in real time."
      >
        <DateRangeSelect />
        <DashboardExportButton />
      </PageHeader>
      <section
        aria-label="Key metrics"
        className={cn("grid gap-6 sm:grid-cols-2", rowColumns(kpis.length))}
      >
        {kpis.map((stat) => (
          <StatCard key={stat.id} stat={stat} className={fillOddRow} />
        ))}
      </section>
      <section
        aria-label="Operations"
        className={cn("grid gap-6 sm:grid-cols-2", rowColumns(metrics.length))}
      >
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} className={fillOddRow} />
        ))}
      </section>
      <div className="grid gap-6 xl:grid-cols-3">
        <UserGrowthCard data={SAMPLE_USER_GROWTH} className="xl:col-span-2" />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-1 xl:content-start">
          <AiPerformanceCard data={SAMPLE_AI_PERFORMANCE} />
          <TrustSafetyCard data={SAMPLE_TRUST_SAFETY} />
        </div>
      </div>
      <div
        className={cn(
          "grid items-start gap-6 md:grid-cols-2",
          FEATURES.payments && "xl:grid-cols-3",
        )}
      >
        {FEATURES.payments && <MonthlyRevenueCard lines={SAMPLE_REVENUE} />}
        <MatchEngagementCard data={SAMPLE_MATCH_ENGAGEMENT} />
        <LiveActivityCard items={liveActivity} />
      </div>
      <RecentUsersTable users={SAMPLE_RECENT_USERS} totalUsers={SAMPLE_TOTAL_USERS} />
      <QuickActionsFab
        verificationRequest={SAMPLE_VERIFICATION_REQUEST}
        audienceSizes={SAMPLE_AUDIENCE_SIZES}
      />
    </>
  );
}
