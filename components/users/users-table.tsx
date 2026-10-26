"use client";

import {
  EyeIcon,
  MapPinIcon,
  PencilSimpleIcon,
  ProhibitIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { cn } from "cn";
import type { ComponentProps } from "react";
import { toast } from "sonner";

import { PagePagination } from "@/components/dashboard/page-pagination";
import { PlanBadge, StatusBadge, UserAvatar } from "@/components/users/user-badges";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { enabled, FEATURES, type Feature } from "@/constants/features";
import type { UserSummary } from "@/types/users";

// The Figma's table (1,256px) is wider than the content area at 1440px. Like
// the Figma, two-word headers and long cells wrap; with tighter inner padding
// the table fits from 1440px and scrolls sideways below its minimum width.
// Each column's share (%) scales up to fill the width when a column is hidden,
// and the minimum width (68rem with every column) shrinks with it.
const COLUMNS = enabled<{ label: string; share: number; align?: string; feature?: Feature }>([
  { label: "User", share: 27 },
  { label: "ID / Demographics", share: 14 },
  { label: "Location", share: 12 },
  { label: "Status", share: 11 },
  { label: "Subscription", share: 13, feature: "subscriptions" },
  { label: "Last active", share: 10 },
  { label: "Actions", share: 13, align: "text-right" },
]);
const SHARES = COLUMNS.reduce((sum, column) => sum + column.share, 0);

// 24px at the table's edges, 14px between columns.
const edges = "px-3.5 first:pl-6 last:pr-6";
const cell = cn(edges, "py-5");

// A suspended account's row fades everything but its status and actions.
const dimmed = (user: UserSummary) => user.suspended && "opacity-60";

const day = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const count = new Intl.NumberFormat("en-US");

/** The directory's rows, one page at a time, with the paging controls underneath. */
export function UsersTable({
  users,
  total,
  page,
  pageSize,
  onPageChange,
  onView,
  className,
}: {
  users: UserSummary[];
  /** Every match across all pages. */
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  /** Opens the profile preview; `opener` gets focus back when it closes. */
  onView: (user: UserSummary, opener: HTMLElement) => void;
  className?: string;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  // UI only: none of the account actions reach /admin/users yet.
  const notYet = (action: string) => toast(`${action} isn't available yet`);

  return (
    <section
      aria-label="Users"
      className={cn(
        "overflow-hidden rounded-xl border bg-card shadow-[0_2px_6px_rgb(24_28_30/0.05)]",
        className,
      )}
    >
      <Table style={{ minWidth: `${(68 * SHARES) / 100}rem` }}>
        <colgroup>
          {COLUMNS.map((column) => (
            <col key={column.label} style={{ width: `${(column.share / SHARES) * 100}%` }} />
          ))}
        </colgroup>
        <TableHeader className="[&_tr]:border-b-0">
          <TableRow className="bg-muted hover:bg-muted">
            {COLUMNS.map((column) => (
              <TableHead
                key={column.label}
                className={cn(
                  "h-20 text-[15px]/6 font-semibold tracking-[0.05em] whitespace-normal text-muted-foreground uppercase",
                  edges,
                  column.align,
                )}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="border-muted-strong/70 dark:border-border">
              <TableCell className={cn(cell, dimmed(user))}>
                <div className="flex items-center gap-4">
                  <UserAvatar user={user} />
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-foreground">{user.name}</p>
                    <p
                      title={user.email}
                      className="max-w-48 truncate text-base text-muted-foreground"
                    >
                      {user.email}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className={cn(cell, dimmed(user))}>
                <p className="text-[15px] font-bold tracking-wide text-primary tabular-nums">
                  #{user.publicId}
                </p>
                <p className="text-base text-muted-foreground">
                  {user.age} / {user.gender}
                </p>
              </TableCell>
              <TableCell className={cn(cell, dimmed(user))}>
                <span className="flex items-center gap-1.5 text-base whitespace-normal text-foreground">
                  <MapPinIcon aria-hidden className="size-4.5 shrink-0 text-muted-foreground" />
                  {user.location}
                </span>
              </TableCell>
              <TableCell className={cell}>
                <div className="flex flex-col gap-1">
                  {user.suspended ? (
                    <StatusBadge status="suspended" />
                  ) : (
                    <>
                      <StatusBadge status={user.verification} />
                      {FEATURES.presence && (
                        <StatusBadge status={user.online ? "online" : "offline"} />
                      )}
                    </>
                  )}
                </div>
              </TableCell>
              {FEATURES.subscriptions && (
                <TableCell className={cn(cell, dimmed(user))}>
                  <PlanBadge plan={user.plan} />
                </TableCell>
              )}
              <TableCell className={cn(cell, dimmed(user))}>
                <p className="text-base font-semibold whitespace-normal text-foreground">
                  {user.lastActive}
                </p>
                <time dateTime={user.lastActiveAt} className="text-xs text-muted-foreground">
                  {day.format(new Date(user.lastActiveAt))}
                </time>
              </TableCell>
              <TableCell className={cn(cell, "text-right")}>
                {user.suspended ? (
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => notYet("Restoring a user")}
                      className="rounded-md px-1 text-base font-semibold text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      Restore<span className="sr-only"> {user.name}</span>
                    </button>
                    <RowAction
                      label={`Delete ${user.name}`}
                      onClick={() => notYet("Deleting a user")}
                      className="text-destructive hover:text-destructive"
                    >
                      <TrashIcon weight="bold" />
                    </RowAction>
                  </div>
                ) : (
                  <div className="flex items-center justify-end">
                    <RowAction
                      label={`View ${user.name}`}
                      onClick={(event) => onView(user, event.currentTarget)}
                    >
                      <EyeIcon weight="bold" />
                    </RowAction>
                    <RowAction label={`Edit ${user.name}`} onClick={() => notYet("Editing a user")}>
                      <PencilSimpleIcon weight="bold" />
                    </RowAction>
                    <RowAction
                      label={`Suspend ${user.name}`}
                      onClick={() => notYet("Suspending a user")}
                    >
                      <ProhibitIcon weight="bold" />
                    </RowAction>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={COLUMNS.length}
                className="h-32 text-center text-muted-foreground"
              >
                No users match these filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-muted-strong/70 bg-muted/70 px-6 py-6 dark:border-border">
        <p className="text-base text-muted-foreground">
          {total === 0 ? (
            "No users to show"
          ) : (
            <>
              Showing{" "}
              <span className="font-medium text-foreground tabular-nums">
                {count.format(first)} - {count.format(last)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground tabular-nums">
                {count.format(total)}
              </span>{" "}
              {total === 1 ? "user" : "users"}
            </>
          )}
        </p>
        <PagePagination page={page} pageCount={pageCount} onPageChange={onPageChange} />
      </div>
    </section>
  );
}

function RowAction({
  label,
  className,
  children,
  ...props
}: ComponentProps<"button"> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-6",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
