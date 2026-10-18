import type { Metadata } from "next";

import { CommunityKpiRow } from "@/components/community/community-kpi-row";
import { GroupActivityCard } from "@/components/community/group-activity-card";
import { GroupHeader, GroupTabs } from "@/components/community/group-header";
import { MemberGrowthCard } from "@/components/community/member-growth-card";
import {
  SAMPLE_GROUP_ACTIVITY,
  SAMPLE_GROUP_OVERVIEW_KPIS,
  SAMPLE_MEMBER_GROWTH,
} from "@/constants/community-sample";

import { sampleGroup, sampleGroupParams } from "./sample-group";

export const generateStaticParams = sampleGroupParams;

export async function generateMetadata({
  params,
}: PageProps<"/community/groups/[groupId]">): Promise<Metadata> {
  const group = await sampleGroup(params);
  return { title: group.name };
}

// UI only: every group shows Book Lovers' sample figures.
export default async function GroupOverviewPage({
  params,
}: PageProps<"/community/groups/[groupId]">) {
  const group = await sampleGroup(params);
  return (
    <>
      <GroupHeader group={group} />
      <GroupTabs groupId={group.id} />
      <CommunityKpiRow
        kpis={SAMPLE_GROUP_OVERVIEW_KPIS}
        tiles={["chat", "target", "calendar", "thumbs"]}
      />
      <div className="grid gap-6 xl:grid-cols-12">
        <MemberGrowthCard data={SAMPLE_MEMBER_GROWTH} className="min-h-100 xl:col-span-8" />
        <GroupActivityCard activity={SAMPLE_GROUP_ACTIVITY} className="xl:col-span-4" />
      </div>
    </>
  );
}
