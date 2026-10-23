import { requireFeature } from "@/libs/feature-gate";

/** No route lists a group's members yet. The route 404s until FEATURES.groupMembers is on. */
export default function GroupMembersLayout({ children }: LayoutProps<"/community/groups/[groupId]/members">) {
  requireFeature("groupMembers");
  return children;
}
