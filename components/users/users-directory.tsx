"use client";

import { FunnelXIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import {
  debounce,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { type ReactNode, useRef, useState } from "react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPreviewSheet } from "@/components/users/user-preview-sheet";
import { UsersTable } from "@/components/users/users-table";
import { FEATURES } from "@/constants/features";
import type { UserDetail, UserPlanFilter, UserStatusFilter } from "@/types/users";

const PAGE_SIZE = 25;

const STATUSES: { value: UserStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "verified", label: "Verified" },
  { value: "pending", label: "Pending" },
  { value: "suspended", label: "Suspended" },
];

const PLANS: { value: UserPlanFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "elite", label: "Elite" },
  { value: "premium", label: "Premium" },
  { value: "free", label: "Free" },
];

// Kept in the URL, so a filtered list can be shared and survives a reload.
const FILTERS = {
  q: parseAsString.withDefault(""),
  location: parseAsString.withDefault("all"),
  status: parseAsStringLiteral(STATUSES.map((status) => status.value)).withDefault("all"),
  plan: parseAsStringLiteral(PLANS.map((plan) => plan.value)).withDefault("all"),
  page: parseAsInteger.withDefault(1),
};

interface Filters {
  q: string;
  location: string;
  status: UserStatusFilter;
  plan: UserPlanFilter;
  page: number;
}

const DEFAULT_FILTERS: Filters = { q: "", location: "all", status: "all", plan: "all", page: 1 };

interface DirectoryProps {
  /** UI only: one sample page, filtered here. GET /admin/users will page and filter server-side. */
  users: UserDetail[];
  /** Every user, for the count and pages while no filter is set. */
  totalCount: number;
}

/** Search, filters, the user table and the profile preview, with the filters kept in the URL. */
export function UsersDirectory(props: DirectoryProps) {
  const [filters, setFilters] = useQueryStates(FILTERS);

  return (
    <DirectoryView
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
export function UsersDirectoryFallback(props: DirectoryProps) {
  return <DirectoryView {...props} filters={DEFAULT_FILTERS} onChange={() => {}} />;
}

function DirectoryView({
  users,
  totalCount,
  filters,
  onChange,
}: DirectoryProps & {
  filters: Filters;
  onChange: (next: Partial<Filters> | null, options?: { debounced?: boolean }) => void;
}) {
  const [preview, setPreview] = useState<UserDetail | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);

  const countries = [...new Set(users.map((user) => user.country))].sort();
  const query = filters.q.trim().toLowerCase();
  // While plans are hidden, an old ?plan= link can't filter by them.
  const plan = FEATURES.subscriptions ? filters.plan : "all";
  const filtered =
    query !== "" || filters.location !== "all" || filters.status !== "all" || plan !== "all";

  const matches = users.filter(
    (user) =>
      (query === "" ||
        [user.name, user.email, `#${user.publicId}`].some((field) =>
          field.toLowerCase().includes(query),
        )) &&
      (filters.location === "all" || user.country === filters.location) &&
      (filters.status === "all" ||
        (filters.status === "suspended"
          ? user.suspended
          : !user.suspended && user.verification === filters.status)) &&
      (plan === "all" || user.plan === plan),
  );

  const total = filtered ? matches.length : totalCount;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(filters.page, 1), pageCount);

  // Any change to the filters starts again from the first page.
  const refine = (next: Partial<Filters>, options?: { debounced?: boolean }) =>
    onChange({ ...next, page: 1 }, options);

  return (
    <>
      <DashboardCard className="flex flex-wrap items-center gap-x-2.5 gap-y-3">
        <div className="relative w-full sm:mr-3.5 sm:w-97.5">
          <MagnifyingGlassIcon
            aria-hidden
            weight="bold"
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            aria-label="Search users"
            placeholder="Search by name, ID or email..."
            value={filters.q}
            onChange={(event) => refine({ q: event.target.value }, { debounced: true })}
            className="h-10 rounded-md border-muted-strong bg-muted pl-11 text-base placeholder:text-[#6b7280] md:text-base dark:bg-muted"
          />
        </div>
        <FilterSelect
          label="Location"
          value={filters.location}
          onValueChange={(location) => refine({ location })}
          options={[
            { value: "all", label: "Global" },
            ...countries.map((country) => ({ value: country, label: country })),
          ]}
          render={(value) => <>Location ({value})</>}
        />
        <FilterSelect
          label="Status"
          value={filters.status}
          onValueChange={(status) => refine({ status: status as UserStatusFilter })}
          options={STATUSES}
          render={(value) => <>Status: {value}</>}
        />
        {FEATURES.subscriptions && (
          <FilterSelect
            label="Plan"
            value={filters.plan}
            onValueChange={(value) => refine({ plan: value as UserPlanFilter })}
            options={PLANS}
            render={(value) => <>Plan: {value}</>}
          />
        )}
        <button
          type="button"
          onClick={() => onChange(null)}
          className="flex h-10 items-center gap-1.5 rounded-md px-5 text-base font-semibold text-action outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 dark:text-primary"
        >
          <FunnelXIcon aria-hidden weight="bold" className="size-5" />
          Reset Filters
        </button>
      </DashboardCard>

      <UsersTable
        users={matches}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={(next) => onChange({ page: next })}
        onView={(user, opener) => {
          openerRef.current = opener;
          setPreview(users.find((candidate) => candidate.id === user.id) ?? null);
          setPreviewOpen(true);
        }}
      />

      <UserPreviewSheet
        user={preview}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        returnFocusRef={openerRef}
      />
    </>
  );
}

/** A filter dropdown whose button reads "Status: All", and whose list reads plainly. */
function FilterSelect({
  label,
  value,
  onValueChange,
  options,
  render,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  render: (selected: ReactNode) => ReactNode;
}) {
  const selected = options.find((option) => option.value === value) ?? options[0];
  return (
    <Select value={selected.value} onValueChange={onValueChange}>
      <SelectTrigger
        aria-label={`${label}: ${selected.label}`}
        className="h-10 gap-2.5 rounded-md border-0 bg-muted px-4 text-base font-semibold text-foreground hover:bg-accent data-[size=default]:h-10 dark:bg-muted dark:hover:bg-accent [&_svg]:text-foreground [&_svg:not([class*='size-'])]:size-4.5"
      >
        {/* Shows the prefixed label rather than the item's own text. */}
        <SelectValue>{render(selected.label)}</SelectValue>
      </SelectTrigger>
      <SelectContent
        position="popper"
        align="start"
        className="min-w-(--radix-select-trigger-width)"
      >
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className="py-2 text-sm">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
