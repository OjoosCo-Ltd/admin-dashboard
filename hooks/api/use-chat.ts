import { useQuery } from "@tanstack/react-query";

import {
  closeConversationAction,
  deleteMessageAction,
  getChatStatsAction,
  listChatReportsAction,
  listConversationsAction,
  listMessagesAction,
  reviewChatReportAction,
  signChatMediaAction,
} from "@/actions/chat-actions";
import { queryKeys } from "@/libs/react-query/query-client";
import type {
  AdminCloseConversationDto,
  AdminDeleteMessageDto,
  AdminReviewReportDto,
  ListChatConversationsQuery,
  ListChatReportsQuery,
  ListConversationMessagesQuery,
} from "@/types/api-dtos";

import { useInvalidatingMutation } from "./mutation";

export function useChatStats() {
  return useQuery({ queryKey: queryKeys.chat.stats(), queryFn: getChatStatsAction });
}

export function useConversations(query: ListChatConversationsQuery = {}) {
  return useQuery({
    queryKey: queryKeys.chat.conversations(query),
    queryFn: () => listConversationsAction(query),
  });
}

/** Message content: pass `enabled` only for conversations that are reported or under review. */
export function useConversationMessages(
  conversationId: string | undefined,
  query: ListConversationMessagesQuery = {},
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.chat.messages(conversationId ?? "", query),
    queryFn: () => listMessagesAction(conversationId!, query),
    enabled: enabled && Boolean(conversationId),
  });
}

export function useChatReports(query: ListChatReportsQuery = {}) {
  return useQuery({
    queryKey: queryKeys.chat.reports(query),
    queryFn: () => listChatReportsAction(query),
  });
}

/** Signed URLs for message media, keyed by path. */
export function useChatMedia(paths: string[]) {
  return useQuery({
    queryKey: queryKeys.chat.media(paths),
    queryFn: () => signChatMediaAction({ paths }),
    enabled: paths.length > 0,
  });
}

export function useCloseConversation() {
  return useInvalidatingMutation(
    ({ conversationId, ...body }: { conversationId: string } & AdminCloseConversationDto) =>
      closeConversationAction(conversationId, body),
    [queryKeys.chat.all],
  );
}

export function useDeleteMessage() {
  return useInvalidatingMutation(
    ({ messageId, ...body }: { messageId: string } & AdminDeleteMessageDto) =>
      deleteMessageAction(messageId, body),
    [queryKeys.chat.all],
  );
}

/** An enforcing review (warning, suspend, ban) changes the member too. */
export function useReviewChatReport() {
  return useInvalidatingMutation(
    ({ reportId, ...body }: { reportId: string } & AdminReviewReportDto) =>
      reviewChatReportAction(reportId, body),
    [queryKeys.chat.all, queryKeys.users.all],
  );
}
