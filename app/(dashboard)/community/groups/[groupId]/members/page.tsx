import type { Metadata } from "next";
import { Suspense } from "react";

import { CommunityKpiRow } from "@/components/community/community-kpi-row";
import { GroupHeader, GroupTabs } from "@/components/community/group-header";
import { MemberTable, MemberTableFallback } from "@/components/community/member-table";
import {
  SAMPLE_MEMBER_KPIS,
  SAMPLE_MEMBER_TOTAL,
  SAMPLE_MEMBERS,
} from "@/constants/community-sample";

import { sampleGroup, sampleGroupParams } from "../sample-group";

export const generateStaticParams = sampleGroupParams;

export async function generateMetadata({
  params,
}: PageProps<"/community/groups/[groupId]/members">): Promise<Metadata> {
  const group = await sampleGroup(params);
  return { title: `${group.name} members` };
}

export default async function GroupMembersPage({
  params,
}: PageProps<"/community/groups/[groupId]/members">) {
  const group = await sampleGroup(params);
  return (
    <>
      <GroupHeader group={group} />
      <GroupTabs groupId={group.id} />
      <CommunityKpiRow kpis={SAMPLE_MEMBER_KPIS} tiles={["chat", "target", "calendar"]} />
      {/* The table keeps its filters and page in the URL. */}
      <Suspense
        fallback={<MemberTableFallback members={SAMPLE_MEMBERS} total={SAMPLE_MEMBER_TOTAL} />}
      >
        <MemberTable members={SAMPLE_MEMBERS} total={SAMPLE_MEMBER_TOTAL} />
      </Suspense>
    </>
  );
}
