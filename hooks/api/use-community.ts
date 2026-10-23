import { useQuery } from "@tanstack/react-query";

import {
  banGroupMemberAction,
  createEventAction,
  createGroupAction,
  deleteEventAction,
  deleteGroupAction,
  deletePostAction,
  featurePostAction,
  getCommunityStatsAction,
  getEventAction,
  getGroupAction,
  getPostAction,
  listCommunityReportsAction,
  listEventsAction,
  listEventTicketsAction,
  listGroupEventsAction,
  listGroupsAction,
  listPostReportsAction,
  listPostsAction,
  listRepliesAction,
  manageCommunityReportAction,
  pinPostAction,
  removeGroupMemberAction,
  signCommunityMediaAction,
  unbanGroupMemberAction,
  unfeaturePostAction,
  unpinPostAction,
  updateEventAction,
  updateGroupAction,
} from "@/actions/community-actions";
import { queryKeys } from "@/libs/react-query/query-client";
import type {
  AdminBanUserFromGroupDto,
  AdminCreateGroupDto,
  AdminDeleteGroupDto,
  AdminDeletePostDto,
  AdminManageCommunityReportDto,
  AdminRemoveUserFromGroupDto,
  AdminUpdateGroupDto,
  CreateEventDto,
  EditEventDto,
  GetEventTicketsQuery,
  GetRepliesQuery,
  ListAllEventsQuery,
  ListCommunityPostsQuery,
  ListCommunityReportsQuery,
  ListGroupEventsQuery,
  ListPostReportsQuery,
} from "@/types/api-dtos";

import { useInvalidatingMutation } from "./mutation";

const COMMUNITY = [queryKeys.community.all];

export function useCommunityStats() {
  return useQuery({ queryKey: queryKeys.community.stats(), queryFn: getCommunityStatsAction });
}

export function useGroups() {
  return useQuery({ queryKey: queryKeys.community.groups(), queryFn: listGroupsAction });
}

export function useGroup(groupId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.community.group(groupId ?? ""),
    queryFn: () => getGroupAction(groupId!),
    enabled: Boolean(groupId),
  });
}

export function useCommunityPosts(query: ListCommunityPostsQuery = {}) {
  return useQuery({
    queryKey: queryKeys.community.posts(query),
    queryFn: () => listPostsAction(query),
  });
}

export function useCommunityPost(postId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.community.post(postId ?? ""),
    queryFn: () => getPostAction(postId!),
    enabled: Boolean(postId),
  });
}

export function usePostReplies(postId: string | undefined, query: GetRepliesQuery = {}) {
  return useQuery({
    queryKey: queryKeys.community.replies(postId ?? "", query),
    queryFn: () => listRepliesAction(postId!, query),
    enabled: Boolean(postId),
  });
}

export function useCommunityReports(query: ListCommunityReportsQuery = {}) {
  return useQuery({
    queryKey: queryKeys.community.reports(query),
    queryFn: () => listCommunityReportsAction(query),
  });
}

export function usePostReports(query: ListPostReportsQuery) {
  return useQuery({
    queryKey: queryKeys.community.postReports(query),
    queryFn: () => listPostReportsAction(query),
  });
}

export function useEvents(query: ListAllEventsQuery = {}) {
  return useQuery({
    queryKey: queryKeys.community.events(query),
    queryFn: () => listEventsAction(query),
  });
}

export function useGroupEvents(groupId: string | undefined, query: ListGroupEventsQuery = {}) {
  return useQuery({
    queryKey: queryKeys.community.groupEvents(groupId ?? "", query),
    queryFn: () => listGroupEventsAction(groupId!, query),
    enabled: Boolean(groupId),
  });
}

export function useEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.community.event(eventId ?? ""),
    queryFn: () => getEventAction(eventId!),
    enabled: Boolean(eventId),
  });
}

export function useEventTickets(eventId: string | undefined, query: GetEventTicketsQuery) {
  return useQuery({
    queryKey: queryKeys.community.tickets(eventId ?? "", query),
    queryFn: () => listEventTicketsAction(eventId!, query),
    enabled: Boolean(eventId),
  });
}

/** Signed URLs for post images, keyed by path. */
export function useCommunityMedia(paths: string[]) {
  return useQuery({
    queryKey: queryKeys.community.media(paths),
    queryFn: () => signCommunityMediaAction(paths),
    enabled: paths.length > 0,
  });
}

export function useCreateGroup() {
  return useInvalidatingMutation((body: AdminCreateGroupDto) => createGroupAction(body), COMMUNITY);
}

export function useUpdateGroup() {
  return useInvalidatingMutation(
    ({ groupId, ...body }: { groupId: string } & AdminUpdateGroupDto) =>
      updateGroupAction(groupId, body),
    COMMUNITY,
  );
}

export function useDeleteGroup() {
  return useInvalidatingMutation(
    ({ groupId, ...body }: { groupId: string } & AdminDeleteGroupDto) =>
      deleteGroupAction(groupId, body),
    COMMUNITY,
  );
}

export function useRemoveGroupMember() {
  return useInvalidatingMutation(
    ({
      groupId,
      userId,
      ...body
    }: { groupId: string; userId: string } & AdminRemoveUserFromGroupDto) =>
      removeGroupMemberAction(groupId, userId, body),
    COMMUNITY,
  );
}

export function useBanGroupMember() {
  return useInvalidatingMutation(
    ({
      groupId,
      userId,
      ...body
    }: { groupId: string; userId: string } & AdminBanUserFromGroupDto) =>
      banGroupMemberAction(groupId, userId, body),
    COMMUNITY,
  );
}

export function useUnbanGroupMember() {
  return useInvalidatingMutation(
    ({ groupId, userId }: { groupId: string; userId: string }) =>
      unbanGroupMemberAction(groupId, userId),
    COMMUNITY,
  );
}

export function useDeletePost() {
  return useInvalidatingMutation(
    ({ postId, ...body }: { postId: string } & AdminDeletePostDto) =>
      deletePostAction(postId, body),
    COMMUNITY,
  );
}

/** Features or unfeatures a post, by `featured`. */
export function useSetPostFeatured() {
  return useInvalidatingMutation(
    ({ postId, featured }: { postId: string; featured: boolean }) =>
      featured ? featurePostAction(postId) : unfeaturePostAction(postId),
    COMMUNITY,
  );
}

/** Pins or unpins a post, by `pinned`. */
export function useSetPostPinned() {
  return useInvalidatingMutation(
    ({ postId, pinned }: { postId: string; pinned: boolean }) =>
      pinned ? pinPostAction(postId) : unpinPostAction(postId),
    COMMUNITY,
  );
}

/** A report outcome can also suspend or ban the author. */
export function useManageCommunityReport() {
  return useInvalidatingMutation(
    ({ reportId, ...body }: { reportId: string } & AdminManageCommunityReportDto) =>
      manageCommunityReportAction(reportId, body),
    [queryKeys.community.all, queryKeys.users.all],
  );
}

export function useCreateEvent() {
  return useInvalidatingMutation(
    ({ groupId, ...body }: { groupId: string } & CreateEventDto) =>
      createEventAction(groupId, body),
    COMMUNITY,
  );
}

export function useUpdateEvent() {
  return useInvalidatingMutation(
    ({ eventId, ...body }: { eventId: string } & EditEventDto) => updateEventAction(eventId, body),
    COMMUNITY,
  );
}

export function useDeleteEvent() {
  return useInvalidatingMutation((eventId: string) => deleteEventAction(eventId), COMMUNITY);
}
