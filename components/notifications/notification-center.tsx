"use client";

import {
  BellSimpleIcon,
  CaretDownIcon,
  ChecksIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { cn } from "cn";
import { debounce, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useRef, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { ActionSheetContent } from "@/components/dashboard/action-sheet";
import { NotificationDetail } from "@/components/notifications/notification-detail";
import {
  NOTIFICATION_TYPES,
  NotificationCard,
  NotificationKpiRow,
} from "@/components/notifications/notification-parts";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type {
  AdminNotification,
  NotificationCounts,
  NotificationType,
} from "@/types/notifications";

const TYPES = Object.keys(NOTIFICATION_TYPES) as NotificationType[];
const TABS = ["all", "unread", ...TYPES] as const;

const PRIORITIES = [
  { value: "all", label: "Any priority" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
] as const;

const STATUSES = [
  { value: "all", label: "Any status" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
  { value: "resolved", label: "Resolved" },
] as const;

/** Every sample notification falls within the week, so the last two only differ once wired. */
const RANGES = [
  { value: "any", label: "Any time" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
] as const;

const DAYS = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
] as const;

// Kept in the URL, so a filtered list (and the open notification) can be shared.
const FILTERS = {
  tab: parseAsStringLiteral(TABS).withDefault("all"),
  q: parseAsString.withDefault(""),
  category: parseAsString.withDefault("all"),
  priority: parseAsStringLiteral(PRIORITIES.map((option) => option.value)).withDefault("all"),
  status: parseAsStringLiteral(STATUSES.map((option) => option.value)).withDefault("all"),
  range: parseAsStringLiteral(RANGES.map((option) => option.value)).withDefault("any"),
  notification: parseAsString,
};

interface Filters {
  tab: (typeof TABS)[number];
  q: string;
  category: string;
  priority: (typeof PRIORITIES)[number]["value"];
  status: (typeof STATUSES)[number]["value"];
  range: (typeof RANGES)[number]["value"];
  notification: string | null;
}

const DEFAULT_FILTERS: Filters = {
  tab: "all",
  q: "",
  category: "all",
  priority: "all",
  status: "all",
  range: "any",
  notification: null,
};

// The panel sits beside the list from xl; below that, a notification opens in a sheet.
const WIDE = "(min-width: 80rem)";
const subscribeWide = (onChange: () => void) => {
  const query = window.matchMedia(WIDE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

const filterButton =
  "h-9 gap-2 rounded-xl border-border bg-surface px-4 text-sm font-normal text-foreground shadow-none dark:bg-input/30";

interface CenterProps {
  /** UI only: the sample feed, filtered here. */
  notifications: AdminNotification[];
  counts: NotificationCounts;
}

/**
 * The notifications page: the counts, type tabs and filters over a feed
 * grouped by day, with the selected notification in full beside it. The tab,
 * filters and open notification live in the URL (?tab=, ?q=, ?category=,
 * ?priority=, ?status=, ?range=, ?notification=).
 */
export function NotificationCenter(props: CenterProps) {
  const [filters, setFilters] = useQueryStates(FILTERS);
  return (
    <CenterView
      {...props}
      filters={filters}
      onChange={(next, { debounced = false } = {}) =>
        // Typing waits for a pause before writing the URL; the list itself updates at once.
        setFilters(next, debounced ? { limitUrlUpdates: debounce(300) } : undefined)
      }
    />
  );
}

/** What renders before the URL is read: the whole feed, the first notification open. */
export function NotificationCenterFallback(props: CenterProps) {
  return <CenterView {...props} filters={DEFAULT_FILTERS} onChange={() => {}} />;
}

function CenterView({
  notifications,
  counts,
  filters,
  onChange,
}: CenterProps & {
  filters: Filters;
  onChange: (next: Partial<Filters> | null, options?: { debounced?: boolean }) => void;
}) {
  const wide = useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(WIDE).matches,
    () => true,
  );
  // UI only: read state lives in the page until PATCH /notifications/read is wired.
  const [readState, setReadState] = useState<Record<string, boolean>>({});
  const isUnread = (item: AdminNotification) => readState[item.id] ?? item.unread;
  // Set when the panel's X closes it on a wide screen, so it doesn't fall back to the first one.
  const [dismissed, setDismissed] = useState(false);
  const opener = useRef<HTMLElement>(null);

  const query = filters.q.trim().toLowerCase();
  const rows = notifications.filter((item) => {
    const unread = isUnread(item);
    return (
      (filters.tab === "all" || (filters.tab === "unread" ? unread : item.type === filters.tab)) &&
      (query === "" ||
        [item.title, item.summary, item.refId].some((field) =>
          field.toLowerCase().includes(query),
        )) &&
      (filters.category === "all" || item.category === filters.category) &&
      (filters.priority === "all" || item.priority === filters.priority) &&
      (filters.status === "all" ||
        (filters.status === "unread"
          ? unread
          : filters.status === "read"
            ? !unread && !item.resolved
            : item.resolved)) &&
      (filters.range === "any" ||
        filters.range === "7d" ||
        filters.range === "30d" ||
        item.day === filters.range)
    );
  });

  const chosen = notifications.find((item) => item.id === filters.notification);
  const selected = chosen ?? (wide && !dismissed ? rows[0] : undefined);
  // Keeps the last notification in the sheet while it slides out.
  const [shown, setShown] = useState(selected);
  if (selected && selected !== shown) setShown(selected);

  const changedUnread = notifications.reduce(
    (total, item) => total + Number(isUnread(item)) - Number(item.unread),
    0,
  );
  const liveCounts = { ...counts, unread: Math.max(0, counts.unread + changedUnread) };
  const anyUnread = notifications.some(isUnread);
  const categories = [...new Set(notifications.map((item) => item.category))].sort();

  const select = (item: AdminNotification, from: HTMLElement) => {
    opener.current = from;
    setDismissed(false);
    onChange({ notification: item.id });
  };
  const close = () => {
    setDismissed(true);
    onChange({ notification: null });
  };
  const toggleRead = (item: AdminNotification) =>
    setReadState((state) => ({ ...state, [item.id]: !isUnread(item) }));

  const detail = (item: AdminNotification, inSheet: boolean) => (
    <NotificationDetail
      notification={item}
      unread={isUnread(item)}
      onToggleRead={() => toggleRead(item)}
      onClose={close}
      titleAs={inSheet ? DialogPrimitive.Title : "h2"}
      className="h-full"
    />
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_25rem] xl:gap-11 xl:pt-8">
      <section aria-labelledby="notifications-title" className="min-w-0 xl:border-r">
        <div className="flex flex-col gap-4 border-b pb-8 sm:flex-row sm:items-center sm:justify-between xl:px-7.5">
          <div>
            <h1 id="notifications-title" className="text-[30px]/9 font-bold">
              Notifications
            </h1>
            <p className="mt-4 max-w-80 text-sm/5 text-muted-foreground">
              Stay up to date with important activity and alerts across Xparience.
            </p>
          </div>
          <button
            type="button"
            disabled={!anyUnread}
            onClick={() => {
              setReadState(Object.fromEntries(notifications.map((item) => [item.id, false])));
              toast("Marked as read on this page only: syncing read state isn't available yet");
            }}
            className="flex h-14 shrink-0 items-center gap-2.5 self-start rounded-xl border border-[#dbe1e4] bg-surface px-6 text-xs/4 font-semibold tracking-wider text-action transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 sm:self-auto dark:border-border dark:bg-input/30 dark:text-primary"
          >
            <ChecksIcon aria-hidden weight="bold" className="size-4.5 shrink-0" />
            <span className="max-w-17 text-center">Mark All as Read</span>
          </button>
        </div>

        <div className="pt-6 xl:px-7.5">
          <NotificationKpiRow counts={liveCounts} />

          {/* Scrolls sideways where the tabs don't fit, as the Figma's run past its edge. */}
          <div
            role="group"
            aria-label="Show"
            className="mt-12 [scrollbar-width:none] overflow-x-auto border-b"
          >
            <div className="flex w-max">
              {TABS.map((tab) => {
                const current = tab === filters.tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    aria-pressed={current}
                    onClick={() => onChange({ tab })}
                    className={cn(
                      "relative px-5 pt-3 pb-3.5 text-base/6 whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
                      current
                        ? "font-semibold text-primary after:absolute after:inset-x-0 after:-bottom-px after:h-0.75 after:rounded-full after:bg-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {tab === "all"
                      ? "All"
                      : tab === "unread"
                        ? "Unread"
                        : NOTIFICATION_TYPES[tab].label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5.5 flex flex-wrap items-center gap-x-2.5 gap-y-4">
            <div className="relative min-w-0 flex-[1_1_22.5rem]">
              <MagnifyingGlassIcon
                aria-hidden
                weight="bold"
                className="pointer-events-none absolute top-1/2 left-4 size-4.5 -translate-y-1/2 text-foreground"
              />
              <Input
                type="search"
                aria-label="Search notifications"
                placeholder="Search notifications..."
                value={filters.q}
                onChange={(change) => onChange({ q: change.target.value }, { debounced: true })}
                className="h-9 rounded-xl bg-surface pl-11 text-sm placeholder:text-[#6b7280] md:text-sm dark:bg-input/30"
              />
            </div>
            <FilterMenu
              label="Category"
              value={filters.category}
              options={[
                { value: "all", label: "Any category" },
                ...categories.map((category) => ({ value: category, label: category })),
              ]}
              onChange={(category) => onChange({ category })}
            />
            <FilterMenu
              label="Priority"
              value={filters.priority}
              options={PRIORITIES}
              onChange={(priority) => onChange({ priority: priority as Filters["priority"] })}
            />
            <FilterMenu
              label="Status"
              value={filters.status}
              options={STATUSES}
              onChange={(status) => onChange({ status: status as Filters["status"] })}
            />
            <FilterMenu
              label="Date Range"
              value={filters.range}
              options={RANGES}
              onChange={(range) => onChange({ range: range as Filters["range"] })}
            />
            <button
              type="button"
              onClick={() =>
                onChange({ q: "", category: "all", priority: "all", status: "all", range: "any" })
              }
              className="ml-3 rounded-sm px-1 text-sm font-semibold text-action outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 dark:text-primary"
            >
              Reset Filters
            </button>
          </div>

          {DAYS.map((day) => {
            const items = rows.filter((item) => item.day === day.id);
            if (items.length === 0) return null;
            return (
              <section key={day.id} aria-labelledby={`day-${day.id}`} className="mt-5">
                <h2
                  id={`day-${day.id}`}
                  className="text-xs/4 font-semibold tracking-[0.2em] text-muted-foreground uppercase"
                >
                  {day.label}
                </h2>
                <ul className="mt-4 flex flex-col gap-3">
                  {items.map((item) => (
                    <li key={item.id}>
                      <NotificationCard
                        notification={{ ...item, unread: isUnread(item) }}
                        selected={item.id === selected?.id}
                        onSelect={(from) => select(item, from)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
          {rows.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
              No notifications match these filters.
            </p>
          ) : (
            <button
              type="button"
              // UI only: there's no admin feed to page through yet.
              onClick={() => toast("Earlier notifications aren't available yet")}
              className="mt-6 mb-2 h-29 w-full rounded-xl border bg-surface text-sm text-outline transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-card"
            >
              Show earlier notifications
            </button>
          )}
        </div>
      </section>

      {/* From xl: the selected notification beside the list, held in view as the list scrolls. */}
      {wide && (
        <aside
          aria-label="Notification details"
          className="sticky top-26 hidden h-[calc(100svh-8rem)] overflow-hidden rounded-xl border border-border/30 bg-surface shadow-[0_8px_30px_rgb(24_28_30/0.08)] xl:block dark:border-border dark:bg-card"
        >
          {selected ? (
            detail(selected, false)
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-10 text-center text-sm text-muted-foreground">
              <BellSimpleIcon aria-hidden weight="bold" className="size-8 text-outline" />
              Select a notification to see its details.
            </div>
          )}
        </aside>
      )}

      {/* Below xl: the same details in a sheet. */}
      <Dialog
        open={!wide && Boolean(chosen)}
        onOpenChange={(open) => {
          if (!open) onChange({ notification: null });
        }}
      >
        <ActionSheetContent
          className="max-w-100"
          onCloseAutoFocus={(close) => {
            if (!opener.current?.isConnected) return;
            close.preventDefault();
            opener.current.focus();
          }}
        >
          {shown && (
            <>
              <DialogPrimitive.Description className="sr-only">
                {shown.summary}
              </DialogPrimitive.Description>
              {detail(shown, true)}
            </>
          )}
        </ActionSheetContent>
      </Dialog>
    </div>
  );
}

/** A rounded filter button with a chevron, opening the filter's options. */
function FilterMenu({
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
            filterButton,
            active && "border-action text-action dark:border-primary dark:text-primary",
          )}
        >
          {active ? current?.label : label}
          {active && <span className="sr-only"> ({label})</span>}
          <CaretDownIcon aria-hidden weight="bold" className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
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
