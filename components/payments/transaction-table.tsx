"use client";

import {
  DotsThreeVerticalIcon,
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { cn } from "cn";
import {
  debounce,
  type inferParserType,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { PagePagination } from "@/components/dashboard/page-pagination";
import {
  METHOD_ICONS,
  METHOD_LABELS,
  PaymentStatusBadge,
  STATUS_LABELS,
  methodText,
  productLabel,
} from "@/components/payments/payment-badges";
import { CustomerAvatar, TransactionSheet } from "@/components/payments/transaction-sheet";
import { PLAN_NAMES } from "@/components/subscriptions/subscription-format";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import { formatMoney } from "@/libs/money";
import type { PaymentMethodKind, PaymentStatus, Transaction } from "@/types/payments";
import type { PlanId } from "@/types/subscriptions";

/** The Figma shows five rows a page. */
const PAGE_SIZE = 5;

const STATUSES = [
  "all",
  "successful",
  "failed",
  "refunded",
  "pending",
] as const satisfies readonly ("all" | PaymentStatus)[];

const PRODUCTS = ["all", "basic", "premium", "elite"] as const satisfies readonly (
  "all" | PlanId
)[];

const METHODS = [
  "all",
  "card",
  "paypal",
  "apple-pay",
  "bank-transfer",
] as const satisfies readonly ("all" | PaymentMethodKind)[];

const FILTERS = {
  q: parseAsString.withDefault(""),
  status: parseAsStringLiteral(STATUSES).withDefault("all"),
  product: parseAsStringLiteral(PRODUCTS).withDefault("all"),
  method: parseAsStringLiteral(METHODS).withDefault("all"),
  page: parseAsInteger.withDefault(1),
  transaction: parseAsString,
};

type Filters = inferParserType<typeof FILTERS>;

const DEFAULT_FILTERS: Filters = {
  q: "",
  status: "all",
  product: "all",
  method: "all",
  page: 1,
  transaction: null,
};

const isOneOf = <T extends string>(options: readonly T[], value: string): value is T =>
  (options as readonly string[]).includes(value);

// The Figma's table opens with an empty 92px column. It's dropped here and
// its width shared out. The widths are targets: a column still grows to fit,
// and the cells' narrowest widths add up to under 900px, so the table fits a
// 1280px screen without scrolling.
const COLUMNS = [
  { label: "Transaction ID", width: "w-[12%]", className: "pl-6" },
  { label: "User", width: "w-[22%]" },
  { label: "Product", width: "w-[15%]" },
  { label: "Amount", width: "w-[10%]" },
  { label: "Method", width: "w-[12%]" },
  { label: "Date", width: "w-[11%]" },
  { label: "Status", width: "w-[10%]" },
  { label: "Actions", width: "w-[8%]", className: "text-center" },
];

// The selects and More Filters: 32px, outlined in the Figma's light grey.
const control =
  "h-8 rounded-md border-[#d5d6d7] bg-background text-[13px] shadow-none dark:border-input dark:bg-input/30";

const count = new Intl.NumberFormat("en-GB");

interface TransactionTableProps {
  /** UI only: the sample transactions, filtered here. */
  transactions: Transaction[];
  /** Every transaction, for the count and pages while no filter is set. */
  total: number;
}

/**
 * Recent Transactions: search, status, product and payment-method filters,
 * the transactions and their pages. A row opens the transaction's sheet. The
 * filters, page and open transaction live in the URL (?q=, ?status=,
 * ?product=, ?method=, ?page=, ?transaction=).
 */
export function TransactionTable(props: TransactionTableProps) {
  const [filters, setFilters] = useQueryStates(FILTERS);
  return (
    <TransactionView
      {...props}
      filters={filters}
      onChange={(next, { debounced = false } = {}) =>
        // Typing waits for a pause before writing the URL; the rows update at once.
        void setFilters(next, debounced ? { limitUrlUpdates: debounce(300) } : undefined)
      }
    />
  );
}

/** What renders before the URL is read: every transaction, no sheet. */
export function TransactionTableFallback(props: TransactionTableProps) {
  return <TransactionView {...props} filters={DEFAULT_FILTERS} onChange={() => {}} />;
}

function TransactionView({
  transactions,
  total,
  filters,
  onChange,
}: TransactionTableProps & {
  filters: Filters;
  onChange: (next: Partial<Filters>, options?: { debounced?: boolean }) => void;
}) {
  const query = filters.q.trim().toLowerCase();
  const filtered =
    query !== "" ||
    filters.status !== "all" ||
    filters.product !== "all" ||
    filters.method !== "all";

  // UI only: there's no transactions route, so the sample rows are filtered
  // here. Filtered, the matches are paged; unfiltered, the sample stands in
  // for every transaction and each page shows the first of them.
  const matches = transactions.filter(
    (row) =>
      (query === "" ||
        [`#${row.id}`, row.customer.name, row.customer.email].some((field) =>
          field.toLowerCase().includes(query),
        )) &&
      (filters.status === "all" || row.status === filters.status) &&
      (filters.product === "all" || row.plan === filters.product) &&
      (filters.method === "all" || row.method.kind === filters.method),
  );
  const filteredTotal = filtered ? matches.length : total;
  const pageCount = Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE));
  const page = Math.min(Math.max(filters.page, 1), pageCount);
  const first = (page - 1) * PAGE_SIZE + 1;
  const last = Math.min(page * PAGE_SIZE, filteredTotal);
  const rows = filtered ? matches.slice(first - 1, last) : matches.slice(0, PAGE_SIZE);

  const selected = transactions.find((row) => row.id === filters.transaction);
  // Keeps the last transaction on screen while the sheet animates closed.
  const [shown, setShown] = useState(selected);
  if (selected && selected !== shown) setShown(selected);
  // The name or ⋮ that opened the sheet, to take focus back when it closes.
  const opener = useRef<HTMLElement>(null);
  const body = useRef<HTMLTableSectionElement>(null);
  const view = (id: string, from: HTMLElement) => {
    opener.current = from;
    onChange({ transaction: id });
  };

  // Any change to the filters starts again from the first page.
  const refine = (next: Partial<Filters>, options?: { debounced?: boolean }) =>
    onChange({ ...next, page: 1 }, options);

  return (
    <section aria-labelledby="recent-transactions-title">
      <DashboardCard className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 px-6 pt-6 pb-4">
          <DashboardCardTitle id="recent-transactions-title" className="text-xl/7 font-semibold">
            Recent Transactions
          </DashboardCardTitle>
          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
            <div className="relative w-full sm:w-48">
              <MagnifyingGlassIcon
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              />
              {/* The Figma outlines the search darker than the filters beside it. */}
              <Input
                type="search"
                aria-label="Search transactions"
                placeholder="Search..."
                value={filters.q}
                onChange={(event) => refine({ q: event.target.value }, { debounced: true })}
                className="h-8 rounded-md border-[#6b7280] bg-background pl-7 text-[13px] md:text-[13px] dark:border-input dark:bg-input/30"
              />
            </div>
            <Select
              value={filters.status}
              onValueChange={(value) => {
                if (isOneOf(STATUSES, value)) refine({ status: value });
              }}
            >
              <SelectTrigger
                aria-label="Filter by status"
                className={cn(control, "w-30.5 grow px-3 text-muted-foreground sm:grow-0")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                {STATUSES.map((value) => (
                  <SelectItem key={value} value={value} className="py-2">
                    {value === "all" ? "All Statuses" : STATUS_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.product}
              onValueChange={(value) => {
                if (isOneOf(PRODUCTS, value)) refine({ product: value });
              }}
            >
              <SelectTrigger
                aria-label="Filter by product"
                className={cn(control, "w-30.5 grow px-3 text-muted-foreground sm:grow-0")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                {PRODUCTS.map((value) => (
                  <SelectItem key={value} value={value} className="py-2">
                    {value === "all" ? "All Products" : PLAN_NAMES[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Not modal: a modal menu locks scrolling, and hiding the scrollbar shifts the page. */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    control,
                    "grow gap-1 pr-3 pl-2.5 font-normal sm:grow-0",
                    filters.method !== "all" &&
                      "border-action text-action dark:border-primary dark:text-primary",
                  )}
                >
                  <FunnelSimpleIcon aria-hidden className="size-3.5" />
                  More Filters
                  {filters.method !== "all" && (
                    <span className="sr-only">: {METHOD_LABELS[filters.method]}</span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Payment method</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={filters.method}
                  onValueChange={(value) => {
                    if (isOneOf(METHODS, value)) refine({ method: value });
                  }}
                >
                  {METHODS.map((value) => (
                    <DropdownMenuRadioItem key={value} value={value} className="py-2">
                      {value === "all" ? "All methods" : METHOD_LABELS[value]}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mx-6 overflow-hidden rounded-xl border border-border">
          <Table aria-labelledby="recent-transactions-title" className="min-w-225">
            <colgroup>
              {COLUMNS.map((column) => (
                <col key={column.label} className={column.width} />
              ))}
            </colgroup>
            <TableHeader className="[&_tr]:border-b-0">
              {/* The Figma leaves an 8px white strip above the header's grey; it's filled here. */}
              <TableRow className="bg-[#f8f8f8] hover:bg-[#f8f8f8] dark:bg-muted/50 dark:hover:bg-muted/50">
                {COLUMNS.map((column) => (
                  <TableHead
                    key={column.label}
                    className={cn(
                      "h-16 px-3 text-xs/4 font-semibold tracking-wider whitespace-normal text-muted-foreground uppercase",
                      column.className,
                    )}
                  >
                    {/* "Transaction ID" stacks, as the Figma sets it. */}
                    <span className="inline-block w-min">{column.label}</span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody ref={body}>
              {rows.map((row) => (
                <TransactionRow
                  key={row.id}
                  transaction={row}
                  open={row.id === filters.transaction}
                  onView={(from) => view(row.id, from)}
                />
              ))}
              {rows.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={COLUMNS.length}
                    className="h-24 text-center text-[13px] text-muted-foreground"
                  >
                    No transactions match these filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 pt-4 pb-7">
          <p className="text-[13px] text-muted-foreground">
            {filteredTotal === 0
              ? "No entries to show"
              : `Showing ${count.format(first)} to ${count.format(last)} of ${count.format(filteredTotal)} ${filteredTotal === 1 ? "entry" : "entries"}`}
          </p>
          <PagePagination
            page={page}
            pageCount={pageCount}
            onPageChange={(next) => onChange({ page: next })}
            variant="squares"
          />
        </div>
      </DashboardCard>

      <TransactionSheet
        transaction={shown}
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) onChange({ transaction: null });
        }}
        onCloseAutoFocus={(event) => {
          // Opened from a link, there's no opener: fall back to the row's name. The
          // opener is cleared so a later link can't send focus back to an old one.
          const target = opener.current?.isConnected
            ? opener.current
            : shown &&
              body.current?.querySelector<HTMLElement>(
                `[data-transaction="${CSS.escape(shown.id)}"]`,
              );
          opener.current = null;
          if (!target) return;
          event.preventDefault();
          target.focus();
        }}
      />
    </section>
  );
}

function TransactionRow({
  transaction,
  open,
  onView,
}: {
  transaction: Transaction;
  /** Its sheet is open. */
  open: boolean;
  /** Opens the sheet. `from` gets focus back when it closes. */
  onView: (from: HTMLElement) => void;
}) {
  const { customer } = transaction;
  const MethodIcon = METHOD_ICONS[transaction.method.kind];
  const prefixEnd = transaction.id.indexOf("-") + 1;

  return (
    <TableRow
      data-state={open ? "selected" : undefined}
      className="relative border-border/50 text-base hover:bg-primary/5 data-[state=selected]:bg-primary/5 dark:border-border"
    >
      <TableCell className="py-3 pr-3 pl-6 whitespace-normal text-muted-foreground">
        {/* Breaks after "#TRX-" only, as the Figma's narrow column does. Browsers won't
            break between a hyphen and a digit on their own, hence the <wbr>. */}
        <span className="block w-min">
          #{transaction.id.slice(0, prefixEnd)}
          <wbr />
          <span className="whitespace-nowrap">{transaction.id.slice(prefixEnd)}</span>
        </span>
      </TableCell>
      <TableCell className="p-3 whitespace-normal">
        <div className="flex items-center gap-3">
          <CustomerAvatar customer={customer} className="size-8 shrink-0" />
          <div className="min-w-0 flex-1">
            {/* Stretched over the row, so anywhere on it opens the details. */}
            <button
              type="button"
              data-transaction={transaction.id}
              onClick={(click) => onView(click.currentTarget)}
              className="block text-left outline-none after:absolute after:inset-0 focus-visible:after:ring-3 focus-visible:after:ring-ring/50 focus-visible:after:ring-inset"
            >
              {customer.name}
            </button>
            {/* w-0 min-w-full: the email takes the column's width but never widens it. */}
            <p className="w-0 min-w-full truncate text-xs text-muted-foreground">
              {customer.email}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className="p-3 whitespace-normal">
        {/* Wide enough for "Premium Sub" and narrow enough that every plan breaks
            before its cycle, as in the Figma. */}
        <span className="block max-w-30 min-w-26">{productLabel(transaction)}</span>
      </TableCell>
      <TableCell className="p-3 font-semibold tabular-nums">
        {formatMoney(transaction.amount)}
      </TableCell>
      <TableCell className="p-3 whitespace-normal text-muted-foreground">
        <span className="flex items-center gap-2">
          <MethodIcon aria-hidden className="size-4 shrink-0" />
          <span className="max-w-20 min-w-15 text-[13px]/4.5">
            {methodText(transaction.method, "table")}
          </span>
        </span>
      </TableCell>
      <TableCell className="p-3 whitespace-normal text-muted-foreground">
        {/* "Oct 24," / "2023" / "14:32", as the Figma wraps it. */}
        <span className="block w-16">{transaction.date}</span>
        <span className="block">{transaction.time}</span>
      </TableCell>
      <TableCell className="p-3">
        <PaymentStatusBadge status={transaction.status} />
      </TableCell>
      <TableCell className="p-3 text-center">
        <RowActions transaction={transaction} onView={onView} />
      </TableCell>
    </TableRow>
  );
}

/** A row's ⋮ menu: the details, plus what can be done with a payment in its state. */
function RowActions({
  transaction,
  onView,
}: {
  transaction: Transaction;
  onView: (from: HTMLElement) => void;
}) {
  const { status } = transaction;
  const menuRef = useRef<HTMLButtonElement>(null);
  // Set when View details opens the sheet: that takes focus, so the menu mustn't take it back.
  const handedOff = useRef(false);

  return (
    <DropdownMenu modal={false}>
      {/* Above the name's overlay, so it opens the menu instead of the sheet. */}
      <DropdownMenuTrigger
        ref={menuRef}
        aria-label={`Actions for #${transaction.id}`}
        className="relative z-10 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=open]:bg-muted"
      >
        <DotsThreeVerticalIcon aria-hidden weight="bold" className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-44"
        onCloseAutoFocus={(event) => {
          if (handedOff.current) event.preventDefault();
          handedOff.current = false;
        }}
      >
        <DropdownMenuItem
          onSelect={() => {
            if (!menuRef.current) return;
            handedOff.current = true;
            onView(menuRef.current);
          }}
        >
          View details
        </DropdownMenuItem>
        {(status === "successful" || status === "refunded") && (
          <DropdownMenuItem onSelect={() => toast("Receipts aren't available yet")}>
            Download receipt
          </DropdownMenuItem>
        )}
        {status === "failed" && (
          <DropdownMenuItem onSelect={() => toast("Retrying payments isn't available yet")}>
            Retry payment
          </DropdownMenuItem>
        )}
        {status === "successful" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => toast("Refunds aren't available yet")}
            >
              Issue refund
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
