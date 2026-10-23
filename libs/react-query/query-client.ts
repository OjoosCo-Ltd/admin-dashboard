import { isServer, MutationCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/libs/api/client";
import type {
  EngagementAnalyticsQuery,
  GetAllVerificationsQuery,
  GetEventTicketsQuery,
  GetRepliesQuery,
  ListAllEventsQuery,
  ListChatConversationsQuery,
  ListChatReportsQuery,
  ListCommunityPostsQuery,
  ListCommunityReportsQuery,
  ListConversationMessagesQuery,
  ListGroupEventsQuery,
  ListMatchesQuery,
  ListPostReportsQuery,
  ListProfilesQuery,
  ListUsersQuery,
  ListVirtualDatesQuery,
  UserGrowthQuery,
} from "@/types/api-dtos";

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
    userGrowth: (query: UserGrowthQuery = {}) => ["dashboard", "user-growth", query] as const,
    engagement: (query: EngagementAnalyticsQuery = {}) =>
      ["dashboard", "engagement", query] as const,
  },
  users: {
    all: ["users"] as const,
    list: (query: ListUsersQuery = {}) => ["users", "list", query] as const,
    admins: () => ["users", "admins"] as const,
    detail: (userId: string) => ["users", "detail", userId] as const,
    activity: (userId: string) => ["users", "activity", userId] as const,
  },
  profiles: {
    all: ["profiles"] as const,
    list: (query: ListProfilesQuery = {}) => ["profiles", "list", query] as const,
    detail: (userId: string) => ["profiles", "detail", userId] as const,
  },
  verification: {
    all: ["verification"] as const,
    list: (query: GetAllVerificationsQuery = {}) => ["verification", "list", query] as const,
    stats: () => ["verification", "stats"] as const,
    detail: (userId: string) => ["verification", "detail", userId] as const,
    requirements: (documentType: string) => ["verification", "requirements", documentType] as const,
  },
  matching: {
    all: ["matching"] as const,
    stats: () => ["matching", "stats"] as const,
    list: (query: ListMatchesQuery = {}) => ["matching", "list", query] as const,
    detail: (matchId: string) => ["matching", "detail", matchId] as const,
    weights: () => ["matching", "weights"] as const,
  },
  chat: {
    all: ["chat"] as const,
    stats: () => ["chat", "stats"] as const,
    conversations: (query: ListChatConversationsQuery = {}) =>
      ["chat", "conversations", query] as const,
    messages: (conversationId: string, query: ListConversationMessagesQuery = {}) =>
      ["chat", "messages", conversationId, query] as const,
    reports: (query: ListChatReportsQuery = {}) => ["chat", "reports", query] as const,
    media: (paths: string[]) => ["chat", "media", paths] as const,
  },
  community: {
    all: ["community"] as const,
    stats: () => ["community", "stats"] as const,
    groups: () => ["community", "groups"] as const,
    group: (groupId: string) => ["community", "group", groupId] as const,
    posts: (query: ListCommunityPostsQuery = {}) => ["community", "posts", query] as const,
    post: (postId: string) => ["community", "post", postId] as const,
    replies: (postId: string, query: GetRepliesQuery = {}) =>
      ["community", "replies", postId, query] as const,
    reports: (query: ListCommunityReportsQuery = {}) => ["community", "reports", query] as const,
    postReports: (query: ListPostReportsQuery) => ["community", "post-reports", query] as const,
    events: (query: ListAllEventsQuery = {}) => ["community", "events", query] as const,
    groupEvents: (groupId: string, query: ListGroupEventsQuery = {}) =>
      ["community", "group-events", groupId, query] as const,
    event: (eventId: string) => ["community", "event", eventId] as const,
    tickets: (eventId: string, query: GetEventTicketsQuery) =>
      ["community", "tickets", eventId, query] as const,
    media: (paths: string[]) => ["community", "media", paths] as const,
  },
  virtualDates: {
    all: ["virtual-dates"] as const,
    list: (query: ListVirtualDatesQuery = {}) => ["virtual-dates", "list", query] as const,
    stats: () => ["virtual-dates", "stats"] as const,
    detail: (invitationId: string) => ["virtual-dates", "detail", invitationId] as const,
  },
  system: {
    all: ["system"] as const,
    health: () => ["system", "health"] as const,
    image: (fileName: string) => ["system", "image", fileName] as const,
    profileMe: () => ["system", "profile-me"] as const,
  },
};
