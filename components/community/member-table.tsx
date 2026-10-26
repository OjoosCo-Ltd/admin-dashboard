"use client";

import {
  CalendarBlankIcon,
  ChartBarIcon,
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { cn } from "cn";
import { differenceInCalendarDays } from "date-fns";
import {
  debounce,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { type ReactNode, useId } from "react";

import { MemberStatusBadge } from "@/components/community/community-badges";
import { RowMenu } from "@/components/community/row-menu";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { PagePagination } from "@/components/dashboard/page-pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { initials } from "@/libs/utils";
import type { GroupMember } from "@/types/community";

const PAGE_SIZE = 10;

const STATUSES = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "muted", label: "Muted" },
  { value: "banned", label: "Banned" },
] as const;

const JOINED = [
  { value: "any", label: "Any time", days: Infinity },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "90d", label: "Last 90 days", days: 90 },
  { value: "1y", label: "Last year", days: 365 },
] as const;

const ACTIVITY = [
  { value: "any", label: "Any level", test: () => true },
  { value: "high", label: "High (70+)", test: (score: number) => score >= 70 },
  { value: "medium", label: "Medium (40–69)", test: (score: number) => score >= 40 && score < 70 },
  { value: "low", label: "Low (under 40)", test: (score: number) => score < 40 },
] as const;

type StatusFilter = (typeof STATUSES)[number]["value"];
type JoinedFilter = (typeof JOINED)[number]["value"];
type ActivityFilter = (typeof ACTIVITY)[number]["value"];

// Kept in the URL, so a filtered list can be shared and survives a reload.
const FILTERS = {
  q: parseAsString.withDefault(""),
  status: parseAsStringLiteral(STATUSES.map((option) => option.value)).withDefault("all"),
  joined: parseAsStringLiteral(JOINED.map((option) => option.value)).withDefault("any"),
  activity: parseAsStringLiteral(ACTIVITY.map((option) => option.value)).withDefault("any"),
  page: parseAsInteger.withDefault(1),
};

interface Filters {
  q: string;
  status: StatusFilter;
  joined: JoinedFilter;
  activity: ActivityFilter;
  page: number;
}

const DEFAULT_FILTERS: Filters = { q: "", status: "all", joined: "any", activity: "any", page: 1 };

/**
 * The Figma's columns, less the empty one it leaves before Member. Widths
 * are targets; the table scrolls sideways when it can't fit.
 */
const COLUMNS = [
  { label: "Member", width: "w-[31%]", cell: "pl-6" },
  { label: "Joined Date", width: "w-[15%]" },
  { label: "Last Active", width: "w-[14%]" },
  { label: "Activity Score", width: "w-[16%]" },
  { label: "Status", width: "w-[14%]" },
  { label: "Actions", width: "w-[10%]", cell: "pr-6 text-right" },
];

const count = new Intl.NumberFormat("en-US");

/** "Today" for the join-date filter on the sample rows. */
const LOADED_AT = new Date();

const toolButton =
  "h-7 gap-2 rounded-md border-[#d5dbdf] bg-container px-3 text-[13px] font-semibold tracking-wide text-foreground shadow-none hover:bg-muted-strong has-[>svg]:px-3 dark:border-border dark:bg-muted";

interface MemberTableProps {
  /** UI only: one sample page, filtered here. */
  members: GroupMember[];
  /** Every member, for the count and pages while no filter is set. */
  total: number;
}

/**
 * A group's members: search, status, join date and activity filters, the
 * members and their pages, all kept in the URL (?q=, ?status=, ?joined=,
 * ?activity=, ?page=).
 */
export function MemberTable(props: MemberTableProps) {
  const [filters, setFilters] = useQueryStates(FILTERS);
  return (
    <MemberTableView
      {...props}
      filters={filters}
      onChange={(next, { debounced = false } = {}) =>
        // Typing waits for a pause before writing the URL; the list itself updates at once.
        setFilters(next, debounced ? { limitUrlUpdates: debounce(300) } : undefined)
      }
    />
  );
}

/** What renders before the URL is read: the unfiltered list. */
export function MemberTableFallback(props: MemberTableProps) {
  return <MemberTableView {...props} filters={DEFAULT_FILTERS} onChange={() => {}} />;
}

function MemberTableView({
  members,
  total,
  filters,
  onChange,
}: MemberTableProps & {
  filters: Filters;
  onChange: (next: Partial<Filters>, options?: { debounced?: boolean }) => void;
}) {
  const tableId = useId();
  const query = filters.q.trim().toLowerCase();
  const joined = JOINED.find((option) => option.value === filters.joined) ?? JOINED[0];
  const activity = ACTIVITY.find((option) => option.value === filters.activity) ?? ACTIVITY[0];
  const filtered =
    query !== "" ||
    filters.status !== "all" ||
    filters.joined !== "any" ||
    filters.activity !== "any";

  // UI only: there's no admin route listing a group's members yet, so the
  // sample page is filtered here and every page shows the same rows.
  const rows = members.filter(
    (member) =>
      (query === "" ||
        [member.name, member.email].some((field) => field.toLowerCase().includes(query))) &&
      (filters.status === "all" || member.status === filters.status) &&
      differenceInCalendarDays(LOADED_AT, new Date(member.joinedOn)) <= joined.days &&
      activity.test(member.activityScore),
  );
  const filteredTotal = filtered ? rows.length : total;
  const pageCount = Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE));
  const page = Math.min(Math.max(filters.page, 1), pageCount);
  const first = (page - 1) * PAGE_SIZE + 1;
  const last = Math.min(page * PAGE_SIZE, filteredTotal);

  // Any change to the filters starts again from the first page.
  const refine = (next: Partial<Filters>, options?: { debounced?: boolean }) =>
    onChange({ ...next, page: 1 }, options);

  return (
    <DashboardCard className="overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="relative w-full sm:w-80">
          <MagnifyingGlassIcon
            aria-hidden
            weight="bold"
            className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-foreground"
          />
          <Input
            type="search"
            aria-label="Search members"
            aria-controls={tableId}
            placeholder="Search members by name or email..."
            value={filters.q}
            onChange={(event) => refine({ q: event.target.value }, { debounced: true })}
            className="h-9 rounded-md border-[#d7dadd] bg-muted-strong pl-10 text-sm placeholder:text-[#71787c] md:text-sm dark:border-border dark:bg-muted"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <ToolMenu
            label="Status"
            icon={<FunnelSimpleIcon aria-hidden weight="bold" className="size-4" />}
            value={filters.status}
            options={STATUSES}
            onChange={(status) => refine({ status: status as StatusFilter })}
            // "Status: All", as the Figma labels it.
            render={(option) => `Status: ${option.label}`}
          />
          <ToolMenu
            label="Join Date"
            icon={<CalendarBlankIcon aria-hidden weight="bold" className="size-4" />}
            value={filters.joined}
            options={JOINED}
            onChange={(value) => refine({ joined: value as JoinedFilter })}
          />
          <ToolMenu
            label="Activity Level"
            icon={<ChartBarIcon aria-hidden weight="fill" className="size-4" />}
            value={filters.activity}
            options={ACTIVITY}
            onChange={(value) => refine({ activity: value as ActivityFilter })}
          />
        </div>
      </div>

      <Table id={tableId} aria-label="Members" className="min-w-210">
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
                  "h-13 px-4 text-xs/4 font-semibold tracking-wider text-muted-foreground uppercase",
                  column.cell,
                )}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((member) => (
            <TableRow
              key={member.id}
              className="border-border/30 hover:bg-primary/5 dark:border-border"
            >
              <TableCell className="py-3 pr-4 pl-6">
                <div className="flex items-center gap-3.5">
                  <Avatar className="size-8 after:hidden">
                    {member.avatarUrl && <AvatarImage src={member.avatarUrl} alt="" />}
                    <AvatarFallback className="bg-muted-strong text-sm text-muted-foreground dark:bg-muted">
                      {initials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm/5">{member.name}</p>
                    <p className="truncate text-[13px]/5 text-muted-foreground">{member.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-4 text-sm text-muted-foreground">
                {member.joinedOn}
              </TableCell>
              <TableCell className="px-4 text-sm text-muted-foreground">
                {member.lastActive}
              </TableCell>
              <TableCell className="px-4">
                <ActivityScore score={member.activityScore} />
              </TableCell>
              <TableCell className="px-4">
                <MemberStatusBadge status={member.status} />
              </TableCell>
              <TableCell className="pr-6 pl-4 text-right">
                <RowMenu
                  label={`Actions for ${member.name}`}
                  items={[
                    { label: "View profile" },
                    {
                      label: member.status === "muted" ? "Unmute member" : "Mute member",
                      feature: "memberMutes",
                    },
                    { label: "Remove from group", destructive: true },
                    { label: "Ban from group", destructive: true },
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
                No members match these filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-border/30 py-4 pr-4 pl-4 dark:border-border">
        <p className="text-sm text-muted-foreground">
          {filteredTotal === 0
            ? "No members to show"
            : `Showing ${count.format(first)} to ${count.format(last)} of ${count.format(filteredTotal)} ${filteredTotal === 1 ? "member" : "members"}`}
        </p>
        <PagePagination
          page={page}
          pageCount={pageCount}
          onPageChange={(next) => onChange({ page: next })}
          variant="soft"
        />
      </div>
    </DashboardCard>
  );
}

/** The score as a 64px bar, teal from 40 up and amber below, with its number. */
function ActivityScore({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className="h-1.5 w-16 overflow-hidden rounded-full bg-container dark:bg-muted"
      >
        <span
          className={cn("block h-full rounded-full", score >= 40 ? "bg-action-icon" : "bg-caution")}
          style={{ width: `${score}%` }}
        />
      </span>
      <span className="text-sm text-muted-foreground tabular-nums">
        <span className="sr-only">Activity score </span>
        {score}
      </span>
    </div>
  );
}

/** A grey toolbar button with an icon, opening a menu of the filter's options. */
function ToolMenu<T extends string>({
  label,
  icon,
  value,
  options,
  onChange,
  render,
}: {
  label: string;
  icon: ReactNode;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: string) => void;
  /** The button's text for the current option. Without it, the filter's name. */
  render?: (option: { value: T; label: string }) => string;
}) {
  const current = options.find((option) => option.value === value) ?? options[0];
  const active = value !== options[0].value;
  return (
    // Not modal: a modal menu locks scrolling, and hiding the scrollbar shifts the page.
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            toolButton,
            active && "border-action text-action dark:border-primary dark:text-primary",
          )}
        >
          {icon}
          {render ? render(current) : label}
          {!render && active && <span className="sr-only">: {current.label}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
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
