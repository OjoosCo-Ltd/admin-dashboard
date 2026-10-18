"use client";

import {
  CaretLeftIcon,
  CaretLineLeftIcon,
  CaretLineRightIcon,
  CaretRightIcon,
  DownloadSimpleIcon,
  FunnelXIcon,
  HardDrivesIcon,
  MagnifyingGlassIcon,
  UserMinusIcon,
} from "@phosphor-icons/react";
import { cn } from "cn";
import {
  parseAsInteger,
  parseAsNumberLiteral,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { type ReactNode, useId } from "react";

import { ToastButton } from "@/components/dashboard/toast-button";
import { formatStamp } from "@/components/settings/settings-format";
import { AUDIT_RESULT, initials } from "@/components/settings/settings-labels";
import { SettingsCard, SettingsSectionHeader } from "@/components/settings/settings-section";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AuditActionType, AuditLog } from "@/types/settings";

const ACTION_TYPES: { value: AuditActionType; label: string }[] = [
  { value: "moderation", label: "Moderation" },
  { value: "settings", label: "Settings change" },
  { value: "export", label: "Export" },
  { value: "sync", label: "Data sync" },
  { value: "sign-in", label: "Sign-in" },
];

const PAGE_SIZES = [10, 25, 50, 100] as const;

// Kept in the URL, so a filtered view can be shared and survives a reload.
const FILTERS = {
  q: parseAsString.withDefault(""),
  actor: parseAsString.withDefault("all"),
  module: parseAsString.withDefault("all"),
  action: parseAsStringLiteral(["all", ...ACTION_TYPES.map((type) => type.value)]).withDefault(
    "all",
  ),
  date: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  rows: parseAsNumberLiteral(PAGE_SIZES).withDefault(50),
};

interface Filters {
  q: string;
  actor: string;
  module: string;
  action: "all" | AuditActionType;
  date: string;
  page: number;
  rows: (typeof PAGE_SIZES)[number];
}

const DEFAULTS: Filters = {
  q: "",
  actor: "all",
  module: "all",
  action: "all",
  date: "",
  page: 1,
  rows: 50,
};

// Admins get a tint picked from their name, the same one every time.
const TINTS = [
  "bg-success-soft text-success-strong dark:bg-success/20 dark:text-success",
  "bg-[#a26727] text-white",
  "bg-[#e3dcf5] text-[#5b3fa0] dark:bg-[#5b3fa0]/40 dark:text-[#d6c8ff]",
  "bg-info-soft text-[#4d6876] dark:bg-action/30 dark:text-primary",
];

const tint = (name: string) => TINTS[name.charCodeAt(0) % TINTS.length];

interface AuditLogsProps {
  /** UI only: one sample page, filtered here. */
  logs: AuditLog[];
  /** Every log, for the count and pages while no filter is set. */
  totalCount: number;
}

/** The audit trail with its filters, page and page size in the URL. */
export function AuditLogs(props: AuditLogsProps) {
  const [filters, setFilters] = useQueryStates(FILTERS);
  return <AuditLogsView {...props} filters={filters} onChange={(next) => setFilters(next)} />;
}

/** What renders before the URL is read: the unfiltered first page. */
export function AuditLogsFallback(props: AuditLogsProps) {
  return <AuditLogsView {...props} filters={DEFAULTS} onChange={() => {}} />;
}

function AuditLogsView({
  logs,
  totalCount,
  filters,
  onChange,
}: AuditLogsProps & { filters: Filters; onChange: (next: Partial<Filters>) => void }) {
  const searchId = useId();
  const actors = [...new Set(logs.map((log) => log.actor.name))];
  const modules = [...new Set(logs.map((log) => log.module))].toSorted();
  const query = filters.q.trim().toLowerCase();

  const filtered = logs.filter(
    (log) =>
      (!query ||
        [log.action, log.actor.name, log.actor.detail, log.module, log.ip]
          .join(" ")
          .toLowerCase()
          .includes(query)) &&
      (filters.actor === "all" || log.actor.name === filters.actor) &&
      (filters.module === "all" || log.module === filters.module) &&
      (filters.action === "all" || log.actionType === filters.action) &&
      (!filters.date || log.at.startsWith(filters.date)),
  );
  const filtering =
    Boolean(query) ||
    filters.actor !== "all" ||
    filters.module !== "all" ||
    filters.action !== "all" ||
    Boolean(filters.date);

  // Unfiltered, every page shows the same sample rows; filtered, the matches are paged here.
  const total = filtering ? filtered.length : totalCount;
  const pageCount = Math.max(1, Math.ceil(total / filters.rows));
  const page = Math.min(Math.max(filters.page, 1), pageCount);
  const visible = filtering
    ? filtered.slice((page - 1) * filters.rows, page * filters.rows)
    : filtered;
  const first = total === 0 ? 0 : (page - 1) * filters.rows + 1;
  const last = first === 0 ? 0 : first + visible.length - 1;

  const select =
    "h-10 rounded-lg border-0 bg-muted px-4 text-sm text-foreground data-[size=default]:h-10 dark:bg-muted/60 [&_svg:not([class*='size-'])]:size-5";

  return (
    <>
      <SettingsSectionHeader
        title="Audit Logs"
        description="Monitor and track system activities, administrative actions, and security events."
      >
        <ToastButton
          message="Exporting audit logs isn't available yet"
          className="flex h-8.5 items-center gap-2 rounded-lg border border-[#dbe1e5] bg-background px-4 text-sm font-semibold tracking-wide outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 dark:border-border"
        >
          <DownloadSimpleIcon aria-hidden weight="bold" className="size-4.5" />
          Export Logs (CSV)
        </ToastButton>
      </SettingsSectionHeader>

      <SettingsCard
        role="search"
        aria-label="Filter audit logs"
        className="flex flex-wrap items-center gap-2.5 bg-surface p-3 dark:bg-card"
      >
        <label htmlFor={searchId} className="sr-only">
          Search audit logs
        </label>
        <div className="relative min-w-44 flex-1">
          <MagnifyingGlassIcon
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id={searchId}
            type="search"
            value={filters.q}
            onChange={(event) => onChange({ q: event.target.value, page: 1 })}
            placeholder="Search audit logs by keyword, admin, or target..."
            className="h-10 rounded-lg border-0 bg-muted pl-11 text-sm md:text-sm dark:bg-muted/60"
          />
        </div>
        <span aria-hidden className="hidden h-8 w-px bg-border/60 lg:block" />
        <FilterSelect
          label="Admin or user"
          value={filters.actor}
          placeholder="Admin / User"
          options={actors.map((actor) => ({ value: actor, label: actor }))}
          onChange={(actor) => onChange({ actor, page: 1 })}
          className={cn(select, "w-34")}
        />
        <FilterSelect
          label="Module"
          value={filters.module}
          placeholder="Module"
          options={modules.map((module) => ({ value: module, label: module }))}
          onChange={(module) => onChange({ module, page: 1 })}
          className={cn(select, "w-40")}
        />
        <FilterSelect
          label="Action type"
          value={filters.action}
          placeholder="Action Type"
          options={ACTION_TYPES}
          onChange={(action) => onChange({ action: action as Filters["action"], page: 1 })}
          className={cn(select, "w-31")}
        />
        <Input
          type="date"
          aria-label="Date"
          value={filters.date}
          onChange={(event) => onChange({ date: event.target.value, page: 1 })}
          className="h-10 w-36 rounded-lg border-0 bg-muted px-3 text-sm md:text-sm dark:bg-muted/60 dark:[color-scheme:dark]"
        />
        <button
          type="button"
          aria-label="Clear filters"
          disabled={!filtering}
          onClick={() => onChange({ ...DEFAULTS, rows: filters.rows })}
          className="flex size-10 items-center justify-center rounded-lg bg-container text-foreground outline-none hover:bg-muted-strong focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-muted"
        >
          <FunnelXIcon aria-hidden className="size-5" />
        </button>
      </SettingsCard>

      <SettingsCard className="mt-8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-250 text-left">
            <caption className="sr-only">Audit logs</caption>
            <thead className="bg-muted dark:bg-muted/40">
              <tr className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                <th scope="col" className="w-18 py-4.5 pl-4">
                  <span className="sr-only">Avatar</span>
                </th>
                <th scope="col" className="w-[21%] py-4.5 pl-2 font-semibold">
                  Admin / Actor
                </th>
                <th scope="col" className="w-[24%] py-4.5 font-semibold">
                  Action Detail
                </th>
                <th scope="col" className="w-[13%] py-4.5 font-semibold">
                  Module
                </th>
                <th scope="col" className="w-[14%] py-4.5 font-semibold">
                  Date &amp; Time
                </th>
                <th scope="col" className="w-[14%] py-4.5 font-semibold">
                  IP / Session
                </th>
                <th scope="col" className="py-4.5 pr-4 text-right font-semibold">
                  Result
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 dark:divide-border">
              {visible.map((log) => {
                const result = AUDIT_RESULT[log.result];
                return (
                  <tr key={log.id}>
                    <td className="py-3 pl-6">
                      <ActorAvatar log={log} />
                    </td>
                    <td className="py-3 pr-3 pl-2">
                      <span className="block text-sm leading-5">{log.actor.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {log.actor.detail}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-sm leading-5">{log.action}</td>
                    <td className="py-3.5 pr-3">
                      <span className="inline-block max-w-28 rounded-md border border-[#e3e7eb] bg-container px-2 py-1 text-center text-xs leading-4 text-muted-foreground dark:border-border dark:bg-muted">
                        {log.module}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-sm whitespace-nowrap">
                      <time dateTime={log.at}>{formatStamp(log.at)}</time>
                    </td>
                    <td className="py-3.5 pr-3 font-mono text-xs leading-4 text-muted-foreground">
                      <span className="block">{log.ip}</span>
                      <span className="block">{log.session}</span>
                    </td>
                    <td className="py-3.5 pr-4 text-right">
                      <span
                        className={cn(
                          "inline-flex h-7 items-center gap-2 rounded-full border px-3 text-[13px]",
                          result.className,
                        )}
                      >
                        <span aria-hidden className={cn("size-1.5 rounded-full", result.dot)} />
                        {result.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={7} className="h-32 text-center text-muted-foreground">
                    No logs match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-border/40 bg-muted px-5 py-4 dark:border-border dark:bg-muted/40">
          <p className="text-sm">
            Showing {first} to {last} of {total.toLocaleString("en-US")} logs
          </p>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-3 text-sm">
              Rows per page:
              <Select
                value={String(filters.rows)}
                onValueChange={(value) =>
                  onChange({ rows: Number(value) as Filters["rows"], page: 1 })
                }
              >
                <SelectTrigger
                  aria-label="Rows per page"
                  className="h-9 w-20 border-0 bg-transparent px-2 text-lg shadow-none data-[size=default]:h-9 [&_svg:not([class*='size-'])]:size-5"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  {PAGE_SIZES.map((size) => (
                    <SelectItem key={size} value={String(size)} className="text-sm">
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <nav aria-label="Audit log pages" className="flex items-center gap-1">
              <PageButton
                label="First page"
                disabled={page <= 1}
                onClick={() => onChange({ page: 1 })}
              >
                <CaretLineLeftIcon />
              </PageButton>
              <PageButton
                label="Previous page"
                disabled={page <= 1}
                onClick={() => onChange({ page: page - 1 })}
              >
                <CaretLeftIcon />
              </PageButton>
              <PageButton
                label="Next page"
                disabled={page >= pageCount}
                onClick={() => onChange({ page: page + 1 })}
              >
                <CaretRightIcon />
              </PageButton>
              <PageButton
                label="Last page"
                disabled={page >= pageCount}
                onClick={() => onChange({ page: pageCount })}
              >
                <CaretLineRightIcon />
              </PageButton>
            </nav>
          </div>
        </div>
      </SettingsCard>
    </>
  );
}

function FilterSelect({
  label,
  value,
  placeholder,
  options,
  onChange,
  className,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className={className}>
        {value === "all" ? (
          <span className="truncate">{placeholder}</span>
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectItem value="all" className="text-sm">
          {`Any ${label.toLowerCase()}`}
        </SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className="text-sm">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function PageButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-8 items-center justify-center rounded-md text-foreground outline-none hover:bg-background focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-35 [&_svg]:size-5"
    >
      {children}
    </button>
  );
}

function ActorAvatar({ log }: { log: AuditLog }) {
  if (log.actor.kind !== "admin") {
    const Glyph = log.actor.kind === "system" ? HardDrivesIcon : UserMinusIcon;
    return (
      <span
        aria-hidden
        className="flex size-8 items-center justify-center rounded-full bg-container text-muted-foreground dark:bg-muted"
      >
        <Glyph className="size-4.5" />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-8 items-center justify-center rounded-full text-[13px]",
        tint(log.actor.name),
      )}
    >
      {initials(log.actor.name)}
    </span>
  );
}
