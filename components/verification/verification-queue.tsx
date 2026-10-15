"use client";

import { CaretLeftIcon, CaretRightIcon, FunnelSimpleIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { parseAsInteger, parseAsStringLiteral, useQueryState } from "nuqs";
import { type ComponentProps, useId, useRef, useState } from "react";
import { toast } from "sonner";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { VerificationReviewSheet } from "@/components/verification/verification-review-sheet";
import {
  RISK_STYLES,
  type ScoreBand,
  scoreBand,
  STATUS_STYLES,
} from "@/components/verification/verification-styles";
import { initials } from "@/libs/utils";
import type { VerificationStatus } from "@/types/api";
import type { VerificationCase } from "@/types/verification";

const PAGE_SIZE = 10;

const STATUSES = [
  "PENDING",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "EXPIRED",
] as const satisfies readonly VerificationStatus[];

const STATUS_FILTERS = ["all", ...STATUSES] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number];

const isStatusFilter = (value: string): value is StatusFilter =>
  (STATUS_FILTERS as readonly string[]).includes(value);

// Widths from the Figma's 1,106px table. They're targets: a column still
// grows to fit its content, and the table scrolls sideways when it can't fit.
const COLUMNS = [
  { label: "User", width: "w-[16.7%]" },
  { label: "Govt ID Type", width: "w-[11.05%]" },
  { label: "Face Match", width: "w-[14.2%]" },
  { label: "Country", width: "w-[11%]" },
  { label: "Risk Level", width: "w-[10.45%]" },
  { label: "Status", width: "w-[11.75%]" },
  { label: "Reviewer", width: "w-[11.15%]" },
  { label: "Actions", width: "w-[13.7%]" },
];

const SCORE_STYLES: Record<ScoreBand, { bar: string; text: string }> = {
  pass: { bar: "bg-action dark:bg-primary", text: "text-action dark:text-primary" },
  review: {
    bar: "bg-review dark:bg-subtle-foreground",
    text: "text-review dark:text-subtle-foreground",
  },
  fail: { bar: "bg-destructive", text: "text-destructive" },
};

/** What the row's action says: open cases invite a review, decided ones show details. */
const ACTION_LABELS: Record<VerificationStatus, string> = {
  PENDING: "Review Now",
  UNDER_REVIEW: "Manage",
  APPROVED: "Details",
  REJECTED: "Details",
  EXPIRED: "Details",
};

const cell = "px-4 py-4 first:pl-6 last:pr-6";

// The Figma's text boxes are narrower than their columns, so names, ID types
// and reviewers break onto two or three lines. These widths reproduce that.
const wrapName = "max-w-20";
const wrapDocument = "max-w-16";
const wrapReviewer = "max-w-14";

const count = new Intl.NumberFormat("en-US");

/** Page buttons as the Figma shows them: 1 2 3 … 99, with the current page and its neighbours. */
function pageItems(page: number, pageCount: number): (number | "gap")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);
  const middle =
    page <= 1
      ? [1, 2, 3]
      : page >= pageCount
        ? [pageCount - 2, pageCount - 1, pageCount]
        : [page - 1, page, page + 1];
  const pages = [...new Set([1, ...middle, pageCount])].sort((a, b) => a - b);
  return pages.flatMap((value, index) => {
    const gap = value - (pages[index - 1] ?? value);
    // A gap of one page shows that page rather than an ellipsis.
    if (gap === 2) return [value - 1, value];
    return gap > 2 ? ["gap" as const, value] : [value];
  });
}

/**
 * The verification queue: status filter, the cases table and its pages. The
 * row actions open a case in the review sheet. Status, page and the open case
 * live in the URL (?status=, ?page=, ?case=), so a review link can be shared.
 */
export function VerificationQueue({
  cases,
  total,
  className,
}: {
  cases: VerificationCase[];
  /** Cases across every page. */
  total: number;
  className?: string;
}) {
  const titleId = useId();
  const [status, setStatus] = useQueryState(
    "status",
    parseAsStringLiteral(STATUS_FILTERS).withDefault("all"),
  );
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [caseId, setCaseId] = useQueryState("case");

  // UI only: filtering the sample rows stands in for /verification/admin/all's
  // `status` param, and every page shows the same sample rows.
  const rows = status === "all" ? cases : cases.filter((row) => row.status === status);
  const filteredTotal = status === "all" ? total : rows.length;
  const pageCount = Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), pageCount);
  const first = (currentPage - 1) * PAGE_SIZE + 1;
  const last = Math.min(currentPage * PAGE_SIZE, filteredTotal);

  const selected = cases.find((row) => row.caseId === caseId);
  // Keeps the last case on screen while the sheet animates closed.
  const [shown, setShown] = useState(selected);
  if (selected && selected !== shown) setShown(selected);
  // The row button that opened the sheet, to take focus back when it closes.
  const opener = useRef<HTMLButtonElement>(null);

  return (
    <DashboardCard
      className={cn("overflow-hidden border-border/30 p-0 dark:border-border", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/30 px-6 py-4 dark:border-border">
        <DashboardCardTitle id={titleId} className="text-xl/7 font-semibold">
          Verification Queue
        </DashboardCardTitle>
        <div className="flex items-center gap-3">
          <Select
            value={status}
            onValueChange={(value) => {
              if (!isStatusFilter(value)) return;
              void setStatus(value === "all" ? null : value);
              void setPage(null);
            }}
          >
            <SelectTrigger
              size="sm"
              aria-label="Filter by status"
              className="gap-2 rounded-md border-0 bg-muted pr-3 pl-4 text-[13px] font-semibold text-foreground dark:bg-muted"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="end">
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUSES.map((value) => (
                <SelectItem key={value} value={value}>
                  {STATUS_STYLES[value].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* UI only: there are no further filters to open yet. */}
          <Button
            variant="outline"
            size="icon"
            aria-label="More filters"
            onClick={() => toast("More filters aren't available yet")}
            className="size-7 rounded-md border-border/40 bg-transparent text-muted-foreground"
          >
            <FunnelSimpleIcon aria-hidden weight="bold" className="size-4.5" />
          </Button>
        </div>
      </div>

      <Table aria-labelledby={titleId} className="min-w-230">
        <colgroup>
          {COLUMNS.map((column) => (
            <col key={column.label} className={column.width} />
          ))}
        </colgroup>
        <TableHeader className="[&_tr]:border-b-0">
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            {COLUMNS.map((column) => (
              <TableHead
                key={column.label}
                className="h-auto px-4 py-4 text-base/6 font-semibold tracking-[0.06em] whitespace-normal text-muted-foreground uppercase first:pl-6 last:pr-6"
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="[&_tr:last-child]:border-b">
          {rows.map((row) => {
            const score = SCORE_STYLES[scoreBand(row.faceMatch)];
            const statusStyle = STATUS_STYLES[row.status];
            const primaryAction = row.status === "PENDING";

            return (
              <TableRow
                key={row.caseId}
                data-state={row.caseId === caseId ? "selected" : undefined}
                className="border-border/30 hover:bg-primary/5 data-[state=selected]:bg-primary/5 dark:border-border"
              >
                <TableCell className={cell}>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      {row.avatarUrl && <AvatarImage src={row.avatarUrl} alt="" />}
                      <AvatarFallback className="bg-accent text-xs font-semibold text-primary">
                        {initials(row.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 whitespace-normal">
                      <p className={cn("text-sm/5 font-medium text-foreground", wrapName)}>
                        {row.name}
                      </p>
                      <p className="text-xs/4 text-muted-foreground">ID: {row.caseId}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell
                  className={cn(cell, "text-sm/5 whitespace-normal text-muted-foreground")}
                >
                  <p className={wrapDocument}>{row.documentType}</p>
                </TableCell>
                <TableCell className={cell}>
                  <div className="flex items-center gap-2.5">
                    <span
                      aria-hidden
                      className="h-1.5 w-16 shrink-0 rounded-full bg-container dark:bg-muted"
                    >
                      <span
                        className={cn("block h-full rounded-full", score.bar)}
                        style={{ width: `${Math.min(100, Math.max(0, row.faceMatch))}%` }}
                      />
                    </span>
                    <span className={cn("text-xs font-bold", score.text)}>{row.faceMatch}%</span>
                  </div>
                </TableCell>
                <TableCell className={cn(cell, "text-sm text-foreground")}>{row.country}</TableCell>
                <TableCell className={cell}>
                  <span
                    className={cn(
                      "inline-flex h-5 items-center rounded-full px-2 text-[11px] font-bold tracking-wide uppercase",
                      RISK_STYLES[row.risk].className,
                    )}
                  >
                    {RISK_STYLES[row.risk].label}
                  </span>
                </TableCell>
                <TableCell className={cell}>
                  <span
                    className={cn(
                      "flex items-center gap-2 text-sm/5 whitespace-normal",
                      statusStyle.className,
                    )}
                  >
                    <span aria-hidden className="size-2 shrink-0 rounded-full bg-current" />
                    {statusStyle.label}
                  </span>
                </TableCell>
                <TableCell
                  className={cn(cell, "text-sm/5 whitespace-normal text-muted-foreground")}
                >
                  {row.reviewer ? (
                    <p className={wrapReviewer}>{row.reviewer}</p>
                  ) : (
                    <>
                      <span aria-hidden>—</span>
                      <span className="sr-only">Unassigned</span>
                    </>
                  )}
                </TableCell>
                <TableCell className={cell}>
                  {/* The Figma stacks "Review Now" in a narrow button; the others sit flush. */}
                  <button
                    type="button"
                    onClick={(event) => {
                      opener.current = event.currentTarget;
                      void setCaseId(row.caseId);
                    }}
                    className={cn(
                      "rounded-md text-[13px]/4 font-bold outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50",
                      primaryAction
                        ? "w-min px-2 text-center whitespace-normal text-action dark:text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    {ACTION_LABELS[row.status]}
                    <span className="sr-only">: {row.name}</span>
                  </button>
                </TableCell>
              </TableRow>
            );
          })}
          {rows.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={COLUMNS.length}
                className="h-24 text-center text-muted-foreground"
              >
                No verifications with this status.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 bg-muted/50 px-6 py-3">
        <p className="text-sm text-muted-foreground">
          {filteredTotal === 0
            ? "No entries"
            : `Showing ${first}-${last} of ${count.format(filteredTotal)} ${filteredTotal === 1 ? "entry" : "entries"}`}
        </p>
        <nav aria-label="Queue pages" className="flex items-center">
          <PageButton
            aria-label="Previous page"
            disabled={currentPage <= 1}
            onClick={() => void setPage(currentPage - 1 === 1 ? null : currentPage - 1)}
          >
            <CaretLeftIcon aria-hidden weight="bold" className="size-3.5" />
          </PageButton>
          {pageItems(currentPage, pageCount).map((item, index) =>
            item === "gap" ? (
              <span
                // At most two gaps, before and after the current page.
                key={`gap-${index}`}
                aria-hidden
                className="flex size-8 items-center justify-center text-base text-muted-foreground"
              >
                …
              </span>
            ) : (
              <PageButton
                key={item}
                aria-label={`Page ${item}`}
                aria-current={item === currentPage ? "page" : undefined}
                onClick={() => void setPage(item === 1 ? null : item)}
                className={cn(
                  "size-8 text-base font-semibold",
                  item === currentPage
                    ? "bg-primary text-primary-foreground hover:bg-primary"
                    : "text-muted-foreground",
                )}
              >
                {item}
              </PageButton>
            ),
          )}
          <PageButton
            aria-label="Next page"
            disabled={currentPage >= pageCount}
            onClick={() => void setPage(currentPage + 1)}
          >
            <CaretRightIcon aria-hidden weight="bold" className="size-3.5" />
          </PageButton>
        </nav>
      </div>

      <VerificationReviewSheet
        verification={shown}
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) void setCaseId(null);
        }}
        onCloseAutoFocus={(event) => {
          if (!opener.current?.isConnected) return;
          event.preventDefault();
          opener.current.focus();
        }}
      />
    </DashboardCard>
  );
}

function PageButton({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "flex size-9 items-center justify-center rounded-md text-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:text-outline/50",
        className,
      )}
      {...props}
    />
  );
}
