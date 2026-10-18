"use client";

import {
  CaretDownIcon,
  EyeIcon,
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { cn } from "cn";
import {
  debounce,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { type ReactNode, useId, useRef, useState } from "react";

import { EventStatusBadge } from "@/components/community/community-badges";
import { EventSheet } from "@/components/community/event-sheet";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { PagePagination } from "@/components/dashboard/page-pagination";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SAMPLE_EVENT_COMMUNITIES } from "@/constants/community-sample";
import type { CommunityEvent } from "@/types/community";

const PAGE_SIZE = 10;

const STATUSES = [
  { value: "all", label: "All statuses" },
  { value: "upcoming", label: "Upcoming" },
  { value: "live", label: "Live" },
  { value: "completed", label: "Completed" },
  { value: "draft", label: "Draft" },
  { value: "cancelled", label: "Cancelled" },
] as const;

/** The backend's `timeframe` filter (UPCOMING, PAST), with Live in between. */
const DATES = [
  { value: "any", label: "Any date" },
  {
    value: "upcoming",
    label: "Upcoming",
    test: (event: CommunityEvent) => event.status === "upcoming",
  },
  {
    value: "now",
    label: "Happening now",
    test: (event: CommunityEvent) => event.status === "live",
  },
  { value: "past", label: "Past", test: (event: CommunityEvent) => event.status === "completed" },
] as const;

/** How full the event is, against its capacity. Unlimited events count as having room. */
const ATTENDANCE = [
  { value: "any", label: "Any attendance", min: 0, max: Infinity },
  { value: "full", label: "Nearly full (80%+)", min: 0.8, max: Infinity },
  { value: "filling", label: "Filling up (25–80%)", min: 0.25, max: 0.8 },
  { value: "open", label: "Plenty of room (under 25%)", min: 0, max: 0.25 },
] as const;

const TYPES = [
  { value: "all", label: "All types" },
  { value: "virtual", label: "Virtual" },
  { value: "physical", label: "In person" },
] as const;

const GROUPS = [
  { value: "all", label: "All communities" },
  ...SAMPLE_EVENT_COMMUNITIES.map((community) => ({
    value: community.name,
    label: community.name,
  })),
];

// Kept in the URL, so a filtered list (and the open event) can be shared.
const FILTERS = {
  q: parseAsString.withDefault(""),
  status: parseAsStringLiteral(STATUSES.map((option) => option.value)).withDefault("all"),
  date: parseAsStringLiteral(DATES.map((option) => option.value)).withDefault("any"),
  attendance: parseAsStringLiteral(ATTENDANCE.map((option) => option.value)).withDefault("any"),
  group: parseAsString.withDefault("all"),
  type: parseAsStringLiteral(TYPES.map((option) => option.value)).withDefault("all"),
  page: parseAsInteger.withDefault(1),
  event: parseAsString,
};

interface Filters {
  q: string;
  status: (typeof STATUSES)[number]["value"];
  date: (typeof DATES)[number]["value"];
  attendance: (typeof ATTENDANCE)[number]["value"];
  group: string;
  type: (typeof TYPES)[number]["value"];
  page: number;
  event: string | null;
}

const DEFAULT_FILTERS: Filters = {
  q: "",
  status: "all",
  date: "any",
  attendance: "any",
  group: "all",
  type: "all",
  page: 1,
  event: null,
};

/** The Figma's columns, less the empty one it leaves before Event. */
const COLUMNS = [
  { label: "Event", width: "w-[30%]", cell: "pl-6" },
  { label: "Date & Time", width: "w-[13%]" },
  { label: "Community", width: "w-[16%]" },
  { label: "Attendees", width: "w-[10%]" },
  { label: "Capacity", width: "w-[10%]" },
  { label: "Status", width: "w-[12%]" },
  { label: "Actions", width: "w-[9%]", cell: "pr-6 text-right" },
];

const count = new Intl.NumberFormat("en-US");

interface EventTableProps {
  /** UI only: one sample page, filtered here. */
  events: CommunityEvent[];
  /** Every event, for the count and pages while no filter is set. */
  total: number;
}

/**
 * Community Events: search and five filters over the events and their pages,
 * each opening in the side sheet. The filters, page and open event live in
 * the URL (?q=, ?status=, ?date=, ?attendance=, ?group=, ?type=, ?page=, ?event=).
 */
export function EventTable(props: EventTableProps) {
  const [filters, setFilters] = useQueryStates(FILTERS);
  return (
    <EventTableView
      {...props}
      filters={filters}
      onChange={(next, { debounced = false } = {}) =>
        // Typing waits for a pause before writing the URL; the list itself updates at once.
        setFilters(next, debounced ? { limitUrlUpdates: debounce(300) } : undefined)
      }
    />
  );
}

/** What renders before the URL is read: every event, no sheet. */
export function EventTableFallback(props: EventTableProps) {
  return <EventTableView {...props} filters={DEFAULT_FILTERS} onChange={() => {}} />;
}

function EventTableView({
  events,
  total,
  filters,
  onChange,
}: EventTableProps & {
  filters: Filters;
  onChange: (next: Partial<Filters>, options?: { debounced?: boolean }) => void;
}) {
  const tableId = useId();
  const query = filters.q.trim().toLowerCase();
  const date = DATES.find((option) => option.value === filters.date);
  const attendance =
    ATTENDANCE.find((option) => option.value === filters.attendance) ?? ATTENDANCE[0];
  const filtered =
    query !== "" ||
    filters.status !== "all" ||
    filters.date !== "any" ||
    filters.attendance !== "any" ||
    filters.group !== "all" ||
    filters.type !== "all";

  // UI only: the backend lists events only on the members' side
  // (GET /community/events, by type and timeframe), so the sample page is
  // filtered here and every page shows the same rows.
  const rows = events.filter((event) => {
    const fill = event.capacity ? event.attendees / event.capacity : 0;
    return (
      (query === "" ||
        [event.title, event.community.name].some((field) => field.toLowerCase().includes(query))) &&
      (filters.status === "all" || event.status === filters.status) &&
      (!date || !("test" in date) || date.test(event)) &&
      fill >= attendance.min &&
      fill < attendance.max &&
      (filters.group === "all" || event.community.name === filters.group) &&
      (filters.type === "all" || event.type === filters.type)
    );
  });
  const filteredTotal = filtered ? rows.length : total;
  const pageCount = Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE));
  const page = Math.min(Math.max(filters.page, 1), pageCount);
  // The Figma counts the rows on screen: "Showing 1 to 3 of 342 entries".
  const first = filteredTotal === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const last = first === 0 ? 0 : first + Math.min(rows.length, PAGE_SIZE) - 1;

  const selected = events.find((event) => event.id === filters.event);
  // Keeps the last event on screen while the sheet animates closed.
  const [shown, setShown] = useState(selected);
  if (selected && selected !== shown) setShown(selected);
  // The button that opened the sheet, to take focus back when it closes.
  const opener = useRef<HTMLElement>(null);
  const view = (id: string, from: HTMLElement) => {
    opener.current = from;
    onChange({ event: id });
  };

  // Any change to the filters starts again from the first page.
  const refine = (next: Partial<Filters>, options?: { debounced?: boolean }) =>
    onChange({ ...next, page: 1 }, options);

  return (
    <>
      <DashboardCard className="flex flex-wrap items-center gap-2 p-3 shadow-[0_2px_6px_rgb(24_28_30/0.04)]">
        <div className="relative min-w-60 flex-1">
          <MagnifyingGlassIcon
            aria-hidden
            weight="bold"
            className="pointer-events-none absolute top-1/2 left-4 size-3.5 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            aria-label="Search events"
            aria-controls={tableId}
            placeholder="Search events..."
            value={filters.q}
            onChange={(change) => refine({ q: change.target.value }, { debounced: true })}
            className="h-9 rounded-sm bg-surface pl-12 text-[13px] placeholder:text-[#6b7280] md:text-[13px] dark:bg-input/30"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterButton
            label="Status"
            value={filters.status}
            options={STATUSES}
            onChange={(status) => refine({ status: status as Filters["status"] })}
          />
          <FilterButton
            label="Date"
            value={filters.date}
            options={DATES}
            onChange={(value) => refine({ date: value as Filters["date"] })}
          />
          <FilterButton
            label="Attendance"
            value={filters.attendance}
            options={ATTENDANCE}
            onChange={(value) => refine({ attendance: value as Filters["attendance"] })}
          />
          <FilterButton
            label="Group"
            value={filters.group}
            options={GROUPS}
            onChange={(group) => refine({ group })}
          />
          <FilterButton
            label="Type"
            value={filters.type}
            options={TYPES}
            onChange={(type) => refine({ type: type as Filters["type"] })}
            icon={<FunnelSimpleIcon aria-hidden weight="bold" className="size-4" />}
          />
        </div>
      </DashboardCard>

      <DashboardCard className="overflow-hidden p-0 shadow-[0_2px_6px_rgb(24_28_30/0.04)]">
        <Table id={tableId} aria-label="Events" className="min-w-220">
          <colgroup>
            {COLUMNS.map((column) => (
              <col key={column.label} className={column.width} />
            ))}
          </colgroup>
          <TableHeader className="[&_tr]:border-b">
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
            {rows.map((event) => (
              <TableRow
                key={event.id}
                data-state={event.id === filters.event ? "selected" : undefined}
                className="hover:bg-primary/5 data-[state=selected]:bg-primary/5"
              >
                <TableCell className="py-3 pr-4 pl-6">
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element -- a sample cover; next/image once the API's URLs are wired */}
                    <img
                      src={event.imageUrl}
                      alt=""
                      className="size-12 shrink-0 rounded-md border border-border/30 bg-muted object-cover shadow-xs"
                    />
                    <span className="text-[13px]/5 whitespace-normal">{event.title}</span>
                  </div>
                </TableCell>
                <TableCell className="px-4">
                  <p className="text-[13px]/4.5">{event.date}</p>
                  <p className="text-xs/4 text-muted-foreground">{event.time}</p>
                </TableCell>
                <TableCell className="px-4 text-[13px] whitespace-normal">
                  {event.community.name}
                </TableCell>
                <TableCell className="px-4 text-[13px] tabular-nums">
                  <span className="flex items-center gap-1">
                    <UserIcon
                      aria-hidden
                      weight="bold"
                      className="size-3.5 text-muted-foreground"
                    />
                    {count.format(event.attendees)}
                  </span>
                </TableCell>
                <TableCell className="px-4 text-[13px] text-muted-foreground tabular-nums">
                  {event.capacity ? count.format(event.capacity) : "Unlimited"}
                </TableCell>
                <TableCell className="px-4">
                  <EventStatusBadge status={event.status} />
                </TableCell>
                <TableCell className="pr-6 pl-4 text-right">
                  <button
                    type="button"
                    aria-label={`View ${event.title}`}
                    onClick={(click) => view(event.id, click.currentTarget)}
                    className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <EyeIcon aria-hidden weight="bold" className="size-4.5" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={COLUMNS.length}
                  className="h-24 text-center text-[13px] text-muted-foreground"
                >
                  No events match these filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t py-4 pr-5 pl-4">
          <p className="text-[13px] text-muted-foreground">
            {filteredTotal === 0
              ? "No events to show"
              : `Showing ${first} to ${last} of ${count.format(filteredTotal)} ${filteredTotal === 1 ? "entry" : "entries"}`}
          </p>
          <PagePagination
            page={page}
            pageCount={pageCount}
            onPageChange={(next) => onChange({ page: next })}
            variant="mini"
          />
        </div>
      </DashboardCard>

      <EventSheet
        event={shown}
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) onChange({ event: null });
        }}
        onCloseAutoFocus={(close) => {
          if (!opener.current?.isConnected) return;
          close.preventDefault();
          opener.current.focus();
        }}
      />
    </>
  );
}

/** An outlined toolbar button: the filter's name and a caret (or an icon), opening its options. */
function FilterButton({
  label,
  value,
  options,
  onChange,
  icon,
}: {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
  /** In place of the caret: Type's filter lines. */
  icon?: ReactNode;
}) {
  const active = value !== options[0].value;
  const current = options.find((option) => option.value === value);
  return (
    // Not modal: a modal menu locks scrolling, and hiding the scrollbar shifts the page.
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-7.5 gap-1.5 rounded-sm bg-surface px-4 text-[13px] font-semibold tracking-wide text-muted-foreground shadow-none has-[>svg]:px-4 dark:bg-input/30",
            active && "border-action text-action dark:border-primary dark:text-primary",
          )}
        >
          {label}
          {active && <span className="sr-only">: {current?.label}</span>}
          {icon ?? <CaretDownIcon aria-hidden weight="fill" className="size-2.5" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value} className="py-2">
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
