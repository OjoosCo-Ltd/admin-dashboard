"use client";

import { CheckIcon, GlobeHemisphereWestIcon, ReceiptIcon, XIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import Link from "next/link";
import { Dialog as DialogPrimitive } from "radix-ui";
import { type ReactNode, useId } from "react";
import { toast } from "sonner";

import { ActionSheetContent } from "@/components/dashboard/action-sheet";
import {
  CYCLE_NAMES,
  METHOD_ICONS,
  PaymentStatusBadge,
  TRANSACTION_KINDS,
  methodText,
} from "@/components/payments/payment-badges";
import { PLAN_NAMES } from "@/components/subscriptions/subscription-format";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { BILLING_CURRENCY } from "@/constants/billing";
import { formatMoney } from "@/libs/money";
import { initials } from "@/libs/utils";
import type { Transaction, TransactionEvent } from "@/types/payments";

const card = "rounded-xl border border-border/30 bg-background p-3 dark:border-border";
const cardLabel = "text-xs/4 font-semibold tracking-wider text-muted-foreground uppercase";
const rule = "border-t border-border/30 dark:border-border";
const smallLabel = "text-[11px]/4 text-muted-foreground";

// The Figma's two initials tints, picked from the name so a member always gets the same one.
const TINTS = [
  "bg-[#dfe3e6] text-muted-foreground dark:bg-muted",
  "bg-info-soft text-[#4e6875] dark:bg-info-soft/15 dark:text-info-soft",
];

/** A customer's photo, or their initials on one of the Figma's two tints. */
export function CustomerAvatar({
  customer,
  className,
  initialsClassName,
}: {
  customer: Transaction["customer"];
  className?: string;
  initialsClassName?: string;
}) {
  return (
    <Avatar className={cn("after:hidden", className)}>
      {customer.avatarUrl && <AvatarImage src={customer.avatarUrl} alt="" />}
      <AvatarFallback
        className={cn("text-base", TINTS[customer.name.length % TINTS.length], initialsClassName)}
      >
        {initials(customer.name)}
      </AvatarFallback>
    </Avatar>
  );
}

// Opaque in both themes: the timeline's rule runs behind the discs. Done, failed
// and waiting take their status pill's tint; routine steps are the Figma's grey.
const DISCS: Record<TransactionEvent["state"], string> = {
  done: "bg-[#e6f4ea] dark:bg-[#143323]",
  failed: "bg-destructive-container dark:bg-[#3d1a19]",
  step: "border border-border/70 bg-muted-strong dark:border-border dark:bg-muted",
  waiting: "bg-[#fef9e7] dark:bg-[#33280f]",
};

/**
 * One payment: who paid, what was charged and how, what it bought, where the
 * money went and its history, with Download Receipt below. UI only: the
 * receipt just toasts.
 */
export function TransactionSheet({
  transaction,
  open,
  onOpenChange,
  onCloseAutoFocus,
}: {
  /** Kept after closing, so the panel doesn't empty while it slides out. */
  transaction?: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Rows open the sheet without a trigger, so the caller says where focus goes back to. */
  onCloseAutoFocus?: (event: Event) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ActionSheetContent onCloseAutoFocus={onCloseAutoFocus} className="max-w-md border-border">
        {transaction && <SheetContents transaction={transaction} />}
      </ActionSheetContent>
    </Dialog>
  );
}

function SheetContents({ transaction }: { transaction: Transaction }) {
  const id = useId();
  const { customer, status } = transaction;
  const MethodIcon = METHOD_ICONS[transaction.method.kind];
  // Failed and pending payments captured nothing: no fee, no net and no receipt.
  const captured = status === "successful" || status === "refunded";
  const net = captured ? transaction.amount - transaction.fee - (transaction.refunded ?? 0) : 0;

  return (
    <>
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border/30 px-6 py-3 dark:border-border">
        <div className="min-w-0">
          <DialogPrimitive.Title className="text-xl/7 font-semibold">
            #{transaction.id}
          </DialogPrimitive.Title>
          <PaymentStatusBadge status={status} className="mt-2 flex w-fit" />
          <DialogPrimitive.Description className="sr-only">
            {formatMoney(transaction.amount)} from {customer.name}
          </DialogPrimitive.Description>
        </div>
        <DialogPrimitive.Close className="rounded-md p-1 text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50">
          <XIcon aria-hidden weight="bold" className="size-5" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6 text-base">
        <section aria-labelledby={`${id}-customer`} className={card}>
          <h3 id={`${id}-customer`} className={cardLabel}>
            Customer
          </h3>
          <div className="mt-3 flex items-center gap-3">
            <CustomerAvatar customer={customer} className="size-12" initialsClassName="text-lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{customer.name}</p>
              <p className="truncate text-muted-foreground">{customer.email}</p>
              <p className="mt-1 flex items-center gap-1 text-muted-foreground">
                <GlobeHemisphereWestIcon aria-hidden weight="fill" className="size-3.5 shrink-0" />
                {customer.country}
              </p>
            </div>
            <Link
              href={`/users?q=${encodeURIComponent(customer.name)}`}
              className="inline-flex h-7 shrink-0 items-center self-start rounded-md border border-border/50 bg-background px-3 text-[11px] font-semibold text-action transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 dark:border-border dark:bg-input/30 dark:text-primary"
            >
              View User
            </Link>
          </div>
          <dl className={cn(rule, "mt-3 flex items-start justify-between gap-3 pt-3")}>
            <dt className={smallLabel}>User ID</dt>
            <dd className="font-medium">{customer.userId}</dd>
          </dl>
        </section>

        <section aria-labelledby={`${id}-overview`} className={card}>
          <h3 id={`${id}-overview`} className={cardLabel}>
            Transaction Overview
          </h3>
          <dl className="mt-4 flex items-end justify-between gap-3">
            <dt className={smallLabel}>Amount</dt>
            <dd className="text-[30px]/9 font-bold">
              {formatMoney(transaction.amount)}{" "}
              <span className="font-semibold text-muted-foreground">{BILLING_CURRENCY.code}</span>
            </dd>
          </dl>
          <dl className={cn(rule, "mt-3 grid grid-cols-2 gap-x-6 gap-y-2.5 pt-3.5")}>
            <Detail label="Payment Reference">{transaction.reference}</Detail>
            {/* The no-break space keeps the dot with the time when a phone wraps the line. */}
            <Detail label="Date & Time">
              {transaction.date} ·{" "}
              {transaction.time}
            </Detail>
            <Detail label="Payment Method">
              <span className="flex items-center gap-1">
                <MethodIcon aria-hidden className="size-4 shrink-0" />
                {methodText(transaction.method, "sheet")}
              </span>
            </Detail>
            <Detail label="Transaction Type">{TRANSACTION_KINDS[transaction.kind]}</Detail>
          </dl>
        </section>

        <section aria-labelledby={`${id}-purchase`} className={card}>
          <h3 id={`${id}-purchase`} className={cardLabel}>
            Purchase Details
          </h3>
          <dl className="mt-3 flex flex-col gap-3">
            <Row label="Product">{PLAN_NAMES[transaction.plan]} Subscription</Row>
            <Row label="Billing Cycle">{CYCLE_NAMES[transaction.cycle]}</Row>
            <Row label="Next Renewal" className={cn(rule, "pt-3")}>
              {transaction.nextRenewal ?? "–"}
            </Row>
          </dl>
        </section>

        <section aria-labelledby={`${id}-breakdown`} className={card}>
          <h3 id={`${id}-breakdown`} className={cardLabel}>
            Payment Breakdown
          </h3>
          <dl className="mt-3 flex flex-col gap-3">
            <Row label="Gateway">{transaction.gateway}</Row>
            <Row label="Auth Status">{transaction.authStatus}</Row>
          </dl>
          {/* The Figma dashes the rule between the gateway and the money, and packs the money tighter. */}
          <dl className="mt-3 flex flex-col gap-2 border-t border-dashed border-border/30 pt-3 tabular-nums dark:border-border">
            <Row label="Gross Amount">{formatMoney(transaction.amount)}</Row>
            <Row label="Processing Fee" valueClassName={captured ? "text-destructive" : undefined}>
              {captured ? `- ${formatMoney(transaction.fee)}` : formatMoney(0)}
            </Row>
            {transaction.refunded ? (
              <Row label="Refunded" valueClassName="text-destructive">
                - {formatMoney(transaction.refunded)}
              </Row>
            ) : null}
            <Row
              label="Net Amount"
              strong
              className={cn(rule, "pt-2")}
              valueClassName={net < 0 ? "text-destructive" : undefined}
            >
              {/* A full refund leaves the fee as a loss, spaced like the deductions above it. */}
              {net < 0 ? `- ${formatMoney(-net)}` : formatMoney(net)}
            </Row>
          </dl>
          {!captured && (
            <p className="mt-2 text-xs text-muted-foreground">
              {status === "pending" ? "Awaiting funds." : "Nothing was captured."}
            </p>
          )}
        </section>

        <section aria-labelledby={`${id}-timeline`} className={card}>
          <h3 id={`${id}-timeline`} className={cardLabel}>
            Timeline
          </h3>
          <ol className="mt-3 flex flex-col gap-6">
            {transaction.timeline.map((event) => (
              // The rule runs from this step's disc to the next one's, behind both.
              <li
                key={event.id}
                className="relative pl-8 before:absolute before:top-4 before:-bottom-10 before:left-3.75 before:w-0.5 before:bg-border/50 last:before:hidden dark:before:bg-border"
              >
                <StepDisc state={event.state} />
                <p className="font-medium">{event.label}</p>
                <p className="text-muted-foreground">{event.at}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="shrink-0 border-t border-border/30 p-6 dark:border-border">
        <Button
          variant="outline"
          disabled={!captured}
          onClick={() => toast("Receipts aren't available yet")}
          className="h-14.5 w-full gap-1.5 rounded-xl border-border/50 bg-surface text-[17px] font-semibold shadow-none dark:border-border dark:bg-input/30"
        >
          <ReceiptIcon aria-hidden className="size-4.5" />
          Download Receipt
        </Button>
      </div>
    </>
  );
}

/** A label over its value, in Transaction Overview's grid. */
function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className={smallLabel}>{label}</dt>
      <dd className="mt-1 font-medium wrap-break-word">{children}</dd>
    </div>
  );
}

/** A label on the left and its value on the right. `strong` sets both in semibold, as Net Amount is. */
function Row({
  label,
  children,
  strong = false,
  className,
  valueClassName,
}: {
  label: string;
  children: ReactNode;
  strong?: boolean;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={cn("flex items-baseline justify-between gap-3", className)}>
      <dt className={strong ? "font-semibold" : "text-muted-foreground"}>{label}</dt>
      <dd className={cn("text-right", strong && "font-semibold", valueClassName)}>{children}</dd>
    </div>
  );
}

/**
 * A timeline step's disc: a green check for a milestone, a red cross for a
 * failure, a grey dot for a routine step and an amber ring for one still waiting.
 */
function StepDisc({ state }: { state: TransactionEvent["state"] }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute top-1 left-1 flex size-6 items-center justify-center rounded-full",
        DISCS[state],
      )}
    >
      {state === "step" ? (
        <span className="size-2 rounded-full bg-muted-foreground" />
      ) : state === "waiting" ? (
        <span className="size-2.5 rounded-full border-2 border-[#a15f00] dark:border-[#f7bf63]" />
      ) : (
        <span
          className={cn(
            "flex size-3 items-center justify-center rounded-full text-white dark:text-background",
            state === "done" ? "bg-[#137333] dark:bg-[#5fd394]" : "bg-destructive",
          )}
        >
          {state === "done" ? (
            <CheckIcon weight="bold" className="size-2.25" />
          ) : (
            <XIcon weight="bold" className="size-2" />
          )}
        </span>
      )}
    </span>
  );
}
