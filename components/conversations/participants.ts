import type { Conversation, ConversationParticipant } from "@/types/conversations";

/** Who a warning or suspension targets first: the participant the safety systems flagged, else the first. */
export const flaggedParticipant = (conversation: Conversation): ConversationParticipant =>
  conversation.participants.find(
    (participant) => participant.id === conversation.flaggedParticipantId,
  ) ?? conversation.participants[0];

/**
 * Who a moderation dialog acts on: a conversation's flagged participant, or a
 * person named outright, as Reports & Safety does for a reported user.
 */
export type ModerationSubject =
  | { conversation: Conversation; target?: undefined }
  | { conversation?: undefined; target: ConversationParticipant };

export const subjectOf = (subject: ModerationSubject): ConversationParticipant =>
  subject.target === undefined ? flaggedParticipant(subject.conversation) : subject.target;

/** "Sarah & Mark": the pair by first name, as the table shows them. */
export const pairName = (conversation: Conversation) =>
  conversation.participants.map((participant) => participant.name.split(/\s+/)[0]).join(" & ");

/** A participant by id, for messages in the evidence transcript. */
export const participantById = (conversation: Conversation, id: string) =>
  conversation.participants.find((participant) => participant.id === id);
