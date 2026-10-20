"use client";

import {
  ClockCounterClockwiseIcon,
  CreditCardIcon,
  IdentificationCardIcon,
  MapPinIcon,
  XIcon,
} from "@phosphor-icons/react";
import { cn } from "cn";
import Link from "next/link";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useId } from "react";
import { toast } from "sonner";

import { ActionSheetContent } from "@/components/dashboard/action-sheet";
import { PER_CYCLE, PLAN_NAMES } from "@/components/subscriptions/subscription-format";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { initials } from "@/libs/utils";
import type { Subscription, SubscriptionEvent } from "@/types/subscriptions";
import { formatMoney } from "@/libs/money";

const card =
  "rounded-xl border border-border/40 bg-surface p-6 max-sm:p-4 dark:border-border dark:bg-muted/30";
const cardLabel = "text-xs/4 font-semibold tracking-wider uppercase";

const STATUS_PILLS: Record<Subscription["status"], { label: string; pill: string }> = {
  active: {
    label: "Active",
    pill: "bg-action-soft text-action dark:bg-action/25 dark:text-primary",
  },
  trial: {
    label: "Trial",
    pill: "bg-[#fbeedd] text-caution dark:bg-caution/25 dark:text-[#e9b97c]",
  },
  cancelled: {
    label: "Cancelled",
    pill: "bg-destructive-soft text-destructive dark:bg-destructive/15",
  },
  "payment-failed": {
    label: "Payment Failed",
    pill: "bg-destructive-soft text-destructive dark:bg-destructive/15",
  },
};

const DOTS: Record<SubscriptionEvent["tone"], string> = {
  success: "bg-action dark:bg-primary",
  neutral: "bg-outline",
  warning: "bg-caution-accent",
};

/**
 * A member's subscription: who they are, their plan and auto-renew, what
 * they've paid, the last payment and the history, with Issue Refund and
 * Cancel Subscription below. UI only: no action reaches a billing route.
 */
export function SubscriptionSheet({
  subscription,
  open,
  onOpenChange,
  onCloseAutoFocus,
}: {
  /** Kept after closing, so the panel doesn't empty while it slides out. */
  subscription?: Subscription;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus?: (event: Event) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ActionSheetContent onCloseAutoFocus={onCloseAutoFocus} className="max-w-120 border-border">
        {subscription && <SheetContents subscription={subscription} />}
      </ActionSheetContent>
    </Dialog>
  );
}

function SheetContents({ subscription }: { subscription: Subscription }) {
  const id = useId();
  const { user } = subscription;
  const status = STATUS_PILLS[subscription.status];
  const ended = subscription.status === "cancelled";

  return (
    <>
      <div className="flex shrink-0 items-start gap-4 border-b px-8 pt-8 pb-6 max-sm:px-5 max-sm:pt-6">
        <div className="min-w-0 flex-1">
          <DialogPrimitive.Title className="text-xl/7 font-semibold">
            Subscription Details
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-1 text-[15px] text-muted-foreground">
            Manage {user.name}&rsquo;s plan and billing
          </DialogPrimitive.Description>
        </div>
        <DialogPrimitive.Close className="-mr-1 rounded-md p-1 text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50">
          <XIcon aria-hidden weight="bold" className="size-5" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-8 py-8 max-sm:px-5 max-sm:py-5">
        <section
          aria-label="Member"
          className={cn(card, "flex flex-wrap items-center gap-x-6 gap-y-4")}
        >
          <Avatar className="size-16 ring-4 ring-background after:hidden">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
            <AvatarFallback className="bg-info-soft text-lg text-[#24637a]">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-xl/7 font-semibold">{user.name}</p>
            <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <IdentificationCardIcon aria-hidden className="size-4.5 shrink-0" />
                <span className="sr-only">User ID</span>
                {user.userId}
              </span>
              <span className="flex items-center gap-1">
                <MapPinIcon aria-hidden className="size-4.5 shrink-0" />
                <span className="sr-only">Location</span>
                {user.location}
              </span>
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="h-10 rounded-md bg-background px-6 text-sm font-semibold tracking-wide text-action hover:text-action dark:bg-input/30 dark:text-primary"
          >
            <a href={`mailto:${user.email}`}>Contact User</a>
          </Button>
        </section>

        <section aria-labelledby={`${id}-plan`} className={card}>
          <div className="flex items-center justify-between gap-3">
            <h3 id={`${id}-plan`} className={cardLabel}>
              Current Plan
            </h3>
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs/5",
                status.pill,
              )}
            >
              <span aria-hidden className="size-1.5 rounded-full bg-current" />
              {status.label}
              {subscription.status === "trial" && subscription.trialDaysLeft !== undefined && (
                <> ({subscription.trialDaysLeft}d left)</>
              )}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4 border-b pb-6">
            <p className="flex items-baseline gap-2">
              <span className="text-3xl/9 font-semibold text-action dark:text-primary">
                {PLAN_NAMES[subscription.plan]}
              </span>
              <span className="text-[15px] text-muted-foreground">
                {subscription.cycle
                  ? `${formatMoney(subscription.amount)}${PER_CYCLE[subscription.cycle]}`
                  : "No charge"}
              </span>
            </p>
            {subscription.cycle && (
              <label className="flex items-center gap-3 text-sm text-muted-foreground">
                Auto-renew
                <Switch
                  checked={subscription.autoRenew && !ended}
                  disabled={ended}
                  // UI only: the switch stays as it is until billing is wired.
                  onCheckedChange={() => toast("Changing auto-renew isn't available yet")}
                  className="h-6 w-11 data-[state=checked]:bg-action dark:data-[state=checked]:bg-primary [&_[data-slot=switch-thumb]]:size-5"
                />
              </label>
            )}
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border/30 bg-background px-4 py-3.5 dark:border-border dark:bg-card">
              <dt className="text-xs text-muted-foreground">Total Paid</dt>
              <dd className="mt-1 text-xl/7 font-semibold tabular-nums">
                {formatMoney(subscription.totalPaid)}
              </dd>
            </div>
            <div className="rounded-lg border border-border/30 bg-background px-4 py-3.5 dark:border-border dark:bg-card">
              <dt className="text-xs text-muted-foreground">Next Billing</dt>
              <dd className="mt-1 text-xl/7 font-semibold">{subscription.nextRenewal ?? "None"}</dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby={`${id}-activity`} className={card}>
          <h3 id={`${id}-activity`} className={cardLabel}>
            Recent Activity
          </h3>
          {subscription.lastPayment ? (
            <div className="mt-4 flex items-center gap-4 rounded-lg border border-border/30 bg-background p-4 dark:border-border dark:bg-card">
              <span
                aria-hidden
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-action-soft text-action dark:bg-action/25 dark:text-primary"
              >
                <CreditCardIcon weight="bold" className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px]/5 font-medium">Last Payment</p>
                <p className="text-[13px] text-muted-foreground">
                  {subscription.lastPayment.date} <span aria-hidden>&bull;</span>{" "}
                  {subscription.lastPayment.method}
                </p>
              </div>
              <p className="text-xl/7 font-semibold tabular-nums">
                {formatMoney(subscription.lastPayment.amount)}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No payments yet.</p>
          )}
          <Link
            href="/payments"
            className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-sm text-sm font-semibold tracking-wide text-action outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 dark:text-primary"
          >
            <ClockCounterClockwiseIcon aria-hidden weight="bold" className="size-4.5" />
            View Payment History
          </Link>
        </section>

        <section aria-labelledby={`${id}-timeline`} className={card}>
          <h3 id={`${id}-timeline`} className={cardLabel}>
            Timeline
          </h3>
          <ol className="relative mt-5 flex flex-col gap-5 before:absolute before:inset-y-1 before:left-0.75 before:w-px before:bg-border">
            {subscription.timeline.map((event) => (
              <li key={event.id} className="relative pl-7">
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-1.5 left-0 size-2 rounded-full ring-2 ring-surface",
                    DOTS[event.tone],
                  )}
                />
                <p className="text-[15px]/5">{event.label}</p>
                <p className="text-[13px] text-muted-foreground">{event.date}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="grid shrink-0 gap-3 border-t px-8 py-6 max-sm:px-5 max-sm:py-4">
        <Button
          variant="outline"
          disabled={subscription.totalPaid === 0}
          onClick={() => toast("Refunds aren't available yet")}
          className="h-14 rounded-[12px] bg-background text-lg font-semibold tracking-wide max-sm:h-12 max-sm:text-base dark:bg-input/30"
        >
          Issue Refund
        </Button>
        <Button
          variant="outline"
          disabled={ended}
          onClick={() => toast("Cancelling subscriptions isn't available yet")}
          className="h-14 rounded-[12px] border-[#f0b8b3] bg-destructive-soft text-lg font-semibold tracking-wide text-destructive hover:bg-destructive-container/60 hover:text-destructive max-sm:h-12 max-sm:text-base dark:border-destructive/40 dark:bg-destructive/10"
        >
          Cancel Subscription
        </Button>
      </div>
    </>
  );
}
