import { apiClient } from "@/libs/api/client";
import { ENDPOINTS } from "@/libs/api/endpoints";
import { toPage, unwrap } from "@/libs/api/normalize";
import type {
  AdminCloseConversationDto,
  AdminDeleteMessageDto,
  AdminReviewReportDto,
  ListChatConversationsQuery,
  ListChatReportsQuery,
  ListConversationMessagesQuery,
  SignMediaUrlsDto,
} from "@/types/api-dtos";

// ⚠️ PROVISIONAL: responses stay `unknown` until each route is typed from a live sample.

export const getChatStatsAction = () =>
  apiClient.get<unknown>(ENDPOINTS.chat.stats).then(unwrap<unknown>);

export const listConversationsAction = (query: ListChatConversationsQuery = {}) =>
  apiClient
    .get<unknown>(ENDPOINTS.chat.conversations, { params: { ...query } })
    .then((body) => toPage<unknown>(body, query));

/** Opens message content: only for reported conversations, as the privacy notice says. */
export const listMessagesAction = (
  conversationId: string,
  query: ListConversationMessagesQuery = {},
) =>
  apiClient
    .get<unknown>(ENDPOINTS.chat.messages(conversationId), { params: { ...query } })
    .then((body) => toPage<unknown>(body, query));

export const closeConversationAction = (conversationId: string, body: AdminCloseConversationDto) =>
  apiClient.post<unknown>(ENDPOINTS.chat.close(conversationId), body);

/** Redacts one message, with the reason kept on the record. */
export const deleteMessageAction = (messageId: string, body: AdminDeleteMessageDto) =>
  apiClient.delete<unknown>(ENDPOINTS.chat.message(messageId), body);

export const listChatReportsAction = (query: ListChatReportsQuery = {}) =>
  apiClient
    .get<unknown>(ENDPOINTS.chat.reports, { params: { ...query } })
    .then((body) => toPage<unknown>(body, query));

/** The review can also enforce: `action` warning, suspend or ban. */
export const reviewChatReportAction = (reportId: string, body: AdminReviewReportDto) =>
  apiClient.patch<unknown>(ENDPOINTS.chat.report(reportId), body);

/** Path → signed URL, for media in message history. */
export const signChatMediaAction = (body: SignMediaUrlsDto) =>
  apiClient.post<unknown>(ENDPOINTS.chat.signMedia, body).then(unwrap<Record<string, string>>);
