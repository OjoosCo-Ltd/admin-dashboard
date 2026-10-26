import type { Metadata } from "next";
import { cn } from "cn";
import { Suspense } from "react";

import { CommunityActivityCard } from "@/components/community/community-activity-card";
import { CommunityGrowthCard } from "@/components/community/community-growth-card";
import { CommunityKpiRow } from "@/components/community/community-kpi-row";
import { GroupTable, GroupTableFallback } from "@/components/community/group-table";
import { SmartInsightCard } from "@/components/community/smart-insight-card";
import {
  SAMPLE_COMMUNITY_ACTIVITY,
  SAMPLE_COMMUNITY_GROWTH,
  SAMPLE_COMMUNITY_INSIGHT,
  SAMPLE_COMMUNITY_KPIS,
  SAMPLE_GROUP_TOTAL,
  SAMPLE_GROUPS,
} from "@/constants/community-sample";
import { FEATURES } from "@/constants/features";

export const metadata: Metadata = { title: "Community" };

// UI only: every section renders the Figma's sample figures until
// /admin/community/* (libs/api/endpoints.ts) is typed and wired.
export default function CommunityGroupsPage() {
  return (
    <>
      <CommunityKpiRow kpis={SAMPLE_COMMUNITY_KPIS} />
      {/* The table keeps its filters and page in the URL. */}
      <Suspense fallback={<GroupTableFallback groups={SAMPLE_GROUPS} total={SAMPLE_GROUP_TOTAL} />}>
        <GroupTable groups={SAMPLE_GROUPS} total={SAMPLE_GROUP_TOTAL} />
      </Suspense>
      {/* Without Recent Activity, the insight stands alone and matches the chart's height. */}
      <div className={cn("grid gap-6 xl:grid-cols-12", FEATURES.auditLog && "xl:items-start")}>
        <CommunityGrowthCard data={SAMPLE_COMMUNITY_GROWTH} className="xl:col-span-8" />
        <div
          className={cn(
            "grid gap-6 xl:col-span-4",
            FEATURES.auditLog && "md:grid-cols-2 md:items-start xl:grid-cols-1",
          )}
        >
          <SmartInsightCard insight={SAMPLE_COMMUNITY_INSIGHT} />
          {FEATURES.auditLog && <CommunityActivityCard activity={SAMPLE_COMMUNITY_ACTIVITY} />}
        </div>
      </div>
    </>
  );
}
