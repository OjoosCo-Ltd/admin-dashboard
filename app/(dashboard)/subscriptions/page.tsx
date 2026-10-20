import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { DateRangeSelect, ExportReportButton } from "@/components/layout/page-header-actions";
import { ChurnCard } from "@/components/subscriptions/churn-card";
import {
  MembershipPlans,
  MembershipPlansFallback,
} from "@/components/subscriptions/membership-plans";
import { PlanDistributionCard } from "@/components/subscriptions/plan-distribution-card";
import { PlanMovementCard } from "@/components/subscriptions/plan-movement-card";
import {
  RecentSubscriptions,
  RecentSubscriptionsFallback,
} from "@/components/subscriptions/recent-subscriptions";
import { SubscriberGrowthCard } from "@/components/subscriptions/subscriber-growth-card";
import { SubscriptionKpiRow } from "@/components/subscriptions/subscription-kpi-row";
import { SubscriptionRevenueCard } from "@/components/subscriptions/subscription-revenue-card";
import {
  SAMPLE_CHURN,
  SAMPLE_PLAN_MOVES,
  SAMPLE_PLAN_REVENUE,
  SAMPLE_PLANS,
  SAMPLE_SUBSCRIBER_GROWTH,
  SAMPLE_SUBSCRIPTION_KPIS,
  SAMPLE_SUBSCRIPTIONS,
} from "@/constants/subscriptions-sample";

export const metadata: Metadata = { title: "Subscriptions" };

// UI only: every section renders the Figma's sample figures. The backend has
// no subscription, plan or payment routes yet.
export default function SubscriptionsPage() {
  return (
    <>
      <PageHeader
        title="Subscriptions"
        description="Manage membership plans, monitor subscriber growth, and track recurring subscription revenue across Xparience."
        descriptionClassName="max-w-160"
      >
        <DateRangeSelect />
        <ExportReportButton />
      </PageHeader>
      <SubscriptionKpiRow kpis={SAMPLE_SUBSCRIPTION_KPIS} />
      {/* The open plan sheet (?plan=) and subscription sheet (?subscription=) live in the URL. */}
      <Suspense fallback={<MembershipPlansFallback plans={SAMPLE_PLANS} />}>
        <MembershipPlans plans={SAMPLE_PLANS} />
      </Suspense>
      <div className="grid gap-6 xl:grid-cols-12">
        <SubscriberGrowthCard data={SAMPLE_SUBSCRIBER_GROWTH} className="xl:col-span-8" />
        <PlanDistributionCard plans={SAMPLE_PLANS} className="xl:col-span-4" />
      </div>
      <SubscriptionRevenueCard data={SAMPLE_PLAN_REVENUE} />
      <div className="grid gap-6 lg:grid-cols-2">
        <PlanMovementCard moves={SAMPLE_PLAN_MOVES} />
        <ChurnCard data={SAMPLE_CHURN} />
      </div>
      <Suspense fallback={<RecentSubscriptionsFallback subscriptions={SAMPLE_SUBSCRIPTIONS} />}>
        <RecentSubscriptions subscriptions={SAMPLE_SUBSCRIPTIONS} />
      </Suspense>
    </>
  );
}
