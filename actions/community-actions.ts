import { apiClient } from "@/libs/api/client";
import { ENDPOINTS } from "@/libs/api/endpoints";
import { toPage, unwrap } from "@/libs/api/normalize";
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

// ⚠️ PROVISIONAL: responses stay `unknown` until each route is typed from a live sample.

export const getCommunityStatsAction = () =>
  apiClient.get<unknown>(ENDPOINTS.community.stats).then(unwrap<unknown>);

// Groups. There's no admin GET for groups, so reads use the member routes.

export const listGroupsAction = () =>
  apiClient.get<unknown>(ENDPOINTS.community.memberGroups).then((body) => toPage<unknown>(body));

export const getGroupAction = (groupId: string) =>
  apiClient.get<unknown>(ENDPOINTS.community.memberGroup(groupId)).then(unwrap<unknown>);

export const createGroupAction = (body: AdminCreateGroupDto) =>
  apiClient.post<unknown>(ENDPOINTS.community.groups, body).then(unwrap<unknown>);

export const updateGroupAction = (groupId: string, body: AdminUpdateGroupDto) =>
  apiClient.patch<unknown>(ENDPOINTS.community.group(groupId), body);

/** Deletes the group: there's no archive or restore route. */
export const deleteGroupAction = (groupId: string, body: AdminDeleteGroupDto) =>
  apiClient.delete<unknown>(ENDPOINTS.community.group(groupId), body);

export const removeGroupMemberAction = (
  groupId: string,
  userId: string,
  body: AdminRemoveUserFromGroupDto,
) => apiClient.post<unknown>(ENDPOINTS.community.removeUser(groupId, userId), body);

export const banGroupMemberAction = (
  groupId: string,
  userId: string,
  body: AdminBanUserFromGroupDto = {},
) => apiClient.post<unknown>(ENDPOINTS.community.banUser(groupId, userId), body);

export const unbanGroupMemberAction = (groupId: string, userId: string) =>
  apiClient.post<unknown>(ENDPOINTS.community.unbanUser(groupId, userId));

// Posts

export const listPostsAction = (query: ListCommunityPostsQuery = {}) =>
  apiClient
    .get<unknown>(ENDPOINTS.community.posts, { params: { ...query } })
    .then((body) => toPage<unknown>(body, query));

export const getPostAction = (postId: string) =>
  apiClient.get<unknown>(ENDPOINTS.community.memberPost(postId)).then(unwrap<unknown>);

export const listRepliesAction = (postId: string, query: GetRepliesQuery = {}) =>
  apiClient
    .get<unknown>(ENDPOINTS.community.postReplies(postId), { params: { ...query } })
    .then(unwrap<unknown>);

export const deletePostAction = (postId: string, body: AdminDeletePostDto) =>
  apiClient.delete<unknown>(ENDPOINTS.community.post(postId), body);

export const featurePostAction = (postId: string) =>
  apiClient.post<unknown>(ENDPOINTS.community.feature(postId));

export const unfeaturePostAction = (postId: string) =>
  apiClient.delete<unknown>(ENDPOINTS.community.feature(postId));

export const pinPostAction = (postId: string) =>
  apiClient.post<unknown>(ENDPOINTS.community.pin(postId));

export const unpinPostAction = (postId: string) =>
  apiClient.delete<unknown>(ENDPOINTS.community.pin(postId));

// Reports

export const listCommunityReportsAction = (query: ListCommunityReportsQuery = {}) =>
  apiClient
    .get<unknown>(ENDPOINTS.community.reports, { params: { ...query } })
    .then((body) => toPage<unknown>(body, query));

/** The admin/moderator post-report feed, cursor-paged. */
export const listPostReportsAction = (query: ListPostReportsQuery) =>
  apiClient
    .get<unknown>(ENDPOINTS.community.postReports, { params: { ...query } })
    .then(unwrap<unknown>);

export const manageCommunityReportAction = (
  reportId: string,
  body: AdminManageCommunityReportDto,
) => apiClient.patch<unknown>(ENDPOINTS.community.report(reportId), body);

// Events. Member routes: the writes are admin only, and there's no admin list.

/** Cursor-paged, with no total. */
export const listEventsAction = (query: ListAllEventsQuery = {}) =>
  apiClient
    .get<unknown>(ENDPOINTS.community.events, { params: { ...query } })
    .then(unwrap<unknown>);

export const listGroupEventsAction = (groupId: string, query: ListGroupEventsQuery = {}) =>
  apiClient
    .get<unknown>(ENDPOINTS.community.groupEvents(groupId), { params: { ...query } })
    .then(unwrap<unknown>);

export const getEventAction = (eventId: string) =>
  apiClient.get<unknown>(ENDPOINTS.community.event(eventId)).then(unwrap<unknown>);

export const listEventTicketsAction = (eventId: string, query: GetEventTicketsQuery) =>
  apiClient
    .get<unknown>(ENDPOINTS.community.eventTickets(eventId), { params: { ...query } })
    .then(unwrap<unknown>);

/** `meetingUrl` for VIRTUAL events, `locationName` for PHYSICAL ones. */
export const createEventAction = (groupId: string, body: CreateEventDto) =>
  apiClient.post<unknown>(ENDPOINTS.community.groupEvents(groupId), body).then(unwrap<unknown>);

/** Send the whole event: a field left out may be cleared. Cancel with `isCancelled`. */
export const updateEventAction = (eventId: string, body: EditEventDto) =>
  apiClient.patch<unknown>(ENDPOINTS.community.event(eventId), body);

export const deleteEventAction = (eventId: string) =>
  apiClient.delete<unknown>(ENDPOINTS.community.event(eventId));

/** Path → signed URL, for post images. */
export const signCommunityMediaAction = (paths: string[]) =>
  apiClient
    .post<unknown>(ENDPOINTS.community.signMedia, { paths })
    .then(unwrap<Record<string, string>>);
