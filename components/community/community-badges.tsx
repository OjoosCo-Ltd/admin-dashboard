import { CaretDoubleUpIcon, CaretUpIcon, WarningIcon } from "@phosphor-icons/react/ssr";
import { cn } from "cn";

import type {
  DiscussionStatus,
  EventStatus,
  GroupStatus,
  MemberStatus,
  ModerationPriority,
  ModerationStatus,
  ReportPriority,
  ReportReason,
  ReportStatus,
} from "@/types/community";

/** The slate the Figma sets on info-soft fills: category pills, initials, the book tile. */
export const ON_INFO_SOFT = "text-[#4d6876] dark:text-info-soft";

const square = "inline-flex items-center rounded-sm px-2 py-0.5 text-xs/4.5 whitespace-nowrap";
const rounded =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs/4.5 whitespace-nowrap";

/** "Lifestyle": the group's category on an info-soft square. */
export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className={cn(square, "bg-info-soft px-2.5 py-0.75 dark:bg-info-soft/15", ON_INFO_SOFT)}>
      {category}
    </span>
  );
}

const GROUP_STATUS: Record<GroupStatus, { label: string; pill: string; dot: string }> = {
  active: {
    label: "Active",
    pill: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300",
    dot: "bg-current",
  },
  inactive: {
    label: "Inactive",
    pill: "bg-[#dfe3e6] text-muted-foreground dark:bg-muted",
    dot: "bg-outline",
  },
};

/** A group's state: green Active, grey Inactive, each led by a dot. */
export function GroupStatusBadge({ status }: { status: GroupStatus }) {
  const look = GROUP_STATUS[status];
  return (
    <span className={cn(rounded, "py-0.75", look.pill)}>
      <span aria-hidden className={cn("size-1.5 rounded-full", look.dot)} />
      {look.label}
    </span>
  );
}

const MEMBER_STATUS: Record<MemberStatus, { label: string; pill: string }> = {
  active: {
    label: "Active",
    pill: "bg-action-soft text-action dark:bg-action/25 dark:text-primary",
  },
  muted: { label: "Muted", pill: "bg-muted-strong text-muted-foreground dark:bg-muted" },
  banned: {
    label: "Banned",
    pill: "bg-destructive-container text-[#93000a] dark:bg-destructive/20 dark:text-red-200",
  },
};

export function MemberStatusBadge({ status }: { status: MemberStatus }) {
  const look = MEMBER_STATUS[status];
  return <span className={cn(square, "px-2.5 py-0.75", look.pill)}>{look.label}</span>;
}

const DISCUSSION_STATUS: Record<DiscussionStatus, { label: string; pill: string }> = {
  pinned: {
    label: "Pinned",
    pill: "border-[#ffd1a8] bg-[#ffdcbf] text-[#2d1600] dark:border-caution/40 dark:bg-caution/30 dark:text-[#e9b97c]",
  },
  open: {
    label: "Open",
    pill: "border-[#dadee2] bg-muted-strong text-foreground dark:border-border dark:bg-muted",
  },
  locked: {
    label: "Locked",
    pill: "border-[#e0e4e7] bg-[#e8eaec] text-[#6f767a] dark:border-border dark:bg-muted dark:text-muted-foreground",
  },
};

/** A discussion's state: peach Pinned, grey Open, faded Locked, each outlined. */
export function DiscussionStatusBadge({ status }: { status: DiscussionStatus }) {
  const look = DISCUSSION_STATUS[status];
  return (
    <span className={cn(rounded, "border py-0.5 text-[13px]/4.5", look.pill)}>{look.label}</span>
  );
}

const REASONS: Record<ReportReason, { label: string; pill: string }> = {
  harassment: {
    label: "Harassment",
    pill: "bg-destructive-container text-[#93000a] dark:bg-destructive/20 dark:text-red-200",
  },
  spam: { label: "Spam", pill: "bg-caution-accent text-white dark:bg-caution-accent/80" },
  nsfw: {
    label: "NSFW Content",
    pill: "bg-destructive-container text-[#93000a] dark:bg-destructive/20 dark:text-red-200",
  },
};

/** Why the content was reported. The Figma sets NSFW Content on two lines in a wider pill. */
export function ReasonBadge({ reason }: { reason: ReportReason }) {
  const look = REASONS[reason];
  return (
    <span
      className={cn(
        "inline-flex rounded-[10px] px-2.5 py-0.5 text-[13px]/4.5",
        reason === "nsfw" ? "w-min min-w-15.5 pr-6" : "whitespace-nowrap",
        look.pill,
      )}
    >
      {look.label}
    </span>
  );
}

const PRIORITIES: Record<
  ReportPriority,
  { label: string; icon: typeof WarningIcon; tone: string }
> = {
  medium: { label: "Medium", icon: CaretUpIcon, tone: "text-caution-accent dark:text-[#e9b97c]" },
  high: { label: "High", icon: CaretDoubleUpIcon, tone: "text-destructive" },
  critical: { label: "Critical", icon: WarningIcon, tone: "text-destructive" },
};

/** ^ Medium, ⇈ High, ⚠ Critical. */
export function PriorityLabel({ priority }: { priority: ReportPriority }) {
  const look = PRIORITIES[priority];
  const Icon = look.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[13px]/4.5 font-semibold whitespace-nowrap",
        look.tone,
      )}
    >
      <Icon aria-hidden weight="bold" className={priority === "critical" ? "size-4" : "size-3.5"} />
      {look.label}
    </span>
  );
}

const REPORT_STATUS: Record<ReportStatus, { label: string; dot: string }> = {
  new: { label: "New", dot: "bg-destructive" },
  reviewing: { label: "Reviewing", dot: "bg-action dark:bg-primary" },
};

/** The report's place in the queue: an outlined grey pill led by a red (new) or teal (in review) dot. */
export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  const look = REPORT_STATUS[status];
  return (
    <span
      className={cn(
        rounded,
        "border bg-muted-strong text-[13px]/4.5 text-muted-foreground dark:bg-muted",
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", look.dot)} />
      {look.label}
    </span>
  );
}

// The events and moderation Figmas' outlined pills: amber, red, slate and grey.
const AMBER =
  "border-[#e5d5c2] bg-caution-soft text-caution-accent dark:border-caution/40 dark:bg-caution/20 dark:text-[#e9b97c]";
const RED =
  "border-[#ecbfbf] bg-[#f8e8e8] text-destructive dark:border-destructive/40 dark:bg-destructive/15 dark:text-red-300";
const GREY = "border-border bg-[#eceff0] text-muted-foreground dark:bg-muted";

const EVENT_STATUS: Record<EventStatus, { label: string; pill: string; dot?: boolean }> = {
  draft: { label: "Draft", pill: GREY },
  upcoming: { label: "Upcoming", pill: AMBER },
  live: { label: "Live", pill: RED, dot: true },
  completed: { label: "Completed", pill: GREY },
  cancelled: { label: "Cancelled", pill: cn(GREY, "line-through") },
};

/** An event's state: amber Upcoming, red Live (with a dot), grey Completed. */
export function EventStatusBadge({ status }: { status: EventStatus }) {
  const look = EVENT_STATUS[status];
  return (
    <span className={cn(rounded, "gap-1 border px-2 py-0 text-sm/6", look.pill)}>
      {look.dot && <span aria-hidden className="size-1.5 rounded-full bg-current" />}
      {look.label}
    </span>
  );
}

const MODERATION_PRIORITY: Record<ModerationPriority, { label: string; pill: string }> = {
  low: {
    label: "Low",
    pill: "border-[#ccd3d7] bg-[#edeff1] text-review dark:border-border dark:bg-muted dark:text-subtle-foreground",
  },
  medium: { label: "Medium", pill: AMBER },
  high: { label: "High", pill: RED },
  critical: { label: "Critical", pill: RED },
};

export function ModerationPriorityBadge({ priority }: { priority: ModerationPriority }) {
  const look = MODERATION_PRIORITY[priority];
  return <span className={cn(rounded, "border px-2.5 text-xs/4.5", look.pill)}>{look.label}</span>;
}

const MODERATION_STATUS: Record<ModerationStatus, { label: string; pill: string }> = {
  new: {
    label: "New",
    pill: "border-[#c3dbe3] bg-action-soft text-action-icon dark:border-action/40 dark:bg-action/25 dark:text-primary",
  },
  "under-review": { label: "Under Review", pill: cn(GREY, "border-[#d5dbdf] dark:border-border") },
};

/** A case's place in the queue. The Figma stacks "Under Review" in a rounded tile. */
export function ModerationStatusBadge({ status }: { status: ModerationStatus }) {
  const look = MODERATION_STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex w-min rounded-[14px] border px-2.5 py-0.5 text-xs/4 whitespace-normal",
        look.pill,
      )}
    >
      {look.label}
    </span>
  );
}
