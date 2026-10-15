import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { DateRangeSelect, ExportReportButton } from "@/components/layout/page-header-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { ApprovalDistributionCard } from "@/components/verification/approval-distribution-card";
import { FraudSummaryCard } from "@/components/verification/fraud-summary-card";
import { GlobalReachCard } from "@/components/verification/global-reach-card";
import { TopModeratorsCard } from "@/components/verification/top-moderators-card";
import { VerificationKpiRow } from "@/components/verification/verification-kpi-row";
import { VerificationQueue } from "@/components/verification/verification-queue";
import { VerificationTrendsCard } from "@/components/verification/verification-trends-card";
import {
  SAMPLE_APPROVAL_DISTRIBUTION,
  SAMPLE_FRAUD_SIGNALS,
  SAMPLE_QUEUE_TOTAL,
  SAMPLE_TOP_MODERATORS,
  SAMPLE_VERIFICATION_KPIS,
  SAMPLE_VERIFICATION_QUEUE,
  SAMPLE_VERIFICATION_TRENDS,
} from "@/constants/verification-sample";

export const metadata: Metadata = { title: "Verification" };

// UI only: every section renders the Figma's sample figures until the
// verification endpoints (libs/api/endpoints.ts) are typed and wired.
export default function VerificationPage() {
  return (
    <>
      <PageHeader
        title="Identity Verification"
        description="Review submitted identity documents to ensure compliance and security."
      >
        <DateRangeSelect />
        <ExportReportButton />
      </PageHeader>
      <VerificationKpiRow kpis={SAMPLE_VERIFICATION_KPIS} />
      {/* The queue keeps its filter, page and open case in the URL. */}
      <Suspense fallback={<Skeleton className="h-118 rounded-xl" />}>
        <VerificationQueue cases={SAMPLE_VERIFICATION_QUEUE} total={SAMPLE_QUEUE_TOTAL} />
      </Suspense>
      <div className="grid gap-6 xl:grid-cols-3">
        <VerificationTrendsCard data={SAMPLE_VERIFICATION_TRENDS} className="xl:col-span-2" />
        <ApprovalDistributionCard data={SAMPLE_APPROVAL_DISTRIBUTION} />
      </div>
      <div className="grid items-start gap-6 md:grid-cols-2 xl:grid-cols-4">
        <FraudSummaryCard signals={SAMPLE_FRAUD_SIGNALS} className="md:col-span-2" />
        <GlobalReachCard />
        <TopModeratorsCard moderators={SAMPLE_TOP_MODERATORS} />
      </div>
    </>
  );
}
