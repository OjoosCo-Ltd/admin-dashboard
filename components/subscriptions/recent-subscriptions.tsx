"use client";

import { ColumnsIcon, DotsThreeVerticalIcon, FunnelSimpleIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { PlanBadge, SubscriptionStatusBadge } from "@/components/subscriptions/subscription-badges";
import { CYCLE_LABELS, PLAN_NAMES } from "@/components/subscriptions/subscription-format";
import { SubscriptionSheet } from "@/components/subscriptions/subscription-sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
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
import type { PlanId, Subscription, SubscriptionStatus } from "@/types/subscriptions";
import { formatMoney } from "@/libs/money";

/** The columns the Columns menu can hide. User, Plan, Status and Actions always show. */
const OPTIONAL = [
  { id: "cycle", label: "Cycle" },
  { id: "amount", label: "Amount" },
  { id: "renewal", label: "Next Renewal" },
] as const;

type OptionalColumn = (typeof OPTIONAL)[number]["id"];

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: "Active",
  trial: "Trial",
  cancelled: "Cancelled",
  "payment-failed": "Payment Failed",
};

const toolButton =
  "h-9 gap-1.5 rounded-lg bg-background px-4 text-sm font-medium shadow-none dark:bg-input/30";
const head = "h-14 px-4 text-xs/4 font-semibold tracking-wider text-muted-foreground uppercase";

/**
 * Recent Subscriptions: the latest sign-ups and changes, filtered by plan or
 * status, with columns that can be hidden. A member's name opens the
 * Subscription Details sheet (?subscription= in the URL).
 */
export function RecentSubscriptions({ subscriptions }: { subscriptions: Subscription[] }) {
  const [openId, setOpenId] = useQueryState("subscription", parseAsString);
  return (
    <RecentView
      subscriptions={subscriptions}
      openId={openId}
      onOpenChange={(next) => void setOpenId(next)}
    />
  );
}

/** What renders before the URL is read: the table, no sheet. */
export function RecentSubscriptionsFallback({ subscriptions }: { subscriptions: Subscription[] }) {
  return <RecentView subscriptions={subscriptions} openId={null} onOpenChange={() => {}} />;
}

function RecentView({
  subscriptions,
  openId,
  onOpenChange,
}: {
  subscriptions: Subscription[];
  openId: string | null;
  onOpenChange: (id: string | null) => void;
}) {
  const titleId = useId();
  const [plan, setPlan] = useState<PlanId | "all">("all");
  const [status, setStatus] = useState<SubscriptionStatus | "all">("all");
  const [hidden, setHidden] = useState<OptionalColumn[]>([]);
  const shows = (column: OptionalColumn) => !hidden.includes(column);
  const filtered = plan !== "all" || status !== "all";

  // The four most recent, as the Figma shows them; the directory has the rest.
  const rows = subscriptions
    .filter(
      (item) =>
        (plan === "all" || item.plan === plan) && (status === "all" || item.status === status),
    )
    .slice(0, 4);

  const selected = subscriptions.find((item) => item.id === openId);
  const [shown, setShown] = useState(selected);
  if (selected && selected !== shown) setShown(selected);
  const opener = useRef<HTMLElement>(null);

  return (
    <DashboardCard className="overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-4 px-8 py-7 max-sm:px-5 max-sm:py-5">
        <DashboardCardTitle id={titleId} className="text-xl/7 font-semibold">
          Recent Subscriptions
        </DashboardCardTitle>
        <div className="flex gap-2.5">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  toolButton,
                  filtered && "border-action text-action dark:border-primary dark:text-primary",
                )}
              >
                <FunnelSimpleIcon aria-hidden weight="bold" className="size-4" />
                Filter
                {filtered && <span className="sr-only"> (on)</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Plan</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={plan}
                onValueChange={(value) => setPlan(value as PlanId | "all")}
              >
                <DropdownMenuRadioItem value="all">All plans</DropdownMenuRadioItem>
                {(Object.keys(PLAN_NAMES) as PlanId[]).map((id) => (
                  <DropdownMenuRadioItem key={id} value={id}>
                    {PLAN_NAMES[id]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={status}
                onValueChange={(value) => setStatus(value as SubscriptionStatus | "all")}
              >
                <DropdownMenuRadioItem value="all">All statuses</DropdownMenuRadioItem>
                {(Object.keys(STATUS_LABELS) as SubscriptionStatus[]).map((id) => (
                  <DropdownMenuRadioItem key={id} value={id}>
                    {STATUS_LABELS[id]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className={toolButton}>
                <ColumnsIcon aria-hidden weight="bold" className="size-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Show columns</DropdownMenuLabel>
              {OPTIONAL.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={shows(column.id)}
                  // Keep the menu open, so several columns can be switched in one go.
                  onSelect={(event) => event.preventDefault()}
                  onCheckedChange={(checked) =>
                    setHidden((current) =>
                      checked ? current.filter((id) => id !== column.id) : [...current, column.id],
                    )
                  }
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Table aria-labelledby={titleId} className="min-w-200">
        <TableHeader className="[&_tr]:border-y [&_tr]:border-border/30 dark:[&_tr]:border-border">
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className={cn(head, "pl-6")}>User</TableHead>
            <TableHead className={head}>Plan</TableHead>
            {shows("cycle") && <TableHead className={head}>Cycle</TableHead>}
            {shows("amount") && <TableHead className={head}>Amount</TableHead>}
            {shows("renewal") && <TableHead className={head}>Next Renewal</TableHead>}
            <TableHead className={head}>Status</TableHead>
            <TableHead className={cn(head, "pr-6 text-center")}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((item) => (
            <TableRow
              key={item.id}
              data-state={item.id === openId ? "selected" : undefined}
              className="relative border-border/30 hover:bg-primary/5 data-[state=selected]:bg-primary/5 dark:border-border"
            >
              <TableCell className="py-3 pr-4 pl-6">
                <div className="flex items-center gap-4">
                  <Avatar className="size-10 after:hidden">
                    {item.user.avatarUrl && <AvatarImage src={item.user.avatarUrl} alt="" />}
                    <AvatarFallback className="bg-muted-strong text-sm font-semibold text-[#24637a] dark:bg-muted dark:text-info-soft">
                      {initials(item.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    {/* Stretched over the row, so anywhere on it opens the details. */}
                    <button
                      type="button"
                      onClick={(click) => {
                        opener.current = click.currentTarget;
                        onOpenChange(item.id);
                      }}
                      className="block text-left text-[15px]/5 outline-none after:absolute after:inset-0 focus-visible:after:ring-3 focus-visible:after:ring-ring/50 focus-visible:after:ring-inset"
                    >
                      {item.user.name}
                    </button>
                    <p className="text-[13px] text-muted-foreground">{item.id}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-4">
                <PlanBadge plan={item.plan} />
              </TableCell>
              {shows("cycle") && (
                <TableCell className="px-4 text-[15px] text-muted-foreground">
                  {item.cycle ? CYCLE_LABELS[item.cycle] : "–"}
                </TableCell>
              )}
              {shows("amount") && (
                <TableCell className="px-4 text-[15px] font-medium tabular-nums">
                  {formatMoney(item.amount)}
                </TableCell>
              )}
              {shows("renewal") && (
                <TableCell className="px-4 text-[15px] text-muted-foreground">
                  {item.nextRenewal ?? "–"}
                </TableCell>
              )}
              <TableCell className="px-4">
                <SubscriptionStatusBadge subscription={item} />
              </TableCell>
              <TableCell className="pr-6 pl-4 text-center">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger
                    aria-label={`Actions for ${item.user.name}`}
                    className="relative z-10 inline-flex size-8 items-center justify-center rounded-md text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=open]:bg-muted"
                  >
                    <DotsThreeVerticalIcon aria-hidden weight="bold" className="size-5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onSelect={() => toast("Changing plans isn't available yet")}>
                      Change plan
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => toast("Payment reminders aren't available yet")}
                    >
                      Send payment reminder
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      disabled={item.status === "cancelled"}
                      onSelect={() => toast("Cancelling subscriptions isn't available yet")}
                    >
                      Cancel subscription
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={7} className="h-24 text-center text-[13px] text-muted-foreground">
                No recent subscriptions match these filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="border-t border-border/30 py-4 text-center dark:border-border">
        <Link
          href="/subscriptions/subscribers"
          className="rounded-sm text-[13px] font-medium text-action outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 dark:text-primary"
        >
          View All Subscribers
        </Link>
      </div>

      <SubscriptionSheet
        subscription={shown}
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) onOpenChange(null);
        }}
        onCloseAutoFocus={(close) => {
          if (!opener.current?.isConnected) return;
          close.preventDefault();
          opener.current.focus();
        }}
      />
    </DashboardCard>
  );
}
