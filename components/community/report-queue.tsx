"use client";

import { ChatsIcon, LinkSimpleIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import Image from "next/image";
import { debounce, parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useId } from "react";

import {
  PriorityLabel,
  ReasonBadge,
  ReportStatusBadge,
} from "@/components/community/community-badges";
import { RowMenu } from "@/components/community/row-menu";
import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { PagePagination } from "@/components/dashboard/page-pagination";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { GroupReport } from "@/types/community";

const PAGE_SIZE = 10;

const FILTERS = {
  q: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
};

interface Filters {
  q: string;
  page: number;
}

/** The Figma's columns, less the empty one it leaves before Report ID. */
const COLUMNS = [
  { label: "Report ID", width: "w-[11%]", cell: "pl-6" },
  { label: "Reported Content", width: "w-[29%]" },
  { label: "Reason", width: "w-[13%]" },
  { label: "Reporter / Date", width: "w-[15%]" },
  { label: "Priority", width: "w-[10%]" },
  { label: "Status", width: "w-[13%]" },
  { label: "Actions", width: "w-[9%]", cell: "pr-6 text-right" },
];

interface ReportQueueProps {
  /** UI only: one sample page, filtered here. */
  reports: GroupReport[];
  /** Every open report, for the count and pages while no search is set. */
  total: number;
}

/** Active Reports: a search over the group's report queue and its pages, both in the URL (?q=, ?page=). */
export function ReportQueue(props: ReportQueueProps) {
  const [filters, setFilters] = useQueryStates(FILTERS);
  return (
    <ReportQueueView
      {...props}
      filters={filters}
      onChange={(next, { debounced = false } = {}) =>
        setFilters(next, debounced ? { limitUrlUpdates: debounce(300) } : undefined)
      }
    />
  );
}

/** What renders before the URL is read: the whole queue. */
export function ReportQueueFallback(props: ReportQueueProps) {
  return <ReportQueueView {...props} filters={{ q: "", page: 1 }} onChange={() => {}} />;
}

function ReportQueueView({
  reports,
  total,
  filters,
  onChange,
}: ReportQueueProps & {
  filters: Filters;
  onChange: (next: Partial<Filters>, options?: { debounced?: boolean }) => void;
}) {
  const titleId = useId();
  const query = filters.q.trim().toLowerCase().replace(/^#/, "");

  // UI only: GET /admin/community/reports isn't wired, so the sample page is
  // searched here and every page shows the same rows.
  const rows = reports.filter(
    (report) =>
      query === "" ||
      [report.id, report.reporter, report.source].some((field) =>
        field.toLowerCase().includes(query),
      ),
  );
  const filteredTotal = query !== "" ? rows.length : total;
  const pageCount = Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE));
  const page = Math.min(Math.max(filters.page, 1), pageCount);
  // The Figma counts the rows on screen: "Showing 1 to 3 of 42 entries".
  const first = filteredTotal === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const last = first === 0 ? 0 : first + Math.min(rows.length, PAGE_SIZE) - 1;

  return (
    <DashboardCard className="overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 max-sm:px-4">
        <DashboardCardTitle id={titleId} className="text-xl/7 font-semibold">
          Active Reports
        </DashboardCardTitle>
        <div className="relative w-full sm:w-48">
          <MagnifyingGlassIcon
            aria-hidden
            weight="bold"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            aria-label="Search reports by ID or user"
            placeholder="Search ID or User..."
            value={filters.q}
            onChange={(event) => onChange({ q: event.target.value, page: 1 }, { debounced: true })}
            className="h-8 rounded-md bg-surface pl-9 text-sm placeholder:text-subtle-foreground md:text-sm dark:bg-input/30"
          />
        </div>
      </div>

      <Table aria-labelledby={titleId} className="min-w-230">
        <colgroup>
          {COLUMNS.map((column) => (
            <col key={column.label} className={column.width} />
          ))}
        </colgroup>
        <TableHeader className="[&_tr]:border-y">
          <TableRow className="bg-muted hover:bg-muted">
            {COLUMNS.map((column) => (
              <TableHead
                key={column.label}
                className={cn(
                  "h-10.5 px-4 text-xs/4 font-medium tracking-wider text-muted-foreground uppercase",
                  column.cell,
                )}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((report) => (
            <TableRow key={report.id} className="hover:bg-primary/5">
              <TableCell className="py-3 pr-4 pl-6 text-sm font-medium">#{report.id}</TableCell>
              <TableCell className="px-4">
                <div className="flex items-center gap-4">
                  <ContentTile report={report} />
                  <div className="min-w-0">
                    <p className="max-w-70 truncate text-sm/5">{report.content}</p>
                    <p className="truncate text-xs/4 text-muted-foreground">{report.source}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-4 whitespace-normal">
                <ReasonBadge reason={report.reason} />
              </TableCell>
              <TableCell className="px-4 whitespace-normal">
                <p className="text-sm/5">{report.reporter}</p>
                {/* The Figma lets the time wrap: "Yesterday, 11:20 / PM". */}
                <p className="max-w-30 text-xs/4 text-muted-foreground">{report.reportedAt}</p>
              </TableCell>
              <TableCell className="px-4">
                <PriorityLabel priority={report.priority} />
              </TableCell>
              <TableCell className="px-4">
                <ReportStatusBadge status={report.status} />
              </TableCell>
              <TableCell className="pr-6 pl-4 text-right">
                <RowMenu
                  label={`Actions for report #${report.id}`}
                  items={[
                    { label: "Review report" },
                    { label: "Dismiss report" },
                    { label: "Remove content", destructive: true },
                    { label: "Ban author from group", destructive: true },
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
                No reports match this search.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t px-6 py-3 max-sm:px-4">
        <p className="text-sm text-muted-foreground">
          {filteredTotal === 0
            ? "No reports to show"
            : `Showing ${first} to ${last} of ${filteredTotal} ${filteredTotal === 1 ? "entry" : "entries"}`}
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

/** What was reported: a comment or link glyph on a grey tile, or the photo itself, blurred. */
function ContentTile({ report }: { report: GroupReport }) {
  const tile = "size-8 shrink-0 overflow-hidden rounded-md bg-container dark:bg-muted";
  if (report.kind === "image" && report.imageUrl) {
    return (
      // The tile clips the blur's soft edge.
      <span className={tile}>
        <Image
          src={report.imageUrl}
          alt=""
          width={32}
          height={32}
          className="size-full scale-125 object-cover blur-[3px]"
        />
      </span>
    );
  }
  const Glyph = report.kind === "link" ? LinkSimpleIcon : ChatsIcon;
  return (
    <span aria-hidden className={cn(tile, "flex items-center justify-center text-outline")}>
      <Glyph weight="bold" className="size-4.5" />
    </span>
  );
}
