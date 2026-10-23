import { apiClient } from "@/libs/api/client";
import { ENDPOINTS } from "@/libs/api/endpoints";
import { unwrap } from "@/libs/api/normalize";
import type { GetImageQuery } from "@/types/api-dtos";

// ⚠️ PROVISIONAL: responses stay `unknown` until each route is typed from a live sample.

/** Whether the API answers. It documents no body. */
export const getHealthAction = () => apiClient.get<unknown>(ENDPOINTS.system.health);

/** Signs a storage path (`fileName`) into a URL. */
export const getImageUrlAction = (query: GetImageQuery) =>
  apiClient.get<unknown>(ENDPOINTS.system.image, { params: { ...query } }).then(unwrap<unknown>);

/** The signed-in admin's member profile, if the account has one. */
export const getMyProfileAction = () =>
  apiClient.get<unknown>(ENDPOINTS.system.profileMe).then(unwrap<unknown>);
