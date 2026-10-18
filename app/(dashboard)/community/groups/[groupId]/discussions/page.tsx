import type { Metadata } from "next";
import { Suspense } from "react";

import { DiscussionBoard, DiscussionBoardFallback } from "@/components/community/discussion-board";
import { GroupEyebrowHeader, GroupTabs } from "@/components/community/group-header";
import { TopDiscussionsCard } from "@/components/community/top-discussions-card";
import {
  SAMPLE_DISCUSSION_TOTAL,
  SAMPLE_DISCUSSIONS,
  SAMPLE_REPORTED_DISCUSSIONS,
  SAMPLE_TOP_DISCUSSIONS,
} from "@/constants/community-sample";

import { sampleGroup, sampleGroupParams } from "../sample-group";

export const generateStaticParams = sampleGroupParams;

export async function generateMetadata({
  params,
}: PageProps<"/community/groups/[groupId]/discussions">): Promise<Metadata> {
  const group = await sampleGroup(params);
  return { title: `${group.name} discussions` };
}

export default async function GroupDiscussionsPage({
  params,
}: PageProps<"/community/groups/[groupId]/discussions">) {
  const group = await sampleGroup(params);
  const board = {
    discussions: SAMPLE_DISCUSSIONS,
    total: SAMPLE_DISCUSSION_TOTAL,
    reportedCount: SAMPLE_REPORTED_DISCUSSIONS,
  };
  return (
    <>
      <GroupEyebrowHeader group={group} title="Discussion Forum Management" />
      <GroupTabs groupId={group.id} />
      <div className="grid gap-6 xl:grid-cols-12">
        {/* The board keeps its search, view and page in the URL. */}
        <div className="min-w-0 xl:col-span-9">
          <Suspense fallback={<DiscussionBoardFallback {...board} />}>
            <DiscussionBoard {...board} />
          </Suspense>
        </div>
        <TopDiscussionsCard discussions={SAMPLE_TOP_DISCUSSIONS} className="xl:col-span-3" />
      </div>
    </>
  );
}
