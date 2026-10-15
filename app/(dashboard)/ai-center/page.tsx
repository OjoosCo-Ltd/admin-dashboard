import type { Metadata } from "next";

import { AiFeatureUsageCard } from "@/components/ai-center/ai-feature-usage-card";
import { AiHealthCard } from "@/components/ai-center/ai-health-card";
import { AiKpiGrid } from "@/components/ai-center/ai-kpi-grid";
import { AiPerformanceCard } from "@/components/ai-center/ai-performance-card";
import { AiServicesCard } from "@/components/ai-center/ai-services-card";
import { SafetyIntelligenceCard } from "@/components/ai-center/safety-intelligence-card";
import { SmartInsightsCard } from "@/components/ai-center/smart-insights-card";
import { PageHeader } from "@/components/layout/page-header";
import { DateRangeSelect, ExportReportButton } from "@/components/layout/page-header-actions";
import {
  SAMPLE_AI_FEATURE_USAGE,
  SAMPLE_AI_HEALTH,
  SAMPLE_AI_INSIGHTS,
  SAMPLE_AI_KPIS,
  SAMPLE_AI_PERFORMANCE,
  SAMPLE_AI_SERVICES,
  SAMPLE_SAFETY_SIGNALS,
} from "@/constants/ai-center-sample";

export const metadata: Metadata = { title: "AI Center" };

// UI only: every section renders the Figma's sample figures; the backend has
// no AI metrics endpoints yet.
export default function AiCenterPage() {
  return (
    <>
      <PageHeader
        title="AI Center"
        description="Monitor conversation health, AI engagement, moderation alerts, and communication trends while protecting user privacy."
        descriptionClassName="max-w-160"
      >
        <DateRangeSelect />
        <ExportReportButton />
      </PageHeader>
      <AiKpiGrid kpis={SAMPLE_AI_KPIS} />
      <div className="grid gap-6 xl:grid-cols-3">
        <AiPerformanceCard data={SAMPLE_AI_PERFORMANCE} className="xl:col-span-2" />
        <AiFeatureUsageCard data={SAMPLE_AI_FEATURE_USAGE} />
      </div>
      <AiHealthCard readings={SAMPLE_AI_HEALTH} />
      <div className="grid gap-6 xl:grid-cols-3">
        <AiServicesCard services={SAMPLE_AI_SERVICES} className="xl:col-span-2" />
        <div className="flex flex-col gap-6">
          <SmartInsightsCard insights={SAMPLE_AI_INSIGHTS} />
          <SafetyIntelligenceCard signals={SAMPLE_SAFETY_SIGNALS} />
        </div>
      </div>
    </>
  );
}
