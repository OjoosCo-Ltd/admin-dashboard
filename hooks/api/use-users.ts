import { useQuery } from "@tanstack/react-query";

import {
  changeProfileStatusAction,
  deleteProfileImageAction,
  getProfileAction,
  listProfilesAction,
  reOnboardUserAction,
  updateProfileAction,
} from "@/actions/profiles-actions";
import {
  createAdminAction,
  deleteUserAction,
  getUserAction,
  getUserActivityAction,
  listAdminsAction,
  listUsersAction,
  suspendUserAction,
  unsuspendUserAction,
  updateUserRoleAction,
} from "@/actions/users-actions";
import { queryKeys } from "@/libs/react-query/query-client";
import type {
  AdminChangeProfileStatusDto,
  AdminCreateAdminDto,
  AdminDeleteUserDto,
  AdminSuspendUserDto,
  AdminUpdateProfileDto,
  AdminUpdateRoleDto,
  ListProfilesQuery,
  ListUsersQuery,
} from "@/types/api-dtos";

import { useInvalidatingMutation } from "./mutation";

// A user's account and profile show on the same screens, so a change to either refetches both.
const PEOPLE = [queryKeys.users.all, queryKeys.profiles.all];

export function useUsers(query: ListUsersQuery = {}) {
  return useQuery({ queryKey: queryKeys.users.list(query), queryFn: () => listUsersAction(query) });
}

export function useAdmins() {
  return useQuery({ queryKey: queryKeys.users.admins(), queryFn: listAdminsAction });
}

export function useUser(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId ?? ""),
    queryFn: () => getUserAction(userId!),
    enabled: Boolean(userId),
  });
}

export function useUserActivity(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.users.activity(userId ?? ""),
    queryFn: () => getUserActivityAction(userId!),
    enabled: Boolean(userId),
  });
}

export function useProfiles(query: ListProfilesQuery = {}) {
  return useQuery({
    queryKey: queryKeys.profiles.list(query),
    queryFn: () => listProfilesAction(query),
  });
}

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.profiles.detail(userId ?? ""),
    queryFn: () => getProfileAction(userId!),
    enabled: Boolean(userId),
  });
}

export function useCreateAdmin() {
  return useInvalidatingMutation((body: AdminCreateAdminDto) => createAdminAction(body), PEOPLE);
}

export function useUpdateUserRole() {
  return useInvalidatingMutation(
    ({ userId, ...body }: { userId: string } & AdminUpdateRoleDto) =>
      updateUserRoleAction(userId, body),
    PEOPLE,
  );
}

export function useSuspendUser() {
  return useInvalidatingMutation(
    ({ userId, ...body }: { userId: string } & AdminSuspendUserDto) =>
      suspendUserAction(userId, body),
    PEOPLE,
  );
}

export function useUnsuspendUser() {
  return useInvalidatingMutation((userId: string) => unsuspendUserAction(userId), PEOPLE);
}

export function useDeleteUser() {
  return useInvalidatingMutation(
    ({ userId, ...body }: { userId: string } & AdminDeleteUserDto) =>
      deleteUserAction(userId, body),
    PEOPLE,
  );
}

export function useUpdateProfile() {
  return useInvalidatingMutation(
    ({ userId, ...body }: { userId: string } & AdminUpdateProfileDto) =>
      updateProfileAction(userId, body),
    PEOPLE,
  );
}

export function useChangeProfileStatus() {
  return useInvalidatingMutation(
    ({ userId, ...body }: { userId: string } & AdminChangeProfileStatusDto) =>
      changeProfileStatusAction(userId, body),
    PEOPLE,
  );
}

export function useReOnboardUser() {
  return useInvalidatingMutation((userId: string) => reOnboardUserAction(userId), PEOPLE);
}

export function useDeleteProfileImage() {
  return useInvalidatingMutation(
    ({ userId, imageId }: { userId: string; imageId: string }) =>
      deleteProfileImageAction(userId, imageId),
    PEOPLE,
  );
}
