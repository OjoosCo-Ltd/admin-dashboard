import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { DateRangeSelect, ExportReportButton } from "@/components/layout/page-header-actions";
import { ReportDistributionCard } from "@/components/reports/report-distribution-card";
import { ReportKpiRow } from "@/components/reports/report-kpi-row";
import { ReportQueue, ReportQueueFallback } from "@/components/reports/report-queue";
import { SafetyOverview } from "@/components/reports/safety-overview";
import { SafetyTrendsCard } from "@/components/reports/safety-trends-card";
import {
  SAMPLE_ACTIVE_MODS,
  SAMPLE_MODERATORS,
  SAMPLE_REPORT_DISTRIBUTION,
  SAMPLE_REPORT_KPIS,
  SAMPLE_REPORT_TOTAL,
  SAMPLE_REPORTS,
  SAMPLE_RESOLUTION_SOURCES,
  SAMPLE_SAFETY_INSIGHTS,
  SAMPLE_SAFETY_INTELLIGENCE,
  SAMPLE_SAFETY_TRENDS,
} from "@/constants/reports-sample";

export const metadata: Metadata = { title: "Reports & Safety" };

// UI only: the Figma's sample figures and reports. The backend's chat and
// community report routes aren't typed or wired yet.
export default function ReportsPage() {
  const queue = { reports: SAMPLE_REPORTS, totalCount: SAMPLE_REPORT_TOTAL };
  return (
    <>
      <PageHeader
        title="Reports & Safety"
        description="Review reports, investigate suspicious behavior, protect users, and enforce community standards across the Xparience platform."
        descriptionClassName="xl:w-168"
      >
        <DateRangeSelect />
        <ExportReportButton />
      </PageHeader>
      <ReportKpiRow kpis={SAMPLE_REPORT_KPIS} />
      <div className="grid items-stretch gap-6 xl:grid-cols-[minmax(0,1fr)_21.75rem]">
        <SafetyTrendsCard data={SAMPLE_SAFETY_TRENDS} />
        <ReportDistributionCard data={SAMPLE_REPORT_DISTRIBUTION} />
      </div>
      <Suspense fallback={<ReportQueueFallback {...queue} />}>
        <ReportQueue {...queue} />
      </Suspense>
      <SafetyOverview
        intelligence={SAMPLE_SAFETY_INTELLIGENCE}
        sources={SAMPLE_RESOLUTION_SOURCES}
        insights={SAMPLE_SAFETY_INSIGHTS}
        moderators={SAMPLE_MODERATORS}
        activeMods={SAMPLE_ACTIVE_MODS}
      />
    </>
  );
}
