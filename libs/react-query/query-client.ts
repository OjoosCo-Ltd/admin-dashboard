import { isServer, MutationCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/libs/api/client";
import type { StatsPeriod } from "@/types/api";

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: Error;
    mutationMeta: {
      /** Skip the global error toast (e.g. a form that shows its own error). */
      silent?: boolean;
    };
  }
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Admin data goes stale fast. Lists refetch on focus and remount
        // after 30s.
        staleTime: 30_000,
        // A 4xx won't succeed on retry. Only network errors and 5xx get
        // retried.
        retry: (failureCount, error) =>
          !(error instanceof ApiError && error.status < 500) && failureCount < 2,
      },
      // Admin mutations (suspend, delete, review) must never run twice.
      mutations: { retry: false },
    },
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (!mutation.meta?.silent) toast.error(error.message);
      },
    }),
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * A new client per server render, one shared client in the browser.
 * This is TanStack's App Router pattern. A module-level singleton would
 * leak cache between requests on the server.
 */
export function getQueryClient() {
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

/**
 * Cache keys, one nested object per domain, matching libs/api/endpoints.ts.
 * Invalidate a whole domain with e.g. `queryKeys.users.all`.
 */
export const queryKeys = {
  dashboard: {
    all: ["dashboard"] as const,
    overview: () => ["dashboard", "overview"] as const,
    userGrowth: (params: { period?: StatsPeriod; from?: string; to?: string } = {}) =>
      ["dashboard", "user-growth", params] as const,
    engagement: (
      params: { period?: StatsPeriod; from?: string; to?: string; days?: number } = {},
    ) => ["dashboard", "engagement", params] as const,
  },
};
