import type { Metadata } from "next";
import { Suspense } from "react";

import { CommunityKpiRow } from "@/components/community/community-kpi-row";
import { ModerationQueue, ModerationQueueFallback } from "@/components/community/moderation-queue";
import {
  SAMPLE_MODERATION_CASES,
  SAMPLE_MODERATION_KPIS,
  SAMPLE_MODERATION_TOTAL,
} from "@/constants/community-sample";

export const metadata: Metadata = { title: "Community Moderation" };

// UI only: the queue renders the Figma's sample cases until GET
// /admin/community/reports (libs/api/endpoints.ts) is typed and wired.
export default function CommunityModerationPage() {
  const queue = { cases: SAMPLE_MODERATION_CASES, total: SAMPLE_MODERATION_TOTAL };
  return (
    <>
      <CommunityKpiRow kpis={SAMPLE_MODERATION_KPIS} />
      {/* The queue keeps its priority filter and page in the URL. */}
      <Suspense fallback={<ModerationQueueFallback {...queue} />}>
        <ModerationQueue {...queue} />
      </Suspense>
    </>
  );
}
