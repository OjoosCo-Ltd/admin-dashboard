import type { Icon } from "@phosphor-icons/react";
import {
  CreditCardIcon,
  ShieldCheckIcon,
  StarIcon,
  UserPlusIcon,
  UsersThreeIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react/ssr";
import { cn } from "cn";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";

import type {
  AdminNotification,
  NotificationCounts,
  NotificationPriority,
  NotificationType,
} from "@/types/notifications";

/** Each type's tab label, glyph and disc, as the Figma colors them. */
export const NOTIFICATION_TYPES: Record<
  NotificationType,
  { label: string; icon: Icon; disc: string }
> = {
  users: {
    label: "Users",
    icon: UserPlusIcon,
    disc: "bg-success-soft text-success dark:bg-success/15",
  },
  verification: {
    label: "Verification",
    icon: ShieldCheckIcon,
    disc: "bg-[#d3e2e9] text-action dark:bg-action/25 dark:text-primary",
  },
  safety: {
    label: "Safety",
    icon: WarningCircleIcon,
    disc: "bg-[#dfe3e6] text-muted-foreground dark:bg-muted",
  },
  payments: {
    label: "Payments",
    icon: CreditCardIcon,
    disc: "bg-info-soft text-[#4e6875] dark:bg-info-soft/15 dark:text-info-soft",
  },
  community: {
    label: "Community",
    icon: UsersThreeIcon,
    disc: "bg-action-soft text-action-icon dark:bg-action/25 dark:text-primary",
  },
  subscriptions: {
    label: "Subscriptions",
    icon: StarIcon,
    disc: "bg-[#ece8e5] text-caution dark:bg-caution/25 dark:text-[#e9b97c]",
  },
};

const PRIORITIES: Record<NotificationPriority, { label: string; pill: string; mark?: string }> = {
  critical: {
    label: "Critical",
    pill: "bg-destructive-container text-[#930009] dark:bg-destructive/20 dark:text-red-200",
    mark: "!!",
  },
  high: {
    label: "High",
    pill: "bg-destructive-container text-[#930009] dark:bg-destructive/20 dark:text-red-200",
    mark: "!",
  },
  medium: {
    label: "Medium",
    pill: "bg-info-soft text-[#4e6875] dark:bg-info-soft/15 dark:text-info-soft",
  },
  low: { label: "Low", pill: "bg-container text-outline dark:bg-muted dark:text-muted-foreground" },
};

/** "! High" on the cards; the panel drops the mark ("Critical", "High"). */
export function PriorityPill({
  priority,
  withMark = true,
  className,
}: {
  priority: NotificationPriority;
  withMark?: boolean;
  className?: string;
}) {
  const look = PRIORITIES[priority];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 rounded-md px-2 py-0.5 text-[11px]/4 whitespace-nowrap",
        look.pill,
        className,
      )}
    >
      {withMark && look.mark && (
        <span aria-hidden className="font-bold">
          {look.mark}
        </span>
      )}
      {look.label}
      <span className="sr-only"> priority</span>
    </span>
  );
}

/** The type's glyph on its colored disc (or rounded tile, in the panel). */
export function TypeGlyph({ type, className }: { type: NotificationType; className?: string }) {
  const look = NOTIFICATION_TYPES[type];
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full",
        look.disc,
        className,
      )}
    >
      <look.icon weight="bold" className="size-5" />
    </span>
  );
}

/** Sets invoice and reference numbers ("#INV-9821") in monospace, as the Figma does. */
export function WithCodes({ text }: { text: string }) {
  return text.split(/(#[A-Z]+-\d+)/).map((part, index) =>
    index % 2 ? (
      <code key={index} className="font-mono text-[0.95em] text-foreground">
        {part}
      </code>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}

const KPI_CARD = "relative overflow-hidden rounded-xl border px-6 pt-6 pb-5";
const KPI_LABEL = "max-w-20 text-[11px]/3.5 font-medium tracking-wider uppercase";

/** All, Unread (tinted teal, with a dot), High Priority (tinted red) and Resolved. */
export function NotificationKpiRow({ counts }: { counts: NotificationCounts }) {
  const cards: {
    id: string;
    label: string;
    value: number;
    card: string;
    text: string;
    extra?: ReactNode;
  }[] = [
    {
      id: "all",
      label: "All Notifications",
      value: counts.all,
      card: "border-border/40 bg-surface dark:border-border dark:bg-card",
      text: "text-muted-foreground",
    },
    {
      id: "unread",
      label: "Unread",
      value: counts.unread,
      card: "border-[#b9d6e3] bg-[#f1f7fd] dark:border-action/40 dark:bg-action/15",
      text: "text-action dark:text-primary",
      extra: (
        // The Figma's dot, set in a soft glow at the corner.
        <span
          aria-hidden
          className="absolute -top-8 -right-8 size-24 rounded-full bg-[#e6f4fe] dark:bg-action/20"
        >
          <span className="absolute top-12 left-10 size-2 rounded-full bg-action dark:bg-primary" />
        </span>
      ),
    },
    {
      id: "high",
      label: "High Priority",
      value: counts.highPriority,
      card: "border-[#e9bdbe] bg-[#f9f3f5] dark:border-destructive/40 dark:bg-destructive/10",
      text: "text-destructive",
    },
    {
      id: "resolved",
      label: "Resolved",
      value: counts.resolved,
      card: "border-border/40 bg-surface dark:border-border dark:bg-card",
      text: "text-muted-foreground",
    },
  ];
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <div key={card.id} className={cn(KPI_CARD, card.card)}>
          {card.extra}
          <dt className={cn(KPI_LABEL, "relative", card.text)}>{card.label}</dt>
          <dd
            className={cn(
              "relative mt-1.5 text-2xl/8 font-semibold tabular-nums",
              card.id === "all" || card.id === "resolved" ? "text-foreground" : card.text,
            )}
          >
            {card.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * One notification: its glyph, title and summary, priority, age and type, and
 * its action. The title selects it (the whole card is the target); the
 * action goes straight to the page that handles it.
 */
export function NotificationCard({
  notification,
  selected,
  onSelect,
}: {
  notification: AdminNotification;
  selected: boolean;
  onSelect: (from: HTMLElement) => void;
}) {
  const type = NOTIFICATION_TYPES[notification.type];
  return (
    <article
      className={cn(
        "relative rounded-xl border transition-colors",
        selected
          ? "border-[#b9d3dc] bg-[#ebf1f5] shadow-[0_4px_14px_rgb(0_80_105/0.08)] dark:border-action/50 dark:bg-action/15"
          : "border-[#e6eaee] bg-surface hover:bg-muted/60 dark:border-border dark:bg-card dark:hover:bg-muted/40",
      )}
    >
      {notification.unread && (
        <span
          aria-hidden
          className="absolute top-6 left-4.5 size-2 rounded-full bg-action dark:bg-primary"
        />
      )}
      <div
        className={cn(
          "flex gap-4 py-5 pr-6 pl-6 max-sm:gap-3 max-sm:px-4",
          notification.unread && "pl-10 max-sm:pl-8",
        )}
      >
        <TypeGlyph type={notification.type} className="mt-1" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <h3 className="min-w-0 flex-1 text-xl/7 font-semibold max-sm:text-lg/6">
              <button
                type="button"
                aria-pressed={selected}
                onClick={(click) => onSelect(click.currentTarget)}
                className="text-left outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
              >
                {notification.unread && <span className="sr-only">Unread: </span>}
                {notification.title}
              </button>
            </h3>
            <PriorityPill priority={notification.priority} className="mt-1" />
          </div>
          <p className="mt-0.5 text-[13px]/5 text-muted-foreground">
            <WithCodes text={notification.summary} />
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs/4 text-muted-foreground">
              {notification.ago} <span aria-hidden>&bull;</span>
              <span className="sr-only">,</span> {type.label}
            </p>
            {/* Above the title's overlay, so it follows its link instead of selecting the card. */}
            <Link
              href={notification.action.href}
              className={cn(
                "relative z-10 inline-flex h-7 items-center rounded-md border px-5 text-xs font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                selected
                  ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border-[#d5dbdf] bg-container text-foreground hover:bg-muted-strong dark:border-border dark:bg-muted",
              )}
            >
              {notification.action.label}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
