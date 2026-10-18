import type { Metadata } from "next";
import { Suspense } from "react";

import { CommunityKpiRow } from "@/components/community/community-kpi-row";
import { GroupEyebrowHeader, GroupTabs } from "@/components/community/group-header";
import { ReportQueue, ReportQueueFallback } from "@/components/community/report-queue";
import {
  SAMPLE_REPORT_KPIS,
  SAMPLE_REPORT_TOTAL,
  SAMPLE_REPORTS,
} from "@/constants/community-sample";

import { sampleGroup, sampleGroupParams } from "../sample-group";

export const generateStaticParams = sampleGroupParams;

export async function generateMetadata({
  params,
}: PageProps<"/community/groups/[groupId]/reports">): Promise<Metadata> {
  const group = await sampleGroup(params);
  return { title: `${group.name} reports` };
}

export default async function GroupReportsPage({
  params,
}: PageProps<"/community/groups/[groupId]/reports">) {
  const group = await sampleGroup(params);
  return (
    <>
      <GroupEyebrowHeader group={group} title="Community Moderation Queue" />
      <GroupTabs groupId={group.id} />
      <CommunityKpiRow kpis={SAMPLE_REPORT_KPIS} tiles={["chat", "target", "calendar"]} />
      {/* The queue keeps its search and page in the URL. */}
      <Suspense
        fallback={<ReportQueueFallback reports={SAMPLE_REPORTS} total={SAMPLE_REPORT_TOTAL} />}
      >
        <ReportQueue reports={SAMPLE_REPORTS} total={SAMPLE_REPORT_TOTAL} />
      </Suspense>
    </>
  );
}
