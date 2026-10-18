"use client";

import { ArrowSquareOutIcon, XIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import Link from "next/link";
import type { ElementType } from "react";

import {
  NOTIFICATION_TYPES,
  PriorityPill,
  TypeGlyph,
} from "@/components/notifications/notification-parts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { initials } from "@/libs/utils";
import type { AdminNotification } from "@/types/notifications";

const fieldLabel = "text-[11px]/4 text-muted-foreground";
const fieldValue = "mt-1 text-sm/5 font-semibold";

/**
 * A notification in full: its type, date, reference and category, the
 * description, who it's about, and its action with Mark as Read below.
 * Shown in the page's right-hand panel, or in a sheet below xl.
 */
export function NotificationDetail({
  notification,
  unread,
  onToggleRead,
  onClose,
  titleAs: Title = "h2",
  className,
}: {
  notification: AdminNotification;
  /** The page's read state, which Mark as Read changes. */
  unread: boolean;
  onToggleRead: () => void;
  onClose: () => void;
  /** The sheet passes its dialog title, so the heading names the dialog. */
  titleAs?: ElementType;
  className?: string;
}) {
  const type = NOTIFICATION_TYPES[notification.type];
  const { user } = notification;

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="flex shrink-0 items-start gap-4 border-b px-10 py-10 max-sm:px-5 max-sm:py-6">
        <TypeGlyph type={notification.type} className="size-12 rounded-2xl [&>svg]:size-6" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-1.5">
            <PriorityPill priority={notification.priority} withMark={false} />
            {unread && (
              <span className="rounded-md bg-[#deeaf1] px-2 py-0.5 text-[11px]/4 text-action dark:bg-action/25 dark:text-primary">
                Unread
              </span>
            )}
          </div>
          <Title className="mt-1.5 text-xl/6.5 font-semibold">{notification.title}</Title>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="-mt-1 -mr-1 rounded-md p-1 text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <XIcon aria-hidden weight="bold" className="size-5" />
          <span className="sr-only">Close details</span>
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-10 pt-11 pb-10 max-sm:px-5 max-sm:pt-6">
        <dl className="grid grid-cols-2 gap-x-2 gap-y-5">
          <div>
            <dt className={fieldLabel}>Type</dt>
            <dd className={fieldValue}>{type.label}</dd>
          </div>
          <div>
            <dt className={fieldLabel}>Date</dt>
            <dd className={fieldValue}>{notification.date}</dd>
          </div>
          <div>
            <dt className={fieldLabel}>Ref ID</dt>
            <dd className="mt-1">
              <code className="inline-block rounded-sm bg-[#ebf2f8] px-2.5 py-1 font-mono text-xs/4 text-action dark:bg-action/20 dark:text-primary">
                {notification.refId}
              </code>
            </dd>
          </div>
          <div>
            <dt className={fieldLabel}>Category</dt>
            <dd className={fieldValue}>{notification.category}</dd>
          </div>
        </dl>

        <div className="mt-12 border-t pt-7 max-sm:mt-8">
          <h3 className="text-xs/4 font-semibold tracking-wider">Description</h3>
          <p className="mt-2.5 text-[13px]/[21px] text-muted-foreground">
            {notification.description}
          </p>
        </div>

        {user && (
          <div className="mt-12 flex items-center gap-4 rounded-xl border border-border/40 bg-muted p-4 max-sm:mt-8 dark:border-border dark:bg-muted/50">
            <Avatar className="size-10 after:hidden">
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
              <AvatarFallback className="bg-muted-strong text-sm text-muted-foreground">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs/4 font-semibold tracking-wider">{user.name}</p>
              <p className="text-[13px]/5 text-muted-foreground">User ID: {user.id}</p>
            </div>
            <Link
              href={`/users?q=${encodeURIComponent(user.name)}`}
              className="rounded-md p-1 text-action transition-colors outline-none hover:bg-muted-strong focus-visible:ring-3 focus-visible:ring-ring/50 dark:text-primary"
            >
              <ArrowSquareOutIcon aria-hidden weight="bold" className="size-6" />
              <span className="sr-only">Open {user.name} in Users</span>
            </Link>
          </div>
        )}
      </div>

      <div className="grid shrink-0 gap-3 border-t px-10 py-10 max-sm:px-5 max-sm:py-5">
        <Button
          asChild
          className="h-14 rounded-[12px] text-lg font-semibold tracking-wide max-sm:h-12 max-sm:text-base"
        >
          <Link href={notification.action.href}>{notification.action.label}</Link>
        </Button>
        <Button
          variant="outline"
          onClick={onToggleRead}
          className="h-14 rounded-[12px] bg-surface text-lg font-semibold tracking-wide max-sm:h-12 max-sm:text-base dark:bg-input/30"
        >
          {unread ? "Mark as Read" : "Mark as Unread"}
        </Button>
      </div>
    </div>
  );
}
