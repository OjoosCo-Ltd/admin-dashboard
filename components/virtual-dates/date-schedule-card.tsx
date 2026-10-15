"use client";

import { DotsThreeVerticalIcon, FunnelSimpleIcon, StarIcon, UserIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { parseAsInteger, parseAsStringLiteral, useQueryStates } from "nuqs";
import { useId } from "react";
import { toast } from "sonner";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { PagePagination } from "@/components/dashboard/page-pagination";
import { GavelIcon } from "@/components/icons/app-icons";
import { PairAvatars } from "@/components/dashboard/pair-avatars";
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
import type {
  DateAttendance,
  DateSessionStatus,
  DateStatusFilter,
  VirtualDateSession,
} from "@/types/virtual-dates";

const PAGE_SIZE = 10;

const STATUSES: { value: DateStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "completed", label: "Completed" },
  { value: "live", label: "Live" },
  { value: "upcoming", label: "Upcoming" },
  { value: "cancelled", label: "Cancelled" },
];

// Kept in the URL, so a filtered list can be shared and survives a reload.
const FILTERS = {
  status: parseAsStringLiteral(STATUSES.map((status) => status.value)).withDefault("all"),
  page: parseAsInteger.withDefault(1),
};

interface Filters {
  status: DateStatusFilter;
  page: number;
}

const ATTENDANCE: Record<DateAttendance, { label: string; className: string; dot: string }> = {
  both: {
    label: "Both Joined",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
    dot: "bg-emerald-600",
  },
  one: {
    label: "One Joined",
    className: "bg-[#e5eff2] text-action dark:bg-action/25 dark:text-primary",
    dot: "bg-action dark:bg-primary",
  },
  pending: {
    label: "Pending",
    className: "bg-[#fdede7] text-attention dark:bg-attention/15",
    dot: "bg-attention",
  },
  "no-show": {
    label: "No Show",
    className: "bg-destructive-soft text-destructive dark:bg-destructive/15",
    dot: "bg-destructive",
  },
};

const STATUS: Record<DateSessionStatus, { label: string; className: string }> = {
  completed: {
    label: "Completed",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
  live: {
    label: "Live",
    className: "border-action/25 bg-[#d4e5eb] text-action dark:bg-action/25 dark:text-primary",
  },
  upcoming: {
    label: "Upcoming",
    className: "border-border bg-container text-muted-foreground dark:bg-muted",
  },
  cancelled: {
    label: "Cancelled",
    className: "border-destructive/40 bg-[#fffbfb] text-destructive dark:bg-destructive/10",
  },
};

// The Figma's 1,122px table; it scrolls sideways below its minimum width.
const COLUMNS = [
  { label: "Date ID", width: "w-[10%]" },
  { label: "Participants", width: "w-[14%]" },
  { label: "Theme", width: "w-[10%]" },
  { label: "Scheduled time", width: "w-[12%]" },
  { label: "Duration", width: "w-[10%]" },
  { label: "Attendance", width: "w-[13%]" },
  { label: "Rating", width: "w-[9%]" },
  { label: "Status", width: "w-[12%]" },
  { label: "Actions", width: "w-[10%]", align: "text-center" },
];

const edges = "px-3 first:pl-6 last:pr-6";

const day = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
const clock = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});
const count = new Intl.NumberFormat("en-US");

interface CardProps {
  /** UI only: one sample page, filtered here. GET /admin/virtual-dates will page and filter. */
  sessions: VirtualDateSession[];
  /** Every session, for the count and pages while no filter is set. */
  totalCount: number;
}

/** The session list with its status filter, with the filter and page in the URL. */
export function DateScheduleCard(props: CardProps) {
  const [filters, setFilters] = useQueryStates(FILTERS);
  return <DateScheduleView {...props} filters={filters} onChange={(next) => setFilters(next)} />;
}

/** What renders before the URL is read: the unfiltered first page. */
export function DateScheduleFallback(props: CardProps) {
  return <DateScheduleView {...props} filters={{ status: "all", page: 1 }} onChange={() => {}} />;
}

function DateScheduleView({
  sessions,
  totalCount,
  filters,
  onChange,
}: CardProps & { filters: Filters; onChange: (next: Partial<Filters>) => void }) {
  const titleId = useId();
  const rows =
    filters.status === "all"
      ? sessions
      : sessions.filter((session) => session.status === filters.status);
  const total = filters.status === "all" ? totalCount : rows.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(filters.page, 1), pageCount);
  const first = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const last = Math.min(page * PAGE_SIZE, total);
  const selected = STATUSES.find((status) => status.value === filters.status) ?? STATUSES[0];

  // UI only: none of the session actions reach /admin/virtual-dates yet.
  const notYet = (action: string) => toast(`${action} isn't available yet`);

  return (
    <DashboardCard className="overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-6">
        <DashboardCardTitle id={titleId} className="text-xl leading-7">
          Virtual Date Schedule
        </DashboardCardTitle>
        <div className="flex items-center gap-4">
          <Select
            value={filters.status}
            onValueChange={(status) => onChange({ status: status as DateStatusFilter, page: 1 })}
          >
            <SelectTrigger
              aria-label={`Status: ${selected.label}`}
              className="h-9 gap-4 rounded-md border-0 bg-muted px-4 text-[17px] text-foreground data-[size=default]:h-9 dark:bg-muted [&_svg]:text-foreground [&_svg:not([class*='size-'])]:size-4.5"
            >
              <SelectValue>Status: {selected.label}</SelectValue>
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
            onClick={() => notYet("More filters")}
            className="flex size-9 items-center justify-center rounded-md text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <FunnelSimpleIcon aria-hidden weight="bold" className="size-6" />
          </button>
        </div>
      </div>

      <Table aria-labelledby={titleId} className="min-w-260">
        <colgroup>
          {COLUMNS.map((column) => (
            <col key={column.label} className={column.width} />
          ))}
        </colgroup>
        <TableHeader className="[&_tr]:border-muted-strong dark:[&_tr]:border-border">
          <TableRow className="border-t bg-[#f9f9fb] hover:bg-[#f9f9fb] dark:bg-muted/50 dark:hover:bg-muted/50">
            {COLUMNS.map((column) => (
              <TableHead
                key={column.label}
                className={cn(
                  "h-14.5 text-xs/4 font-semibold tracking-wider whitespace-normal text-muted-foreground uppercase",
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
          {rows.map((session) => {
            const attendance = ATTENDANCE[session.attendance];
            const status = STATUS[session.status];
            const [a, b] = session.participants;
            return (
              <TableRow key={session.id} className="border-muted-strong dark:border-border">
                <TableCell
                  className={cn(
                    edges,
                    "py-5 text-lg leading-6 whitespace-normal",
                    session.flagged ? "text-destructive" : "text-action dark:text-primary",
                  )}
                >
                  #{session.publicId}
                </TableCell>
                <TableCell className={cn(edges, "py-5")}>
                  <span className="flex items-center gap-2.5">
                    {session.flagged ? (
                      // Anonymised until a moderator opens the report.
                      <span aria-hidden className="flex shrink-0">
                        {[0, 1].map((index) => (
                          <span
                            key={index}
                            className={cn(
                              "flex size-7 items-center justify-center rounded-full bg-muted-strong text-muted-foreground ring-2 ring-card",
                              index === 1 && "-ml-2",
                            )}
                          >
                            <UserIcon weight="bold" className="size-3.5" />
                          </span>
                        ))}
                      </span>
                    ) : (
                      <PairAvatars users={session.participants} size="sm" />
                    )}
                    <span
                      className={cn(
                        "text-lg leading-6 font-bold whitespace-normal",
                        session.flagged ? "text-destructive" : "text-muted-foreground",
                      )}
                    >
                      {/* Each name stays whole, so a pair breaks after the ampersand. */}
                      <span className="whitespace-nowrap">{a.name} &amp;</span>{" "}
                      <span className="whitespace-nowrap">{b.name}</span>
                    </span>
                  </span>
                </TableCell>
                <TableCell className={cn(edges, "py-5 text-lg leading-6 whitespace-normal")}>
                  {session.title}
                </TableCell>
                <TableCell className={cn(edges, "py-5 whitespace-normal")}>
                  <time dateTime={session.startsAt} className="block text-[17px] leading-6">
                    {day.format(new Date(session.startsAt))}
                  </time>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {clock.format(new Date(session.startsAt))} -{" "}
                    {clock.format(new Date(session.endsAt))}
                  </span>
                </TableCell>
                <TableCell className={cn(edges, "py-5 text-lg tabular-nums")}>
                  {session.durationMinutes}m
                </TableCell>
                <TableCell className={cn(edges, "py-5")}>
                  <span
                    className={cn(
                      "inline-flex max-w-28 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] leading-4 font-bold whitespace-normal",
                      attendance.className,
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn("size-1.5 shrink-0 rounded-full", attendance.dot)}
                    />
                    {attendance.label}
                  </span>
                </TableCell>
                <TableCell className={cn(edges, "py-5")}>
                  {session.rating ? (
                    <span className="flex items-center gap-0.5 text-lg font-semibold text-[#f59e0c] tabular-nums">
                      <StarIcon aria-hidden weight="fill" className="size-4" />
                      <span className="sr-only">Rated </span>
                      {session.rating.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-lg text-muted-foreground">
                      <span aria-hidden>--</span>
                      <span className="sr-only">Not rated</span>
                    </span>
                  )}
                </TableCell>
                <TableCell className={cn(edges, "py-5")}>
                  <span
                    className={cn(
                      "inline-flex h-6.5 items-center rounded-md border px-2 text-[11px] font-bold tracking-wide uppercase",
                      status.className,
                    )}
                  >
                    {status.label}
                  </span>
                </TableCell>
                <TableCell className={cn(edges, "py-5 text-center")}>
                  {session.flagged ? (
                    <button
                      type="button"
                      aria-label={`Review reported session #${session.publicId}`}
                      onClick={() => notYet("Reviewing reported sessions")}
                      className="inline-flex size-9 items-center justify-center rounded-md text-destructive transition-colors outline-none hover:bg-destructive/10 focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <GavelIcon className="h-4.5 w-auto" />
                    </button>
                  ) : (
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger
                        aria-label={`Actions for session #${session.publicId}`}
                        className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=open]:bg-muted"
                      >
                        <DotsThreeVerticalIcon aria-hidden weight="bold" className="size-5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem onSelect={() => notYet("Session details")}>
                          View session details
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => notYet("Messaging participants")}>
                          Message participants
                        </DropdownMenuItem>
                        {(session.status === "upcoming" || session.status === "live") && (
                          <>
                            <DropdownMenuSeparator />
                            {/* POST /admin/virtual-dates/{id}/cancel isn't wired yet. */}
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() => notYet("Cancelling sessions")}
                            >
                              Cancel session
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                No sessions with this status.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-muted-strong bg-[#fbfcfd] px-6 py-6 dark:border-border dark:bg-muted/40">
        <p className="text-[13px] font-semibold text-muted-foreground">
          {total === 0
            ? "No sessions to show"
            : `Showing ${count.format(first)}-${count.format(last)} of ${count.format(total)} ${total === 1 ? "session" : "sessions"}`}
        </p>
        <PagePagination
          variant="compact"
          page={page}
          pageCount={pageCount}
          onPageChange={(next) => onChange({ page: next })}
        />
      </div>
    </DashboardCard>
  );
}
