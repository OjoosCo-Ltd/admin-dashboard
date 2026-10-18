import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { CreateResourceLink } from "@/components/well-being/wellbeing-actions";
import { EngagementChartCard } from "@/components/well-being/engagement-chart-card";
import {
  TopResourcesCard,
  WellbeingActivityCard,
  WellbeingInsightCard,
  WellbeingKpiGrid,
} from "@/components/well-being/wellbeing-overview";
import { WellbeingTabs } from "@/components/well-being/wellbeing-tabs";
import {
  SAMPLE_ENGAGEMENT,
  SAMPLE_TOP_RESOURCES,
  SAMPLE_WELLBEING_ACTIVITY,
  SAMPLE_WELLBEING_INSIGHT,
  SAMPLE_WELLBEING_KPIS,
} from "@/constants/well-being-sample";

export const metadata: Metadata = { title: "Well-being" };

// UI only: every section renders the Figma's sample figures; the backend has
// no well-being routes yet.
export default function WellbeingOverviewPage() {
  return (
    <>
      <PageHeader
        title="Well-being"
        description="Manage well-being resources, assessments, and dating support content while monitoring how members engage with these tools."
        descriptionClassName="max-w-138"
      >
        <CreateResourceLink />
      </PageHeader>
      <WellbeingTabs />
      <WellbeingKpiGrid kpis={SAMPLE_WELLBEING_KPIS} />
      <div className="grid items-start gap-6 xl:grid-cols-3">
        <EngagementChartCard data={SAMPLE_ENGAGEMENT} className="xl:col-span-2" />
        <WellbeingInsightCard insight={SAMPLE_WELLBEING_INSIGHT} />
      </div>
      <div className="grid items-stretch gap-6 xl:grid-cols-3">
        <TopResourcesCard resources={SAMPLE_TOP_RESOURCES} className="xl:col-span-2" />
        <WellbeingActivityCard items={SAMPLE_WELLBEING_ACTIVITY} />
      </div>
    </>
  );
}
