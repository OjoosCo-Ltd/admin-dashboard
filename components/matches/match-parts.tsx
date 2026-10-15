import type { ConversationHealth, MatchParticipant, MatchStatus } from "@/types/matches";

export const CONVERSATION_STYLES: Record<ConversationHealth, { label: string; className: string }> =
  {
    "high-engagement": {
      label: "High Engagement",
      className: "bg-info-soft text-[#4e6875] dark:bg-info-soft/20 dark:text-info-soft",
    },
    "flagged-terms": {
      label: "Flagged Terms",
      className: "bg-[#ffdad6] text-[#93000a] dark:bg-destructive/20 dark:text-destructive",
    },
    "no-contact": {
      label: "No Contact",
      className: "bg-[#dfe3e6] text-muted-foreground dark:bg-muted",
    },
  };

/** Each status as the Figma colors it: the text and its dot share the color, except Pending's grey dot. */
export const MATCH_STATUS_STYLES: Record<
  MatchStatus,
  { label: string; text: string; dot: string }
> = {
  active: {
    label: "Active",
    text: "text-action dark:text-primary",
    dot: "bg-action dark:bg-primary",
  },
  reported: { label: "Reported", text: "text-destructive", dot: "bg-destructive" },
  pending: { label: "Pending", text: "text-muted-foreground", dot: "bg-border" },
};

/** "Sarah & James", from the two participants' first names. */
export const pairName = (users: [MatchParticipant, MatchParticipant]) =>
  `${users[0].name.split(" ")[0]} & ${users[1].name.split(" ")[0]}`;
