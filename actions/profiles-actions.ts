import { apiClient } from "@/libs/api/client";
import { ENDPOINTS } from "@/libs/api/endpoints";
import { toPage, unwrap } from "@/libs/api/normalize";
import type {
  AdminChangeProfileStatusDto,
  AdminUpdateProfileDto,
  ListProfilesQuery,
} from "@/types/api-dtos";

// ⚠️ PROVISIONAL: responses stay `unknown` until each route is typed from a live sample.

export const listProfilesAction = (query: ListProfilesQuery = {}) =>
  apiClient
    .get<unknown>(ENDPOINTS.profiles.list, { params: { ...query } })
    .then((body) => toPage<unknown>(body, query));

export const getProfileAction = (userId: string) =>
  apiClient.get<unknown>(ENDPOINTS.profiles.detail(userId)).then(unwrap<unknown>);

/** Only the DTO's fields: anything else is a 400. */
export const updateProfileAction = (userId: string, body: AdminUpdateProfileDto) =>
  apiClient.patch<unknown>(ENDPOINTS.profiles.detail(userId), body);

export const changeProfileStatusAction = (userId: string, body: AdminChangeProfileStatusDto) =>
  apiClient.patch<unknown>(ENDPOINTS.profiles.status(userId), body);

/** Sends the member back to onboarding step 1. */
export const reOnboardUserAction = (userId: string) =>
  apiClient.post<unknown>(ENDPOINTS.profiles.reOnboard(userId));

export const deleteProfileImageAction = (userId: string, imageId: string) =>
  apiClient.delete<unknown>(ENDPOINTS.profiles.image(userId, imageId));
