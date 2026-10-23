import { type QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * A mutation that refetches the given domains once it succeeds, e.g.
 * `useInvalidatingMutation(suspend, queryKeys.users.all)`. Pass
 * `{ silent: true }` when the screen shows the error itself.
 */
export function useInvalidatingMutation<TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  keys: QueryKey[],
  meta?: { silent?: boolean },
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey }))),
    meta,
  });
}
