"use client";

import {
  CaretDownIcon,
  FunnelSimpleIcon,
  ListBulletsIcon,
  SquaresFourIcon,
} from "@phosphor-icons/react";
import { cn } from "cn";
import { differenceInCalendarDays } from "date-fns";
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { useId, useRef, useState } from "react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { PagePagination } from "@/components/dashboard/page-pagination";
import { PlanBadge, SubscriptionStatusBadge } from "@/components/subscriptions/subscription-badges";
import {
  CYCLE_LABELS,
  PER_CYCLE,
  PLAN_NAMES,
} from "@/components/subscriptions/subscription-format";
import { SubscriptionSheet } from "@/components/subscriptions/subscription-sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { initials } from "@/libs/utils";
import type { Subscription } from "@/types/subscriptions";
import { formatMoney } from "@/libs/money";

const PAGE_SIZE = 10;

const PLANS = [
  { value: "all", label: "All" },
  { value: "free", label: "Free" },
  { value: "basic", label: "Basic" },
  { value: "premium", label: "Premium" },
  { value: "elite", label: "Elite" },
] as const;

const STATUSES = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "trial", label: "Trial" },
  { value: "payment-failed", label: "Payment Failed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

const JOINED = [
  { value: "any", label: "Any", days: Infinity },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "90d", label: "Last 90 days", days: 90 },
  { value: "1y", label: "Last year", days: 365 },
] as const;

const BILLING = [
  { value: "all", label: "Any billing" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annual", label: "Yearly" },
] as const;

const FILTERS = {
  plan: parseAsStringLiteral(PLANS.map((option) => option.value)).withDefault("all"),
  status: parseAsStringLiteral(STATUSES.map((option) => option.value)).withDefault("all"),
  joined: parseAsStringLiteral(JOINED.map((option) => option.value)).withDefault("any"),
  billing: parseAsStringLiteral(BILLING.map((option) => option.value)).withDefault("all"),
  view: parseAsStringLiteral(["list", "grid"] as const).withDefault("list"),
  page: parseAsInteger.withDefault(1),
  subscription: parseAsString,
};

interface Filters {
  plan: (typeof PLANS)[number]["value"];
  status: (typeof STATUSES)[number]["value"];
  joined: (typeof JOINED)[number]["value"];
  billing: (typeof BILLING)[number]["value"];
  view: "list" | "grid";
  page: number;
  subscription: string | null;
}

const DEFAULT_FILTERS: Filters = {
  plan: "all",
  status: "all",
  joined: "any",
  billing: "all",
  view: "list",
  page: 1,
  subscription: null,
};

/** "Today" for the join-date filter on the sample rows. */
const LOADED_AT = new Date();

const count = new Intl.NumberFormat("en-GB");
const head =
  "h-16 px-4 text-xs/4 font-semibold tracking-wider whitespace-normal text-muted-foreground uppercase";

interface DirectoryProps {
  /** UI only: one sample page, filtered here. */
  subscriptions: Subscription[];
  /** Every subscriber, for the count and pages while no filter is set. */
  total: number;
}

/**
 * The subscriber directory: plan, status, join-date and billing filters, a
 * list or grid of subscribers with row selection, and their pages. The
 * filters, view, page and open subscription live in the URL.
 */
export function SubscriberDirectory(props: DirectoryProps) {
  const [filters, setFilters] = useQueryStates(FILTERS);
  return <DirectoryView {...props} filters={filters} onChange={(next) => void setFilters(next)} />;
}

/** What renders before the URL is read: every subscriber, as a list. */
export function SubscriberDirectoryFallback(props: DirectoryProps) {
  return <DirectoryView {...props} filters={DEFAULT_FILTERS} onChange={() => {}} />;
}

function DirectoryView({
  subscriptions,
  total,
  filters,
  onChange,
}: DirectoryProps & {
  filters: Filters;
  onChange: (next: Partial<Filters>) => void;
}) {
  const tableId = useId();
  const [selection, setSelection] = useState<string[]>([]);
  const joined = JOINED.find((option) => option.value === filters.joined) ?? JOINED[0];
  const filtered =
    filters.plan !== "all" ||
    filters.status !== "all" ||
    filters.joined !== "any" ||
    filters.billing !== "all";

  // UI only: there's no subscribers route, so the sample page is filtered here
  // and every page shows the same rows.
  const rows = subscriptions.filter(
    (item) =>
      (filters.plan === "all" || item.plan === filters.plan) &&
      (filters.status === "all" || item.status === filters.status) &&
      (filters.billing === "all" || item.cycle === filters.billing) &&
      differenceInCalendarDays(LOADED_AT, new Date(item.startedOn)) <= joined.days,
  );
  const filteredTotal = filtered ? rows.length : total;
  const pageCount = Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE));
  const page = Math.min(Math.max(filters.page, 1), pageCount);
  const first = (page - 1) * PAGE_SIZE + 1;
  const last = Math.min(page * PAGE_SIZE, filteredTotal);

  const visibleIds = rows.map((item) => item.id);
  const selectedVisible = visibleIds.filter((id) => selection.includes(id));
  const allSelected = visibleIds.length > 0 && selectedVisible.length === visibleIds.length;
  const toggle = (id: string, checked: boolean) =>
    setSelection((current) =>
      checked ? [...current, id] : current.filter((value) => value !== id),
    );

  const selected = subscriptions.find((item) => item.id === filters.subscription);
  const [shown, setShown] = useState(selected);
  if (selected && selected !== shown) setShown(selected);
  const opener = useRef<HTMLElement>(null);
  const view = (id: string, from: HTMLElement) => {
    opener.current = from;
    onChange({ subscription: id });
  };

  // Any change to the filters starts again from the first page.
  const refine = (next: Partial<Filters>) => onChange({ ...next, page: 1 });

  return (
    <>
      <DashboardCard className="flex flex-wrap items-center gap-3 px-4 py-3">
        <ToolMenu
          label="Plan"
          value={filters.plan}
          options={PLANS}
          onChange={(value) => refine({ plan: value as Filters["plan"] })}
        />
        <ToolMenu
          label="Status"
          value={filters.status}
          options={STATUSES}
          onChange={(value) => refine({ status: value as Filters["status"] })}
        />
        <ToolMenu
          label="Join Date"
          value={filters.joined}
          options={JOINED}
          onChange={(value) => refine({ joined: value as Filters["joined"] })}
        />
        {selection.length > 0 && (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {selection.length} selected{" "}
            <button
              type="button"
              onClick={() => setSelection([])}
              className="rounded-sm font-medium text-action outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 dark:text-primary"
            >
              Clear
            </button>
          </p>
        )}
        <div className="ml-auto flex items-center gap-1">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger
              aria-label={`Billing cycle${filters.billing !== "all" ? `: ${CYCLE_LABELS[filters.billing]}` : ""}`}
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-md text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=open]:bg-muted",
                filters.billing !== "all" && "text-action dark:text-primary",
              )}
            >
              <FunnelSimpleIcon aria-hidden weight="bold" className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Billing cycle</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={filters.billing}
                onValueChange={(value) => refine({ billing: value as Filters["billing"] })}
              >
                {BILLING.map((option) => (
                  <DropdownMenuRadioItem key={option.value} value={option.value} className="py-2">
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <div role="group" aria-label="Layout" className="flex">
            {(
              [
                { value: "list", label: "List", icon: ListBulletsIcon },
                { value: "grid", label: "Grid", icon: SquaresFourIcon },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={filters.view === option.value}
                onClick={() => onChange({ view: option.value })}
                className={cn(
                  "inline-flex size-9 items-center justify-center rounded-md transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
                  filters.view === option.value
                    ? "text-action dark:text-primary"
                    : "text-foreground",
                )}
              >
                <option.icon aria-hidden weight="bold" className="size-5.5" />
                <span className="sr-only">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </DashboardCard>

      <DashboardCard className="overflow-hidden p-0">
        {filters.view === "list" ? (
          <Table id={tableId} aria-label="Subscribers" className="min-w-240">
            <TableHeader className="[&_tr]:border-b [&_tr]:border-border/30 dark:[&_tr]:border-border">
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-14 pr-0 pl-5">
                  <Checkbox
                    aria-label="Select every subscriber on this page"
                    checked={
                      allSelected ? true : selectedVisible.length > 0 ? "indeterminate" : false
                    }
                    onCheckedChange={(checked) =>
                      setSelection((current) =>
                        checked === true
                          ? [...new Set([...current, ...visibleIds])]
                          : current.filter((id) => !visibleIds.includes(id)),
                      )
                    }
                    className="size-5"
                  />
                </TableHead>
                <TableHead className={head}>User</TableHead>
                <TableHead className={head}>
                  <span className="inline-block w-min">Sub ID</span>
                </TableHead>
                <TableHead className={head}>Plan</TableHead>
                <TableHead className={head}>Billing</TableHead>
                <TableHead className={cn(head, "text-right")}>Amount</TableHead>
                <TableHead className={head}>
                  <span className="inline-block w-min">Start Date</span>
                </TableHead>
                <TableHead className={head}>Renewal</TableHead>
                <TableHead className={cn(head, "pr-6")}>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => (
                <TableRow
                  key={item.id}
                  data-state={selection.includes(item.id) ? "selected" : undefined}
                  className="relative border-border/30 hover:bg-primary/5 data-[state=selected]:bg-primary/5 dark:border-border"
                >
                  <TableCell className="pr-0 pl-5">
                    {/* Above the name's overlay, so it selects instead of opening the details. */}
                    <Checkbox
                      aria-label={`Select ${item.user.name}`}
                      checked={selection.includes(item.id)}
                      onCheckedChange={(checked) => toggle(item.id, checked === true)}
                      className="relative z-10 size-5"
                    />
                  </TableCell>
                  <TableCell className="py-4 pr-4 pl-4">
                    <div className="flex items-center gap-3">
                      <SubscriberAvatar subscription={item} />
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={(click) => view(item.id, click.currentTarget)}
                          className="block text-left text-[15px]/5 font-medium outline-none after:absolute after:inset-0 focus-visible:after:ring-3 focus-visible:after:ring-ring/50 focus-visible:after:ring-inset"
                        >
                          {item.user.name}
                        </button>
                        <p className="truncate text-sm text-muted-foreground">{item.user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 font-mono text-[13px] whitespace-normal">
                    {/* Breaks after "SUB-", as the Figma's narrow column does. */}
                    <span className="block w-min">{item.id}</span>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "px-4 text-[15px]",
                      item.plan === "elite" && "font-medium text-action dark:text-primary",
                    )}
                  >
                    {PLAN_NAMES[item.plan]}
                  </TableCell>
                  <TableCell className="px-4 text-[15px]">
                    {item.cycle ? CYCLE_LABELS[item.cycle] : "–"}
                  </TableCell>
                  <TableCell className="px-4 text-right text-[15px] font-medium tabular-nums">
                    {formatMoney(item.amount)}
                  </TableCell>
                  <TableCell className="px-4 text-sm whitespace-normal text-muted-foreground">
                    <span className="block max-w-20">{item.startedOn}</span>
                  </TableCell>
                  <TableCell className="px-4 text-sm whitespace-normal text-muted-foreground">
                    <span className="block max-w-20">{item.nextRenewal ?? "–"}</span>
                  </TableCell>
                  <TableCell className="pr-6 pl-4">
                    <SubscriptionStatusBadge subscription={item} />
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={9}
                    className="h-24 text-center text-[13px] text-muted-foreground"
                  >
                    No subscribers match these filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        ) : (
          <ul
            id={tableId}
            aria-label="Subscribers"
            className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
          >
            {rows.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "relative flex flex-col gap-4 rounded-xl border border-border/40 bg-surface p-5 transition-colors hover:bg-muted/60 dark:border-border dark:bg-muted/30",
                  selection.includes(item.id) && "border-action/50 bg-primary/5",
                )}
              >
                <div className="flex items-start gap-3">
                  <SubscriberAvatar subscription={item} />
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={(click) => view(item.id, click.currentTarget)}
                      className="block text-left text-[15px]/5 font-medium outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
                    >
                      {item.user.name}
                    </button>
                    <p className="truncate text-sm text-muted-foreground">{item.user.email}</p>
                  </div>
                  <Checkbox
                    aria-label={`Select ${item.user.name}`}
                    checked={selection.includes(item.id)}
                    onCheckedChange={(checked) => toggle(item.id, checked === true)}
                    className="relative z-10 size-5"
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <PlanBadge plan={item.plan} />
                  <span className="text-[15px] font-medium tabular-nums">
                    {formatMoney(item.amount)}
                    {item.cycle && (
                      <span className="text-sm font-normal text-muted-foreground">
                        {PER_CYCLE[item.cycle]}
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 text-[13px] text-muted-foreground">
                  <span className="font-mono">{item.id}</span>
                  <SubscriptionStatusBadge subscription={item} />
                </div>
              </li>
            ))}
            {rows.length === 0 && (
              <li className="col-span-full py-10 text-center text-[13px] text-muted-foreground">
                No subscribers match these filters.
              </li>
            )}
          </ul>
        )}

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-border/30 px-6 py-4 dark:border-border">
          <p className="text-sm text-muted-foreground">
            {filteredTotal === 0
              ? "No subscribers to show"
              : `Showing ${count.format(first)} to ${count.format(last)} of ${count.format(filteredTotal)} ${filteredTotal === 1 ? "result" : "results"}`}
          </p>
          <PagePagination
            page={page}
            pageCount={pageCount}
            onPageChange={(next) => onChange({ page: next })}
            variant="squares"
          />
        </div>
      </DashboardCard>

      <SubscriptionSheet
        subscription={shown}
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) onChange({ subscription: null });
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

function SubscriberAvatar({ subscription }: { subscription: Subscription }) {
  return (
    <Avatar className="size-9 shrink-0 after:hidden">
      {subscription.user.avatarUrl && <AvatarImage src={subscription.user.avatarUrl} alt="" />}
      <AvatarFallback className="bg-info-soft text-sm font-semibold text-[#24637a] dark:bg-info-soft/15 dark:text-info-soft">
        {initials(subscription.user.name)}
      </AvatarFallback>
    </Avatar>
  );
}

/** "Plan: All ▾": an outlined filter button naming its current value. */
function ToolMenu({
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
  const current = options.find((option) => option.value === value) ?? options[0];
  const active = value !== options[0].value;
  return (
    // Not modal: a modal menu locks scrolling, and hiding the scrollbar shifts the page.
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-8.5 gap-2 rounded-md bg-background px-3.5 text-sm font-normal shadow-none dark:bg-input/30",
            active && "border-action text-action dark:border-primary dark:text-primary",
          )}
        >
          {label}: {current.label}
          <CaretDownIcon aria-hidden weight="bold" className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
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
