"use client";

import {
  DotsThreeVerticalIcon,
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { cn } from "cn";
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { useId, useRef } from "react";
import { toast } from "sonner";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { PagePagination } from "@/components/dashboard/page-pagination";
import { ReportSheet } from "@/components/reports/report-sheet";
import {
  CATEGORY_LABELS,
  formatAgo,
  PRIORITY,
  reportInitials,
  riskTone,
  STATUS,
} from "@/components/reports/report-styles";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { ReportPriority, ReportStatus, SafetyReport } from "@/types/reports";

const PAGE_SIZE = 10;
const PRIORITIES = ["all", "critical", "high", "medium", "low"] as const;
const STATUSES = ["all", "new", "reviewing", "resolved", "dismissed"] as const;

// Kept in the URL, so a filtered queue or an open report can be shared and survives a reload.
const FILTERS = {
  q: parseAsString.withDefault(""),
  priority: parseAsStringLiteral(PRIORITIES).withDefault("all"),
  status: parseAsStringLiteral(STATUSES).withDefault("all"),
  page: parseAsInteger.withDefault(1),
  report: parseAsString,
};

interface Filters {
  q: string;
  priority: (typeof PRIORITIES)[number];
  status: (typeof STATUSES)[number];
  page: number;
  report: string | null;
}

const DEFAULTS: Filters = { q: "", priority: "all", status: "all", page: 1, report: null };

interface QueueProps {
  /** UI only: one sample page, filtered here. */
  reports: SafetyReport[];
  /** Every open report, for the count and pages while no filter is set. */
  totalCount: number;
}

/** The moderation queue, with its search, filters, page and open report in the URL. */
export function ReportQueue(props: QueueProps) {
  const [filters, setFilters] = useQueryStates(FILTERS);
  return <QueueView {...props} filters={filters} onChange={(next) => setFilters(next)} />;
}

/** What renders before the URL is read: the unfiltered first page. */
export function ReportQueueFallback(props: QueueProps) {
  return <QueueView {...props} filters={DEFAULTS} onChange={() => {}} />;
}

const head =
  "py-4 text-[11px] leading-4 font-bold tracking-widest text-review uppercase dark:text-subtle-foreground";

function QueueView({
  reports,
  totalCount,
  filters,
  onChange,
}: QueueProps & { filters: Filters; onChange: (next: Partial<Filters>) => void }) {
  const titleId = useId();
  // The row button that opened the sheet, so focus can go back to it.
  const opener = useRef<HTMLElement | null>(null);
  const query = filters.q.trim().toLowerCase();

  const filtered = reports.filter(
    (report) =>
      (!query ||
        [report.id, report.reportedUser.name, report.reportedUser.uid, report.reporter.name]
          .join(" ")
          .toLowerCase()
          .includes(query)) &&
      (filters.priority === "all" || report.priority === filters.priority) &&
      (filters.status === "all" || report.status === filters.status),
  );
  const filtering = Boolean(query) || filters.priority !== "all" || filters.status !== "all";
  // Unfiltered, every page shows the same sample rows; filtered, the matches are paged here.
  const total = filtering ? filtered.length : totalCount;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(filters.page, 1), pageCount);
  const rows = filtering ? filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : filtered;
  const first = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const last = Math.min(page * PAGE_SIZE, total);
  const open = reports.find((report) => report.id === filters.report) ?? null;

  const openReport = (report: SafetyReport, from: HTMLElement) => {
    opener.current = from;
    onChange({ report: report.id });
  };

  return (
    <DashboardCard className="overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-6 sm:px-8">
        <div>
          <DashboardCardTitle id={titleId} className="text-xl leading-7 font-semibold">
            Live Reports Queue
          </DashboardCardTitle>
          <p className="mt-0.5 text-sm text-muted-foreground">Real-time moderation workflow.</p>
        </div>
        <div className="flex items-center gap-3 max-sm:w-full">
          <div className="relative max-sm:flex-1">
            <MagnifyingGlassIcon
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              aria-label="Search reports"
              value={filters.q}
              onChange={(event) => onChange({ q: event.target.value, page: 1 })}
              placeholder="Search report ID or user..."
              className="h-9 w-64 rounded-xl border-0 bg-muted pl-10 text-[15px] max-sm:w-full md:text-[15px] dark:bg-muted/60"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Filter reports"
              className={cn(
                "relative flex size-9 shrink-0 items-center justify-center rounded-full border border-[#dbe1e5] outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 dark:border-border",
                (filters.priority !== "all" || filters.status !== "all") &&
                  "border-action text-action",
              )}
            >
              <FunnelSimpleIcon aria-hidden weight="bold" className="size-4.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Priority</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={filters.priority}
                onValueChange={(priority) =>
                  onChange({ priority: priority as Filters["priority"], page: 1 })
                }
              >
                {PRIORITIES.map((value) => (
                  <DropdownMenuRadioItem key={value} value={value}>
                    {value === "all" ? "Any priority" : PRIORITY[value as ReportPriority].label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={filters.status}
                onValueChange={(status) =>
                  onChange({ status: status as Filters["status"], page: 1 })
                }
              >
                {STATUSES.map((value) => (
                  <DropdownMenuRadioItem key={value} value={value}>
                    {value === "all" ? "Any status" : STATUS[value as ReportStatus].label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <table aria-labelledby={titleId} className="w-full min-w-260 text-left">
          <thead className="bg-[#f9f9fb] dark:bg-muted/40">
            <tr>
              <th scope="col" className={cn(head, "w-[9%] pl-8")}>
                Report ID
              </th>
              <th scope="col" className={cn(head, "w-[17%] pl-3")}>
                Reported User
              </th>
              <th scope="col" className={cn(head, "w-[13%]")}>
                Reporter
              </th>
              <th scope="col" className={cn(head, "w-[13%] pl-3")}>
                Category
              </th>
              <th scope="col" className={cn(head, "w-[6%] text-center")}>
                AI Risk
              </th>
              <th scope="col" className={cn(head, "w-[11%] pl-5")}>
                Priority
              </th>
              <th scope="col" className={cn(head, "w-[11%]")}>
                Submitted
              </th>
              <th scope="col" className={cn(head, "w-[12%]")}>
                Status
              </th>
              <th scope="col" className={cn(head, "pr-6 text-right")}>
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 dark:divide-border">
            {rows.map((report) => {
              const priority = PRIORITY[report.priority];
              const status = STATUS[report.status];
              return (
                <tr key={report.id} className="hover:bg-muted/40">
                  <td className="py-5 pl-8">
                    <button
                      type="button"
                      onClick={(event) => openReport(report, event.currentTarget)}
                      aria-label={`Review report ${report.id}`}
                      className="rounded-sm text-left text-xs leading-4 font-bold tracking-wider text-action outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 dark:text-primary"
                    >
                      <span className="block">#{report.id.split("-")[0]}-</span>
                      <span className="block">{report.id.split("-").slice(1).join("-")}</span>
                    </button>
                  </td>
                  <td className="py-5 pl-3">
                    <span className="flex items-center gap-3">
                      <PersonAvatar
                        name={report.reportedUser.name}
                        url={report.reportedUser.avatarUrl}
                        className="size-8"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm leading-5 font-semibold">
                          {report.reportedUser.name}
                        </span>
                        <span className="block text-[11px] text-muted-foreground">
                          UID: {report.reportedUser.uid}
                        </span>
                      </span>
                    </span>
                  </td>
                  <td className="py-5 pr-3">
                    {report.reporter.kind === "member" ? (
                      <span className="flex items-center gap-2">
                        <PersonAvatar
                          name={report.reporter.name}
                          url={report.reporter.avatarUrl}
                          className="size-6"
                        />
                        <span className="max-w-24 text-sm leading-5">{report.reporter.name}</span>
                      </span>
                    ) : (
                      <span className="block max-w-28 text-xs leading-4 text-muted-foreground">
                        {report.reporter.name}
                      </span>
                    )}
                  </td>
                  <td className="py-5 pl-3">
                    <span className="inline-flex h-6.5 items-center rounded-full bg-muted-strong px-3 text-xs font-semibold text-muted-foreground dark:bg-muted">
                      {CATEGORY_LABELS[report.category]}
                    </span>
                  </td>
                  <td className="py-5 text-center">
                    <span
                      className={cn(
                        "inline-flex h-6 min-w-8 items-center justify-center rounded-md px-1.5 text-[13px] font-bold tabular-nums",
                        riskTone(report.aiRisk),
                      )}
                    >
                      <span className="sr-only">AI risk </span>
                      {report.aiRisk}
                    </span>
                  </td>
                  <td className={cn("py-5 pl-5", priority.className)}>
                    <span className="flex items-center gap-2 text-xs font-bold tracking-wide uppercase">
                      <span aria-hidden className="size-1.5 rounded-full bg-current" />
                      {priority.label}
                    </span>
                  </td>
                  <td className="py-5 text-[13px] text-muted-foreground">
                    <time dateTime={report.submittedAt}>{formatAgo(report.submittedAt)}</time>
                  </td>
                  <td className="py-5">
                    <span
                      className={cn(
                        "inline-flex h-5.5 items-center rounded-full px-3 text-[10px] font-bold tracking-wider uppercase",
                        status.className,
                      )}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="py-5 pr-4 text-right">
                    <RowActions report={report} onReview={openReport} />
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="h-32 text-center text-muted-foreground">
                  No reports match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/40 px-6 py-5 dark:border-border">
        <p className="text-[13px] text-muted-foreground">
          Showing {first}-{last} of {total.toLocaleString("en-US")} reports
        </p>
        <PagePagination
          variant="mini"
          page={page}
          pageCount={pageCount}
          onPageChange={(next) => onChange({ page: next })}
        />
      </div>

      <ReportSheet
        report={open}
        onOpenChange={(next) => {
          if (!next) onChange({ report: null });
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          // Opened from a shared link, there's no opener: fall back to the row's ID button.
          const row = document.querySelector<HTMLElement>(
            `button[aria-label="Review report ${open?.id}"]`,
          );
          (opener.current ?? row)?.focus();
          opener.current = null;
        }}
      />
    </DashboardCard>
  );
}

function PersonAvatar({
  name,
  url,
  className,
}: {
  name: string;
  url?: string;
  className?: string;
}) {
  return (
    <Avatar className={className}>
      {url && <AvatarImage src={url} alt="" />}
      <AvatarFallback className="bg-container text-[11px] font-semibold text-muted-foreground dark:bg-muted">
        {reportInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

/** A row's ⋮ menu. Review opens the sheet and hands focus back to this trigger after. */
function RowActions({
  report,
  onReview,
}: {
  report: SafetyReport;
  onReview: (report: SafetyReport, from: HTMLElement) => void;
}) {
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        ref={trigger}
        aria-label={`Actions for report ${report.id}`}
        className="inline-flex size-8 items-center justify-center rounded-md text-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <DotsThreeVerticalIcon aria-hidden weight="bold" className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-44"
        // The sheet takes focus from here and hands it back to the trigger on close.
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <DropdownMenuItem
          onSelect={() => {
            if (trigger.current) onReview(report, trigger.current);
          }}
        >
          Review report
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast("Assigning reports isn't available yet")}>
          Assign to me
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => toast("Dismissing reports isn't available yet")}>
          Dismiss
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
