"use client";

import { DownloadSimpleIcon, FunnelSimpleIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { parseAsInteger, parseAsStringLiteral, useQueryStates } from "nuqs";
import { useId } from "react";
import { toast } from "sonner";

import {
  ModerationPriorityBadge,
  ModerationStatusBadge,
} from "@/components/community/community-badges";
import { RowMenu } from "@/components/community/row-menu";
import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { PagePagination } from "@/components/dashboard/page-pagination";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { enabled, FEATURES, type Feature } from "@/constants/features";
import type { ModerationCase } from "@/types/community";

const PAGE_SIZE = 10;

const PRIORITIES = [
  { value: "all", label: "All Priorities" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
] as const;

type PriorityFilter = (typeof PRIORITIES)[number]["value"];

const FILTERS = {
  priority: parseAsStringLiteral(PRIORITIES.map((option) => option.value)).withDefault("all"),
  page: parseAsInteger.withDefault(1),
};

interface Filters {
  priority: PriorityFilter;
  page: number;
}

const isPriority = (value: string): value is PriorityFilter =>
  PRIORITIES.some((option) => option.value === value);

// The Figma's columns, stretched from its 978px table to the card's width.
// Without Priority, Reported Content takes its share: the ID, community and
// reporter stack at their breaks by design, so they don't need it.
const COLUMNS = enabled<{ label: string; width: string; cell?: string; feature?: Feature }>([
  { label: "Report ID", width: "w-[8%]", cell: "pl-4" },
  { label: "Reported Content", width: FEATURES.reportPriority ? "w-[23%]" : "w-[32.5%]" },
  { label: "Community", width: "w-[10.5%]" },
  { label: "Reporter", width: "w-[9%]" },
  { label: "Reason", width: "w-[12.5%]" },
  { label: "Submitted", width: "w-[10%]" },
  { label: "Priority", width: "w-[9.5%]", feature: "reportPriority" },
  { label: "Status", width: "w-[8.5%]" },
  { label: "Actions", width: "w-[9%]", cell: "pr-6 text-right" },
]);

const count = new Intl.NumberFormat("en-US");

const toolButton =
  "h-8 rounded-md border-[#e3e7eb] bg-muted text-foreground shadow-none hover:bg-muted-strong dark:border-border dark:bg-muted";

interface ModerationQueueProps {
  /** UI only: one sample page, filtered here. */
  cases: ModerationCase[];
  /** Every open case, for the count and pages while no filter is set. */
  total: number;
}

/**
 * Moderation Queue: reports from every community, filtered by priority, with
 * an export. The priority and page live in the URL (?priority=, ?page=).
 */
export function ModerationQueue(props: ModerationQueueProps) {
  const [filters, setFilters] = useQueryStates(FILTERS);
  return <ModerationQueueView {...props} filters={filters} onChange={(next) => setFilters(next)} />;
}

/** What renders before the URL is read: the whole queue. */
export function ModerationQueueFallback(props: ModerationQueueProps) {
  return (
    <ModerationQueueView {...props} filters={{ priority: "all", page: 1 }} onChange={() => {}} />
  );
}

function ModerationQueueView({
  cases,
  total,
  filters,
  onChange,
}: ModerationQueueProps & {
  filters: Filters;
  onChange: (next: Partial<Filters>) => void;
}) {
  const titleId = useId();
  // While the filter is hidden, an old link's ?priority= is ignored.
  const priority = FEATURES.reportPriority ? filters.priority : "all";

  // UI only: GET /admin/community/reports isn't wired, so the sample page is
  // filtered here and every page shows the same rows.
  const rows = cases.filter((item) => priority === "all" || item.priority === priority);
  const filteredTotal = priority === "all" ? total : rows.length;
  const pageCount = Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE));
  const page = Math.min(Math.max(filters.page, 1), pageCount);
  // The Figma counts the rows on screen: "Showing 1 to 3 of 142 entries".
  const first = filteredTotal === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const last = first === 0 ? 0 : first + Math.min(rows.length, PAGE_SIZE) - 1;

  return (
    <DashboardCard className="overflow-hidden p-0 shadow-[0_2px_6px_rgb(24_28_30/0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4">
        <DashboardCardTitle id={titleId} className="text-xl/7 font-semibold">
          Moderation Queue
        </DashboardCardTitle>
        {(FEATURES.reportPriority || FEATURES.exports) && (
          <div className="flex gap-3">
            {FEATURES.reportPriority && (
              <Select
                value={filters.priority}
                onValueChange={(value) => {
                  if (isPriority(value)) onChange({ priority: value, page: 1 });
                }}
              >
                <SelectTrigger
                  aria-label="Filter by priority"
                  className={cn(
                    toolButton,
                    "w-auto gap-2 pr-3 pl-3.5 text-[15px] data-[size=default]:h-8 md:text-[15px] [&>svg:last-child]:text-foreground",
                  )}
                >
                  <FunnelSimpleIcon aria-hidden weight="bold" className="size-4 text-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="end">
                  {PRIORITIES.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="py-2">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {FEATURES.exports && (
              <Button
                variant="outline"
                // UI only: there's no export route for the queue yet.
                onClick={() => toast("Exporting the moderation queue isn't available yet")}
                className={cn(toolButton, "gap-2 px-3.5 text-sm font-semibold")}
              >
                <DownloadSimpleIcon aria-hidden weight="bold" className="size-4" />
                Export
              </Button>
            )}
          </div>
        )}
      </div>

      <Table
        aria-labelledby={titleId}
        className={FEATURES.reportPriority ? "min-w-245" : "min-w-222"}
      >
        <colgroup>
          {COLUMNS.map((column) => (
            <col key={column.label} className={column.width} />
          ))}
        </colgroup>
        <TableHeader className="[&_tr]:border-y [&_tr]:border-border/30 dark:[&_tr]:border-border">
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            {COLUMNS.map((column) => (
              <TableHead
                key={column.label}
                className={cn(
                  "h-14 px-3 text-xs/4 font-semibold tracking-wider whitespace-normal text-muted-foreground uppercase",
                  column.cell,
                )}
              >
                {/* "Report ID" stacks, as in the Figma. */}
                <span className={cn(column.label === "Report ID" && "inline-block w-min")}>
                  {column.label}
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((item) => (
            <TableRow
              key={item.id}
              className="border-border/30 text-base/6 hover:bg-primary/5 dark:border-border"
            >
              {/* The Figma stacks the ID, community and reporter at their breaks: "#REP- / 1024". */}
              <TableCell className="py-2 pr-3 pl-4 whitespace-normal">
                <span className="block w-min">#{item.id}</span>
              </TableCell>
              <TableCell className="px-3">
                <p className="max-w-60 truncate font-medium">{item.content}</p>
              </TableCell>
              <TableCell className="px-3 whitespace-normal text-muted-foreground">
                <span className="block w-min">{item.community}</span>
              </TableCell>
              <TableCell className="px-3 whitespace-normal">
                <span className="block w-min">{item.reporter}</span>
              </TableCell>
              <TableCell className="px-3">{item.reason}</TableCell>
              <TableCell className="px-3 text-muted-foreground">{item.submitted}</TableCell>
              {FEATURES.reportPriority && (
                <TableCell className="px-3">
                  <ModerationPriorityBadge priority={item.priority} />
                </TableCell>
              )}
              <TableCell className="px-3">
                <ModerationStatusBadge status={item.status} />
              </TableCell>
              <TableCell className="pr-6 pl-3 text-right">
                <RowMenu
                  label={`Actions for report #${item.id}`}
                  items={[
                    { label: "Review case" },
                    { label: "Dismiss report" },
                    { label: "Remove content", destructive: true },
                    { label: "Suspend author", destructive: true },
                  ]}
                />
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={COLUMNS.length}
                className="h-24 text-center text-[13px] text-muted-foreground"
              >
                {FEATURES.reportPriority ? "No reports at this priority." : "No reports to review."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-border/30 py-3 pr-5 pl-4 dark:border-border">
        <p className="text-[13px] text-muted-foreground">
          {filteredTotal === 0
            ? "No reports to show"
            : `Showing ${first} to ${last} of ${count.format(filteredTotal)} ${filteredTotal === 1 ? "entry" : "entries"}`}
        </p>
        <PagePagination
          page={page}
          pageCount={pageCount}
          onPageChange={(next) => onChange({ page: next })}
          variant="solid"
        />
      </div>
    </DashboardCard>
  );
}
