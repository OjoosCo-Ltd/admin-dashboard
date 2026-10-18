import { notFound } from "next/navigation";

import { SAMPLE_GROUPS } from "@/constants/community-sample";

/** The sample group a dashboard page shows, or a 404. UI only until /admin/community/groups/{id} can be read. */
export async function sampleGroup(params: Promise<{ groupId: string }>) {
  const { groupId } = await params;
  const group = SAMPLE_GROUPS.find((candidate) => candidate.id === groupId);
  if (!group) notFound();
  return group;
}

/** Prerenders each sample group's dashboard. */
export function sampleGroupParams() {
  return SAMPLE_GROUPS.map((group) => ({ groupId: group.id }));
}
