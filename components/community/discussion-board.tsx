"use client";

import { LockSimpleIcon, MagnifyingGlassIcon, PushPinIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import {
  debounce,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { useId } from "react";

import { DiscussionStatusBadge, ON_INFO_SOFT } from "@/components/community/community-badges";
import { RowMenu } from "@/components/community/row-menu";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { PagePagination } from "@/components/dashboard/page-pagination";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { enabled, FEATURES } from "@/constants/features";
import { initials } from "@/libs/utils";
import type { GroupDiscussion } from "@/types/community";

const PAGE_SIZE = 10;

/** The chips, left to right. "Recent" runs past the card's edge in the Figma; the row scrolls. */
const VIEWS = [
  { value: "all", label: "All Discussions" },
  { value: "pinned", label: "Pinned" },
  { value: "reported", label: "Reported" },
  { value: "recent", label: "Recent" },
  { value: "locked", label: "Locked", feature: "threadLocks" },
] as const;

type View = (typeof VIEWS)[number]["value"];

const FILTERS = {
  q: parseAsString.withDefault(""),
  view: parseAsStringLiteral(VIEWS.map((view) => view.value)).withDefault("all"),
  page: parseAsInteger.withDefault(1),
};

interface Filters {
  q: string;
  view: View;
  page: number;
}

const DEFAULT_FILTERS: Filters = { q: "", view: "all", page: 1 };

const COLUMNS = [
  { label: "Discussion Topic", width: "w-[46%]", cell: "pl-4" },
  { label: "Creator", width: "w-[13%]" },
  { label: "Metrics", width: "w-[11%]", cell: "text-right" },
  { label: "Status", width: "w-[16%]", cell: "pl-8" },
  { label: "Actions", width: "w-[14%]", cell: "pr-6 text-right" },
];

const count = new Intl.NumberFormat("en-US");

interface DiscussionBoardProps {
  /** UI only: one sample page, filtered here. */
  discussions: GroupDiscussion[];
  /** Every discussion, for the count and pages while no filter is set. */
  total: number;
  /** For the Reported chip's badge. */
  reportedCount: number;
}

/**
 * The discussion forum: search and view chips over the discussions and their
 * pages, all kept in the URL (?q=, ?view=, ?page=).
 */
export function DiscussionBoard(props: DiscussionBoardProps) {
  const [filters, setFilters] = useQueryStates(FILTERS);
  return (
    <DiscussionBoardView
      {...props}
      filters={filters}
      onChange={(next, { debounced = false } = {}) =>
        // Typing waits for a pause before writing the URL; the list itself updates at once.
        setFilters(next, debounced ? { limitUrlUpdates: debounce(300) } : undefined)
      }
    />
  );
}

/** What renders before the URL is read: every discussion. */
export function DiscussionBoardFallback(props: DiscussionBoardProps) {
  return <DiscussionBoardView {...props} filters={DEFAULT_FILTERS} onChange={() => {}} />;
}

function DiscussionBoardView({
  discussions,
  total,
  reportedCount,
  filters,
  onChange,
}: DiscussionBoardProps & {
  filters: Filters;
  onChange: (next: Partial<Filters>, options?: { debounced?: boolean }) => void;
}) {
  const tableId = useId();
  const query = filters.q.trim().toLowerCase();
  // While locks are hidden, an old link's ?view=locked shows every discussion.
  const view = !FEATURES.threadLocks && filters.view === "locked" ? "all" : filters.view;
  const filtered = query !== "" || (view !== "all" && view !== "recent");

  // UI only: GET /admin/community/posts isn't wired, so the sample page is
  // filtered here ("Recent" is the default newest-first order) and every page
  // shows the same rows.
  const rows = discussions.filter(
    (discussion) =>
      (query === "" ||
        [discussion.title, discussion.excerpt, discussion.creator.name].some((field) =>
          field.toLowerCase().includes(query),
        )) &&
      (view === "pinned"
        ? discussion.status === "pinned"
        : view === "locked"
          ? discussion.status === "locked"
          : view === "reported"
            ? Boolean(discussion.reports)
            : true),
  );
  const filteredTotal = filtered ? rows.length : total;
  const pageCount = Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE));
  const page = Math.min(Math.max(filters.page, 1), pageCount);
  const first = (page - 1) * PAGE_SIZE + 1;
  const last = Math.min(page * PAGE_SIZE, filteredTotal);

  const refine = (next: Partial<Filters>, options?: { debounced?: boolean }) =>
    onChange({ ...next, page: 1 }, options);

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <DashboardCard className="flex flex-wrap items-center gap-x-6 gap-y-3 px-3 py-3 shadow-[0_2px_6px_rgb(24_28_30/0.04)] max-sm:px-3 dark:border-border">
        <div className="relative w-full sm:w-87.5">
          <MagnifyingGlassIcon
            aria-hidden
            weight="bold"
            className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-foreground"
          />
          <Input
            type="search"
            aria-label="Search discussions"
            aria-controls={tableId}
            placeholder="Search discussions..."
            value={filters.q}
            onChange={(event) => refine({ q: event.target.value }, { debounced: true })}
            className="h-9 rounded-md border-[#dfe2e7] bg-surface pl-10.5 text-sm placeholder:text-[#6b7280] md:text-sm dark:border-border dark:bg-input/30"
          />
        </div>
        {/* Scrolls sideways where the chips don't fit, the last one cut off at the edge as in the Figma. */}
        <div
          role="group"
          aria-label="Show"
          className="-my-1 min-w-0 flex-1 [scrollbar-width:none] overflow-x-auto py-1"
        >
          {/* ml-auto right-aligns the chips while they fit. Once they overflow it falls to 0, so none is cut off at the start. */}
          <div className="ml-auto flex w-max gap-3">
            {enabled(VIEWS).map((chip) => {
              const current = chip.value === view;
              return (
                <button
                  key={chip.value}
                  type="button"
                  aria-pressed={current}
                  onClick={() => refine({ view: chip.value })}
                  className={cn(
                    "flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-4 text-[13px] whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    current
                      ? "border-action-icon bg-action-icon text-white dark:border-primary dark:bg-primary dark:text-primary-foreground"
                      : "border-[#dfe2e7] bg-surface text-muted-foreground hover:bg-muted dark:border-border dark:bg-input/30",
                  )}
                >
                  {chip.label}
                  {chip.value === "reported" && reportedCount > 0 && (
                    <span className="rounded-full bg-destructive px-1.5 text-[11px]/4 font-medium text-white">
                      {reportedCount}
                      <span className="sr-only"> reported</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </DashboardCard>

      <DashboardCard className="overflow-hidden p-0 shadow-[0_2px_6px_rgb(24_28_30/0.04)]">
        <Table id={tableId} aria-label="Discussions" className="min-w-180">
          <colgroup>
            {COLUMNS.map((column) => (
              <col key={column.label} className={column.width} />
            ))}
          </colgroup>
          <TableHeader className="[&_tr]:border-b [&_tr]:border-border/30 dark:[&_tr]:border-border">
            <TableRow className="bg-muted hover:bg-muted">
              {COLUMNS.map((column) => (
                <TableHead
                  key={column.label}
                  className={cn(
                    "h-10.5 px-4 text-xs/4 font-semibold tracking-wider text-muted-foreground uppercase",
                    column.cell,
                  )}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((discussion) => {
              // Posts have no lock yet, so a locked sample thread reads as open.
              const status =
                !FEATURES.threadLocks && discussion.status === "locked"
                  ? "open"
                  : discussion.status;
              const locked = status === "locked";
              return (
                <TableRow
                  key={discussion.id}
                  className={cn(
                    "border-border/30 hover:bg-primary/5 dark:border-border",
                    // Rows under report are tinted, as the Figma's spoiler thread is.
                    discussion.reports &&
                      "bg-[#fffbfb] hover:bg-[#fff5f4] dark:bg-destructive/5 dark:hover:bg-destructive/10",
                  )}
                >
                  <TableCell className="py-5 pr-4 pl-4 whitespace-normal">
                    <p
                      className={cn(
                        "flex items-center gap-1 text-sm/5 font-semibold",
                        locked && "text-muted-foreground",
                      )}
                    >
                      {discussion.title}
                      {discussion.status === "pinned" && (
                        <PushPinIcon
                          weight="bold"
                          role="img"
                          aria-label="Pinned"
                          className="size-4 shrink-0 text-caution-accent"
                        />
                      )}
                      {locked && (
                        <LockSimpleIcon
                          weight="bold"
                          role="img"
                          aria-label="Locked"
                          className="size-4 shrink-0 text-outline"
                        />
                      )}
                    </p>
                    <p
                      className={cn(
                        "mt-1 max-w-110 text-sm/5 text-muted-foreground",
                        locked && "text-outline",
                      )}
                    >
                      {discussion.excerpt}
                    </p>
                  </TableCell>
                  <TableCell className="px-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6 after:hidden">
                        <AvatarFallback
                          className={cn(
                            "bg-info-soft text-[10px] dark:bg-info-soft/15",
                            ON_INFO_SOFT,
                          )}
                        >
                          {initials(discussion.creator.name)}
                        </AvatarFallback>
                      </Avatar>
                      {/* The Figma stacks first and last names. */}
                      <span
                        className={cn(
                          "w-min text-sm/5 whitespace-normal",
                          locked && "text-muted-foreground",
                        )}
                      >
                        {discussion.creator.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 text-right whitespace-normal tabular-nums">
                    <Metrics discussion={discussion} />
                  </TableCell>
                  <TableCell className="pr-4 pl-8">
                    <DiscussionStatusBadge status={status} />
                  </TableCell>
                  <TableCell className="pr-6 pl-4 text-right">
                    <RowMenu
                      label={`Actions for ${discussion.title}`}
                      items={[
                        { label: "View discussion" },
                        {
                          label:
                            discussion.status === "pinned" ? "Unpin discussion" : "Pin discussion",
                        },
                        {
                          label: locked ? "Unlock thread" : "Lock thread",
                          feature: "threadLocks",
                        },
                        { label: "Delete discussion", destructive: true },
                      ]}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={COLUMNS.length}
                  className="h-24 text-center text-[13px] text-muted-foreground"
                >
                  No discussions match.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-border/30 py-3 pr-5 pl-4 dark:border-border">
          <p className="text-xs font-medium text-muted-foreground">
            {filteredTotal === 0
              ? "No discussions to show"
              : `Showing ${count.format(first)}-${count.format(last)} of ${count.format(filteredTotal)} ${filteredTotal === 1 ? "discussion" : "discussions"}`}
          </p>
          <PagePagination
            page={page}
            pageCount={pageCount}
            onPageChange={(next) => onChange({ page: next })}
            variant="text"
          />
        </div>
      </DashboardCard>
    </div>
  );
}

/** "142 Replies / 3.2k Views", or the reply count over the reports (red) for threads under report. */
function Metrics({ discussion }: { discussion: GroupDiscussion }) {
  return (
    <div className="ml-auto w-min text-muted-foreground">
      <p className="text-sm/5">
        {count.format(discussion.replies)} <span className="whitespace-nowrap">Replies</span>
      </p>
      {discussion.reports ? (
        <p className="text-xs/5 text-destructive">{count.format(discussion.reports)} Reports</p>
      ) : (
        discussion.views && <p className="text-xs/5">{discussion.views} Views</p>
      )}
    </div>
  );
}
