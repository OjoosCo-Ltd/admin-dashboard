"use client";

import { DotsThreeVerticalIcon, FunnelSimpleIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { parseAsInteger, parseAsStringLiteral, useQueryStates } from "nuqs";
import { useId, useRef } from "react";
import { toast } from "sonner";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { PagePagination } from "@/components/dashboard/page-pagination";
import { GavelIcon } from "@/components/icons/app-icons";
import { PairAvatars } from "@/components/dashboard/pair-avatars";
import {
  CONVERSATION_STYLES,
  MATCH_STATUS_STYLES,
  pairName,
} from "@/components/matches/match-parts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { FEATURES } from "@/constants/features";
import type { MatchDetail, MatchStatusFilter } from "@/types/matches";

const PAGE_SIZE = 10;

const STATUSES: { value: MatchStatusFilter; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "reported", label: "Reported" },
  { value: "pending", label: "Pending" },
];

// Kept in the URL, so a filtered list can be shared and survives a reload.
const FILTERS = {
  status: parseAsStringLiteral(STATUSES.map((status) => status.value)).withDefault("all"),
  page: parseAsInteger.withDefault(1),
};

interface Filters {
  status: MatchStatusFilter;
  page: number;
}

// The Figma's 1,106px table; it scrolls sideways below its minimum width.
const COLUMNS = [
  { label: "Match ID", width: "w-[11%]" },
  { label: "User A & User B", width: "w-[17%]" },
  { label: "Compatibility", width: "w-[17%]" },
  { label: "Match date", width: "w-[11%]" },
  { label: "Conv. status", width: "w-[15%]" },
  { label: "Status", width: "w-[14%]" },
  { label: "Actions", width: "w-[15%]", align: "text-center" },
];

const edges = "px-3.5 first:pl-6 last:pr-6";

const moment = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "UTC",
});
const count = new Intl.NumberFormat("en-US");

export type MatchAction = "insight" | "flag" | "remove" | "exclude";

interface CardProps {
  /** UI only: one sample page, filtered here. GET /admin/matching will page and filter. */
  matches: MatchDetail[];
  /** Every match, for the count and pages while no filter is set. */
  totalCount: number;
  /** Opens the insight sheet or a moderation dialog; `opener` gets focus back afterwards. */
  onAction: (action: MatchAction, match: MatchDetail, opener: HTMLElement) => void;
}

/** The match list with its status filter, with the filter and page in the URL. */
export function RecentMatchesCard(props: CardProps) {
  const [filters, setFilters] = useQueryStates(FILTERS);
  return <RecentMatchesView {...props} filters={filters} onChange={(next) => setFilters(next)} />;
}

/** What renders before the URL is read: the unfiltered first page. */
export function RecentMatchesFallback(props: CardProps) {
  return <RecentMatchesView {...props} filters={{ status: "all", page: 1 }} onChange={() => {}} />;
}

function RecentMatchesView({
  matches,
  totalCount,
  onAction,
  filters,
  onChange,
}: CardProps & { filters: Filters; onChange: (next: Partial<Filters>) => void }) {
  const titleId = useId();
  const rows =
    filters.status === "all" ? matches : matches.filter((match) => match.status === filters.status);
  const total = filters.status === "all" ? totalCount : rows.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(filters.page, 1), pageCount);
  const first = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const last = Math.min(page * PAGE_SIZE, total);

  return (
    <DashboardCard id="recent-matches" className="scroll-mt-6 overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-4 p-6">
        <DashboardCardTitle id={titleId} className="text-xl leading-7 font-semibold">
          Recent Matches
        </DashboardCardTitle>
        <div className="flex items-center gap-3">
          <Select
            value={filters.status}
            onValueChange={(status) => onChange({ status: status as MatchStatusFilter, page: 1 })}
          >
            <SelectTrigger
              aria-label="Filter by status"
              className="h-8.5 gap-6 rounded-md border-muted-strong bg-background px-4 text-[13px] text-foreground data-[size=default]:h-8.5 dark:border-border"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="end">
              {STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value} className="py-2 text-sm">
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* UI only: the Figma has no frame for the extra filters yet. */}
          <button
            type="button"
            aria-label="More filters"
            onClick={() => toast("More filters aren't available yet")}
            className="flex size-8.5 items-center justify-center rounded-md border border-muted-strong text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 dark:border-border"
          >
            <FunnelSimpleIcon aria-hidden weight="bold" className="size-4.5" />
          </button>
        </div>
      </div>

      <Table aria-labelledby={titleId} className="min-w-260">
        <colgroup>
          {COLUMNS.map((column) => (
            <col key={column.label} className={column.width} />
          ))}
        </colgroup>
        <TableHeader className="[&_tr]:border-b-0">
          <TableRow className="bg-container hover:bg-container dark:bg-muted dark:hover:bg-muted">
            {COLUMNS.map((column) => (
              <TableHead
                key={column.label}
                className={cn(
                  "h-20 text-base/6 font-semibold tracking-[0.06em] whitespace-normal text-muted-foreground uppercase",
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
          {rows.map((match) => {
            const status = MATCH_STATUS_STYLES[match.status];
            const conversation = CONVERSATION_STYLES[match.conversation];
            return (
              <TableRow key={match.id} className="border-muted-strong dark:border-border">
                <TableCell
                  className={cn(edges, "py-6 font-mono text-[15px] text-muted-foreground")}
                >
                  #{match.publicId}
                </TableCell>
                <TableCell className={cn(edges, "py-6")}>
                  <span className="flex items-center gap-4">
                    <PairAvatars users={match.users} />
                    <span className="text-[17px] leading-6 whitespace-normal">
                      {pairName(match.users)}
                    </span>
                  </span>
                </TableCell>
                <TableCell className={cn(edges, "py-6")}>
                  <span className="text-[11px] font-bold tabular-nums">{match.compatibility}%</span>
                  <span
                    aria-hidden
                    className="mt-1 block h-1.5 max-w-42 rounded-full bg-container dark:bg-muted"
                  >
                    <span
                      className={cn(
                        "block h-full rounded-full",
                        // The Figma marks a weak pairing in caution brown.
                        match.compatibility < 70 ? "bg-caution" : "bg-action dark:bg-primary",
                      )}
                      style={{ width: `${match.compatibility}%` }}
                    />
                  </span>
                </TableCell>
                <TableCell
                  className={cn(edges, "py-6 text-[17px] whitespace-normal text-muted-foreground")}
                >
                  <time dateTime={match.matchedAt}>{moment.format(new Date(match.matchedAt))}</time>
                </TableCell>
                <TableCell className={cn(edges, "py-6")}>
                  <span
                    className={cn(
                      "inline-block max-w-32 rounded-full px-3 py-0.5 text-center text-sm leading-5 whitespace-normal",
                      conversation.className,
                    )}
                  >
                    {conversation.label}
                  </span>
                </TableCell>
                <TableCell className={cn(edges, "py-6")}>
                  <span
                    className={cn(
                      "flex items-center gap-1.5 text-[17px] font-semibold",
                      status.text,
                    )}
                  >
                    <span aria-hidden className={cn("size-2 shrink-0 rounded-full", status.dot)} />
                    {status.label}
                  </span>
                </TableCell>
                <TableCell className={cn(edges, "py-6 text-center")}>
                  {FEATURES.matchFlags && match.status === "reported" ? (
                    <button
                      type="button"
                      aria-label={`Review reported match #${match.publicId}`}
                      onClick={(event) => onAction("insight", match, event.currentTarget)}
                      className="inline-flex size-9 items-center justify-center rounded-md text-destructive transition-colors outline-none hover:bg-destructive/10 focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <GavelIcon className="h-5.5 w-auto" />
                    </button>
                  ) : (
                    <RowMenu match={match} onAction={onAction} />
                  )}
                </TableCell>
              </TableRow>
            );
          })}
          {rows.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={COLUMNS.length}
                className="h-32 text-center text-muted-foreground"
              >
                No matches with this status.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 bg-muted px-6 py-6">
        <p className="text-[17px] text-muted-foreground">
          {total === 0
            ? "No matches to show"
            : `Showing ${count.format(first)}-${count.format(last)} of ${count.format(total)} ${total === 1 ? "match" : "matches"}`}
        </p>
        <PagePagination
          page={page}
          pageCount={pageCount}
          onPageChange={(next) => onChange({ page: next })}
        />
      </div>
    </DashboardCard>
  );
}

/** A row's ⋮ menu: the insight sheet and the moderation actions. */
function RowMenu({ match, onAction }: { match: MatchDetail; onAction: CardProps["onAction"] }) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  // Set when an item opens a sheet or dialog: that takes focus, so the menu mustn't take it back.
  const handedOff = useRef(false);

  const select = (action: MatchAction) => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    handedOff.current = true;
    onAction(action, match, trigger);
  };

  return (
    // Not modal: a modal menu locks scrolling, and hiding the scrollbar shifts the page.
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        ref={triggerRef}
        aria-label={`Actions for match #${match.publicId}`}
        className="inline-flex size-9 items-center justify-center rounded-md text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=open]:bg-muted"
      >
        <DotsThreeVerticalIcon aria-hidden weight="bold" className="size-6" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-52"
        onCloseAutoFocus={(event) => {
          if (handedOff.current) event.preventDefault();
          handedOff.current = false;
        }}
      >
        <DropdownMenuItem onSelect={() => select("insight")}>View match insight</DropdownMenuItem>
        {FEATURES.matchFlags && (
          <DropdownMenuItem onSelect={() => select("flag")}>Flag for review</DropdownMenuItem>
        )}
        {FEATURES.matchExclusion && (
          <DropdownMenuItem onSelect={() => select("exclude")}>
            Exclude future matching
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => select("remove")}>
          Remove match
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
