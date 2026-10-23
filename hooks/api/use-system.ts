import { useQuery } from "@tanstack/react-query";

import { getHealthAction, getImageUrlAction, getMyProfileAction } from "@/actions/system-actions";
import { queryKeys } from "@/libs/react-query/query-client";

export function useHealth() {
  return useQuery({ queryKey: queryKeys.system.health(), queryFn: getHealthAction });
}

/** A signed URL for a storage path. */
export function useImageUrl(fileName: string | undefined) {
  return useQuery({
    queryKey: queryKeys.system.image(fileName ?? ""),
    queryFn: () => getImageUrlAction({ fileName: fileName! }),
    enabled: Boolean(fileName),
  });
}

/** The signed-in admin's member profile, if the account has one. */
export function useMyProfile() {
  return useQuery({ queryKey: queryKeys.system.profileMe(), queryFn: getMyProfileAction });
}
