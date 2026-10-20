"use client";

import { DiamondIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useRef, useState } from "react";

import { PlanSheet } from "@/components/subscriptions/plan-sheet";
import { SegmentedControl } from "@/components/subscriptions/segmented-control";
import { PER_CYCLE } from "@/components/subscriptions/subscription-format";
import type { BillingCycle, MembershipPlan, PlanId } from "@/types/subscriptions";
import { formatPrice, formatWholeMoney } from "@/libs/money";

const PLAN_IDS = ["free", "basic", "premium", "elite"] as const satisfies readonly PlanId[];

const CYCLES = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  {
    value: "annual",
    label: (
      <>
        Yearly
        <span className="rounded-sm bg-info-soft px-1.5 py-px text-[9px]/3.5 font-bold tracking-wide text-[#24637a] uppercase dark:bg-info-soft/15 dark:text-info-soft">
          Save 20%
        </span>
      </>
    ),
  },
] as const satisfies readonly { value: BillingCycle; label: unknown }[];

const count = new Intl.NumberFormat("en-GB");

/** Each card's look: Free and Basic plain, Premium outlined as the favorite, Elite inverted. */
const LOOKS: Record<
  PlanId,
  { card: string; label: string; price: string; text: string; divider: string; button: string }
> = {
  free: {
    card: "border-border/40 bg-card",
    label: "text-muted-foreground",
    price: "text-foreground",
    text: "text-muted-foreground",
    divider: "border-border/40",
    button: "border-border/60 bg-muted-strong text-foreground hover:bg-muted dark:bg-muted",
  },
  basic: {
    card: "border-border/40 bg-card",
    label: "text-action dark:text-primary",
    price: "text-foreground",
    text: "text-muted-foreground",
    divider: "border-border/40",
    button: "border-border/60 bg-muted-strong text-foreground hover:bg-muted dark:bg-muted",
  },
  premium: {
    card: "border-2 border-[#bfe0ef] bg-card dark:border-action/60",
    label: "text-action dark:text-primary",
    price: "text-[#24637a] dark:text-primary",
    text: "text-muted-foreground",
    divider: "border-border/40",
    button:
      "border-[#24637a] bg-[#24637a] text-white hover:bg-[#24637a]/90 dark:border-primary dark:bg-primary dark:text-primary-foreground",
  },
  elite: {
    card: "border-[#173e52] bg-[#173e52] text-white dark:border-[#2a5468] dark:bg-[#123446]",
    label: "text-white/90",
    price: "text-white",
    text: "text-white/80",
    divider: "border-white/20",
    button: "border-white bg-white text-[#24637a] hover:bg-white/90",
  },
};

/**
 * Membership Plans: each plan's price for the chosen period, members and
 * revenue, and Manage Plan, which opens its sheet (?plan= in the URL).
 */
export function MembershipPlans({ plans }: { plans: MembershipPlan[] }) {
  const [planId, setPlanId] = useQueryState("plan", parseAsStringLiteral(PLAN_IDS));
  return <PlansView plans={plans} planId={planId} onPlanChange={(next) => void setPlanId(next)} />;
}

/** What renders before the URL is read: the plans, no sheet. */
export function MembershipPlansFallback({ plans }: { plans: MembershipPlan[] }) {
  return <PlansView plans={plans} planId={null} onPlanChange={() => {}} />;
}

function PlansView({
  plans,
  planId,
  onPlanChange,
}: {
  plans: MembershipPlan[];
  planId: PlanId | null;
  onPlanChange: (planId: PlanId | null) => void;
}) {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const selected = plans.find((plan) => plan.id === planId);
  // Keeps the last plan on screen while the sheet animates closed.
  const [shown, setShown] = useState(selected);
  if (selected && selected !== shown) setShown(selected);
  const opener = useRef<HTMLElement>(null);

  return (
    <section aria-labelledby="membership-plans" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="membership-plans" className="text-xl/7 font-semibold">
          Membership Plans
        </h2>
        <SegmentedControl
          label="Billing period"
          options={CYCLES}
          value={cycle}
          onChange={setCycle}
        />
      </div>
      <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const look = LOOKS[plan.id];
          const revenue = plan.prices.monthly * plan.activeSubscribers;
          return (
            <li
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-xl border px-6 pt-8 pb-6 shadow-[0_2px_6px_rgb(24_28_30/0.05)]",
                look.card,
              )}
            >
              {plan.id === "premium" && (
                <span className="absolute -top-2.5 right-4 rounded-sm bg-[#1f4f63] px-2 py-0.5 text-[11px]/4 font-bold tracking-wider text-white uppercase dark:bg-primary dark:text-primary-foreground">
                  Most Popular
                </span>
              )}
              {plan.id === "elite" && (
                <DiamondIcon
                  aria-hidden
                  weight="bold"
                  className="absolute top-4 right-4 size-14 text-white/15"
                />
              )}
              <h3 className={cn("text-xs/4 tracking-[0.15em] uppercase", look.label)}>
                {plan.name}
              </h3>
              <p className="mt-2 flex items-baseline gap-1">
                <span className={cn("text-3xl/9 font-bold tabular-nums", look.price)}>
                  {formatPrice(plan.prices[cycle])}
                </span>
                <span className={cn("text-sm", look.text)}>{PER_CYCLE[cycle]}</span>
              </p>
              <dl
                className={cn(
                  "mt-5 flex flex-col gap-2.5 border-t pt-5 text-[13px]",
                  look.divider,
                  look.text,
                )}
              >
                <div className="flex gap-1">
                  <dt>Current Active:</dt>
                  <dd className="tabular-nums">{count.format(plan.activeSubscribers)}</dd>
                </div>
                <div className="flex gap-1">
                  {plan.conversionToPaid !== undefined ? (
                    <>
                      <dt>Conversion to Paid:</dt>
                      <dd>{plan.conversionToPaid}%</dd>
                    </>
                  ) : (
                    <>
                      <dt>MRR Contrib:</dt>
                      <dd className="tabular-nums">{formatWholeMoney(revenue)}</dd>
                    </>
                  )}
                </div>
              </dl>
              {/* Pinned to the foot, so the buttons line up across cards of different heights. */}
              <div className="mt-auto pt-6">
                <button
                  type="button"
                  onClick={(click) => {
                    opener.current = click.currentTarget;
                    onPlanChange(plan.id);
                  }}
                  className={cn(
                    "h-9.5 w-full rounded-md border text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    look.button,
                  )}
                >
                  {plan.id === "elite" ? "Manage Elite Plan" : "Manage Plan"}
                  {plan.id !== "elite" && <span className="sr-only">: {plan.name}</span>}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <PlanSheet
        plan={shown}
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) onPlanChange(null);
        }}
        onCloseAutoFocus={(close) => {
          if (!opener.current?.isConnected) return;
          close.preventDefault();
          opener.current.focus();
        }}
      />
    </section>
  );
}
