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

// UI only: every section renders the Figma's sample figures. The
// /admin/dashboard/* hooks in hooks/api/use-dashboard.ts replace them later.
export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard Overview"
        description="Monitor platform performance, user engagement, trust, AI activity, and business growth in real time."
      >
        <DateRangeSelect />
        <DashboardExportButton />
      </PageHeader>
      <section aria-label="Key metrics" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {SAMPLE_KPIS.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </section>
      <section aria-label="Operations" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {SAMPLE_METRICS.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </section>
      <div className="grid gap-6 xl:grid-cols-3">
        <UserGrowthCard data={SAMPLE_USER_GROWTH} className="xl:col-span-2" />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-1 xl:content-start">
          <AiPerformanceCard data={SAMPLE_AI_PERFORMANCE} />
          <TrustSafetyCard data={SAMPLE_TRUST_SAFETY} />
        </div>
      </div>
      <div className="grid items-start gap-6 md:grid-cols-2 xl:grid-cols-3">
        <MonthlyRevenueCard lines={SAMPLE_REVENUE} />
        <MatchEngagementCard data={SAMPLE_MATCH_ENGAGEMENT} />
        <LiveActivityCard items={SAMPLE_LIVE_ACTIVITY} />
      </div>
      <RecentUsersTable users={SAMPLE_RECENT_USERS} totalUsers={SAMPLE_TOTAL_USERS} />
      <QuickActionsFab
        verificationRequest={SAMPLE_VERIFICATION_REQUEST}
        audienceSizes={SAMPLE_AUDIENCE_SIZES}
      />
    </>
  );
}
