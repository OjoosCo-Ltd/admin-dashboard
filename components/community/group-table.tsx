"use client";

import { CaretDownIcon, FunnelSimpleIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import Link from "next/link";
import {
  debounce,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { useId } from "react";

import { CategoryBadge, GroupStatusBadge } from "@/components/community/community-badges";
import { GroupThumbnail } from "@/components/community/group-thumbnail";
import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
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
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import type { CommunityGroup } from "@/types/community";

const PAGE_SIZE = 10;

const STATUSES = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
] as const;

/** ⚠️ PROVISIONAL: the Figma's categories. The backend's are GROUP_CATEGORIES. */
const SAMPLE_CATEGORIES = ["Lifestyle", "Creative", "Outdoors"];

const SIZES = [
  { value: "any", label: "Any size", test: () => true },
  { value: "small", label: "Under 1,000", test: (members: number) => members < 1_000 },
  {
    value: "medium",
    label: "1,000 – 10,000",
    test: (members: number) => members >= 1_000 && members < 10_000,
  },
  { value: "large", label: "10,000+", test: (members: number) => members >= 10_000 },
] as const;

type StatusFilter = (typeof STATUSES)[number]["value"];
type SizeFilter = (typeof SIZES)[number]["value"];

// Kept in the URL, so a filtered list can be shared and survives a reload.
const FILTERS = {
  q: parseAsString.withDefault(""),
  status: parseAsStringLiteral(STATUSES.map((status) => status.value)).withDefault("all"),
  category: parseAsString.withDefault("all"),
  size: parseAsStringLiteral(SIZES.map((size) => size.value)).withDefault("any"),
  page: parseAsInteger.withDefault(1),
};

interface Filters {
  q: string;
  status: StatusFilter;
  category: string;
  size: SizeFilter;
  page: number;
}

const DEFAULT_FILTERS: Filters = { q: "", status: "all", category: "all", size: "any", page: 1 };

// Widths from the Figma's 1,108px table, held exactly (table-fixed) so the
// description truncates as it does there. Below 960px the table scrolls sideways.
// Without Active (30D), Group takes its share and the other columns keep theirs.
const COLUMNS = enabled<{ label: string; width: string; cell?: string; feature?: Feature }>([
  { label: "Group", width: FEATURES.groupAnalytics ? "w-[27.5%]" : "w-[39.6%]", cell: "pl-6" },
  { label: "Category", width: "w-[9.5%]" },
  { label: "Members", width: "w-[10.4%]", cell: "text-right" },
  { label: "Active (30D)", width: "w-[12.1%]", cell: "text-right", feature: "groupAnalytics" },
  // The Figma sets Discussions well clear of the right-aligned figures before it.
  { label: "Discussions", width: "w-[15.3%]", cell: "pl-11.5" },
  { label: "Last Activity", width: "w-[14.4%]" },
  { label: "Status", width: "w-[10.8%]", cell: "pr-6" },
]);

const count = new Intl.NumberFormat("en-US");

const pill =
  "h-7 gap-1.5 rounded-full px-3.5 text-[13px] font-medium shadow-none has-[>svg]:px-3.5";

interface GroupTableProps {
  /** UI only: one sample page, filtered here. */
  groups: CommunityGroup[];
  /** Every group, for the count and pages while no filter is set. */
  total: number;
}

/**
 * Community Groups: search, status, category and size filters, the groups and
 * their pages. The filters and page live in the URL (?q=, ?status=, ?category=,
 * ?size=, ?page=). A group's name opens its dashboard.
 */
export function GroupTable(props: GroupTableProps) {
  const [filters, setFilters] = useQueryStates(FILTERS);
  return (
    <GroupTableView
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
export function GroupTableFallback(props: GroupTableProps) {
  return <GroupTableView {...props} filters={DEFAULT_FILTERS} onChange={() => {}} />;
}

function GroupTableView({
  groups,
  total,
  filters,
  onChange,
}: GroupTableProps & {
  filters: Filters;
  onChange: (next: Partial<Filters> | null, options?: { debounced?: boolean }) => void;
}) {
  const titleId = useId();
  const query = filters.q.trim().toLowerCase();
  const size = SIZES.find((option) => option.value === filters.size) ?? SIZES[0];
  const filtered =
    query !== "" ||
    filters.status !== "all" ||
    filters.category !== "all" ||
    filters.size !== "any";

  // UI only: GET /admin/community/groups doesn't exist yet, so the sample page
  // is filtered here and every page shows the same rows.
  const rows = groups.filter(
    (group) =>
      (query === "" ||
        [group.name, group.description].some((field) => field.toLowerCase().includes(query))) &&
      (filters.status === "all" || group.status === filters.status) &&
      (filters.category === "all" || group.category === filters.category) &&
      size.test(group.members),
  );
  const filteredTotal = filtered ? rows.length : total;
  const pageCount = Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE));
  const page = Math.min(Math.max(filters.page, 1), pageCount);
  // The Figma counts the rows on screen: "Showing 1-3 of 142 groups".
  const first = filteredTotal === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const last = first === 0 ? 0 : first + Math.min(rows.length, PAGE_SIZE) - 1;

  // Any change to the filters starts again from the first page.
  const refine = (next: Partial<Filters>, options?: { debounced?: boolean }) =>
    onChange({ ...next, page: 1 }, options);

  return (
    <DashboardCard className="overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 max-sm:p-4">
        <DashboardCardTitle id={titleId} className="text-xl/7 font-semibold">
          Community Groups
        </DashboardCardTitle>
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <div className="relative min-w-0 flex-1 sm:w-63 sm:flex-none">
            <MagnifyingGlassIcon
              aria-hidden
              weight="bold"
              className="pointer-events-none absolute top-1/2 left-2.5 size-4.5 -translate-y-1/2 text-foreground"
            />
            <Input
              type="search"
              aria-label="Search groups"
              placeholder="Search groups..."
              value={filters.q}
              onChange={(event) => refine({ q: event.target.value }, { debounced: true })}
              className="h-9 rounded-md bg-surface pl-10 text-sm placeholder:text-subtle-foreground md:text-sm dark:bg-input/30"
            />
          </div>
          {/* The three pills fold into All Filters on phones. */}
          <div className="flex gap-3 max-md:hidden">
            <FilterPill
              label="Status"
              value={filters.status}
              options={STATUSES}
              onChange={(status) => refine({ status: status as StatusFilter })}
            />
            <FilterPill
              label="Category"
              value={filters.category}
              options={[
                { value: "all", label: "All categories" },
                ...SAMPLE_CATEGORIES.map((category) => ({ value: category, label: category })),
              ]}
              onChange={(category) => refine({ category })}
            />
            <FilterPill
              label="Member Count"
              value={filters.size}
              options={SIZES}
              onChange={(value) => refine({ size: value as SizeFilter })}
            />
          </div>
          <AllFilters filters={filters} onRefine={refine} onClear={() => onChange(null)} />
        </div>
      </div>

      <Table aria-labelledby={titleId} className="min-w-240 table-fixed">
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
                  "h-14 px-4 text-xs/4 font-semibold tracking-wider whitespace-normal text-muted-foreground uppercase",
                  column.cell,
                )}
              >
                {/* "Active (30D)" stacks, as in the Figma. */}
                <span className={cn(column.label.includes("(") && "inline-block w-min")}>
                  {column.label}
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((group) => (
            <TableRow key={group.id} className="relative hover:bg-primary/5">
              <TableCell className="py-4 pr-4 pl-6">
                <div className="flex items-center gap-4">
                  <GroupThumbnail group={group} />
                  <div className="min-w-0">
                    {/* Stretched over the row, so anywhere on it opens the group. */}
                    <Link
                      href={`/community/groups/${group.id}`}
                      className="block text-[13px]/4.5 font-semibold outline-none after:absolute after:inset-0 focus-visible:after:ring-3 focus-visible:after:ring-ring/50 focus-visible:after:ring-inset"
                    >
                      {group.name}
                    </Link>
                    <p className="truncate text-[13px]/5 text-muted-foreground">
                      {group.description}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-4">
                <CategoryBadge category={group.category} />
              </TableCell>
              <TableCell className="px-4 text-right text-sm tabular-nums">
                {count.format(group.members)}
              </TableCell>
              {FEATURES.groupAnalytics && (
                <TableCell className="px-4 text-right tabular-nums">
                  <span className="block text-sm/5">{count.format(group.activeMembers)}</span>
                  <span className="block text-[10px]/4 text-muted-foreground">
                    {group.activeChange}
                  </span>
                </TableCell>
              )}
              <TableCell className="pr-4 pl-11.5 text-sm tabular-nums">
                {count.format(group.discussions)}
              </TableCell>
              <TableCell className="px-4 text-sm/5 whitespace-normal text-muted-foreground">
                {/* Narrow enough that "Today, 10:42 AM" takes two lines, as in the Figma. */}
                <span className="block max-w-24">{group.lastActivity}</span>
              </TableCell>
              <TableCell className="pr-6 pl-4">
                <GroupStatusBadge status={group.status} />
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={COLUMNS.length}
                className="h-24 text-center text-[13px] text-muted-foreground"
              >
                No groups match these filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* pl-3.5 and pr-4.5: the Figma sets the count and arrows closer to the edges than the title. */}
      <div className="flex items-center justify-between gap-4 border-t py-3.5 pr-4.5 pl-3.5">
        <p className="text-[13px] text-muted-foreground">
          {filteredTotal === 0
            ? "No groups to show"
            : `Showing ${first}-${last} of ${count.format(filteredTotal)} ${filteredTotal === 1 ? "group" : "groups"}`}
        </p>
        <PagePagination
          page={page}
          pageCount={pageCount}
          onPageChange={(next) => onChange({ page: next })}
          variant="arrows"
        />
      </div>
    </DashboardCard>
  );
}

/** A filter as an outlined pill: its name and a caret, opening a menu of its options. */
function FilterPill({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
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
            pill,
            "bg-background",
            active && "border-action text-action dark:border-primary dark:text-primary",
          )}
        >
          {label}
          {active && <span className="sr-only">: {current?.label}</span>}
          <CaretDownIcon aria-hidden weight="fill" className="size-3" />
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

/** Every filter in one panel, with a way to clear them. The only way in on phones. */
function AllFilters({
  filters,
  onRefine,
  onClear,
}: {
  filters: Filters;
  onRefine: (next: Partial<Filters>) => void;
  onClear: () => void;
}) {
  const id = useId();
  const set = [filters.status !== "all", filters.category !== "all", filters.size !== "any"].filter(
    Boolean,
  ).length;
  const fields = [
    {
      key: "status",
      label: "Status",
      value: filters.status,
      options: STATUSES,
      onChange: (status: string) => onRefine({ status: status as StatusFilter }),
    },
    {
      key: "category",
      label: "Category",
      value: filters.category,
      options: [
        { value: "all", label: "All categories" },
        ...SAMPLE_CATEGORIES.map((category) => ({ value: category, label: category })),
      ],
      onChange: (category: string) => onRefine({ category }),
    },
    {
      key: "size",
      label: "Member Count",
      value: filters.size,
      options: SIZES,
      onChange: (value: string) => onRefine({ size: value as SizeFilter }),
    },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          className={cn(pill, "bg-muted-strong hover:bg-muted-strong/80 dark:bg-muted")}
        >
          <FunnelSimpleIcon aria-hidden weight="bold" className="size-4" />
          All Filters
          {set > 0 && (
            <span className="ml-0.5 rounded-full bg-action px-1.5 text-[11px]/4 text-white dark:bg-primary dark:text-primary-foreground">
              {set}
              <span className="sr-only"> set</span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 gap-4 p-4">
        {fields.map((field) => (
          <div key={field.key} className="grid gap-1.5">
            <Label htmlFor={`${id}-${field.key}`} className="text-xs text-muted-foreground">
              {field.label}
            </Label>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id={`${id}-${field.key}`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                {field.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
        <Button variant="outline" onClick={onClear} disabled={set === 0 && filters.q === ""}>
          Clear all filters
        </Button>
      </PopoverContent>
    </Popover>
  );
}
