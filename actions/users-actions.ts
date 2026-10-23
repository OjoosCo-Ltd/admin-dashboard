import { apiClient } from "@/libs/api/client";
import { ENDPOINTS } from "@/libs/api/endpoints";
import { toPage, unwrap } from "@/libs/api/normalize";
import type {
  AdminCreateAdminDto,
  AdminDeleteUserDto,
  AdminSuspendUserDto,
  AdminUpdateRoleDto,
  ListUsersQuery,
} from "@/types/api-dtos";

// ⚠️ PROVISIONAL: responses stay `unknown` until each route is typed from a live sample.

export const listUsersAction = (query: ListUsersQuery = {}) =>
  apiClient
    .get<unknown>(ENDPOINTS.users.list, { params: { ...query } })
    .then((body) => toPage<unknown>(body, query));

export const listAdminsAction = () =>
  apiClient.get<unknown>(ENDPOINTS.users.admins).then((body) => toPage<unknown>(body));

export const getUserAction = (userId: string) =>
  apiClient.get<unknown>(ENDPOINTS.users.detail(userId)).then(unwrap<unknown>);

export const getUserActivityAction = (userId: string) =>
  apiClient.get<unknown>(ENDPOINTS.users.activity(userId)).then(unwrap<unknown>);

export const createAdminAction = (body: AdminCreateAdminDto) =>
  apiClient.post<unknown>(ENDPOINTS.users.createAdmin, body).then(unwrap<unknown>);

export const updateUserRoleAction = (userId: string, body: AdminUpdateRoleDto) =>
  apiClient.patch<unknown>(ENDPOINTS.users.role(userId), body);

export const suspendUserAction = (userId: string, body: AdminSuspendUserDto) =>
  apiClient.post<unknown>(ENDPOINTS.users.suspend(userId), body);

export const unsuspendUserAction = (userId: string) =>
  apiClient.post<unknown>(ENDPOINTS.users.unsuspend(userId));

/** Permanent. The body must carry `confirm: true`. */
export const deleteUserAction = (userId: string, body: AdminDeleteUserDto) =>
  apiClient.delete<unknown>(ENDPOINTS.users.detail(userId), body);
