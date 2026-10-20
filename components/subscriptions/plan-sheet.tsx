"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, TrashIcon, TrendDownIcon, TrendUpIcon, XIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import Link from "next/link";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useId } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { ActionSheetContent } from "@/components/dashboard/action-sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { BILLING_CURRENCY } from "@/constants/billing";
import type { BillingCycle, MembershipPlan } from "@/types/subscriptions";
import { currencySymbol, formatCompactMoney } from "@/libs/money";

const count = new Intl.NumberFormat("en-GB");

const price = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Use an amount like 29.99");

const schema = z.object({
  prices: z.object({ monthly: price, quarterly: price, annual: price }),
  features: z.array(
    z.object({
      title: z.string().trim().min(1, "Name the feature").max(60, "Keep it under 60 characters"),
      detail: z.string().trim().max(80, "Keep it under 80 characters"),
      included: z.boolean(),
    }),
  ),
});

type PlanValues = z.infer<typeof schema>;

const PRICE_FIELDS: { cycle: BillingCycle; label: string; unit: string }[] = [
  { cycle: "monthly", label: "Monthly Billing", unit: "/mo" },
  { cycle: "quarterly", label: "Quarterly Billing", unit: "/qtr" },
  { cycle: "annual", label: "Annual Billing", unit: "/yr" },
];

const sectionLabel = "text-xs/4 font-semibold tracking-wider uppercase";
const tile =
  "rounded-xl border border-border/40 bg-surface px-4 py-3.5 dark:border-border dark:bg-muted/40";

/**
 * Manage Plan: how the plan is doing, its three prices and its features,
 * with Deactivate, Cancel and Save Changes below. UI only: nothing is saved.
 */
export function PlanSheet({
  plan,
  open,
  onOpenChange,
  onCloseAutoFocus,
}: {
  /** Kept after closing, so the panel doesn't empty while it slides out. */
  plan?: MembershipPlan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus?: (event: Event) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ActionSheetContent onCloseAutoFocus={onCloseAutoFocus} className="max-w-112 border-border">
        {/* Keyed so another plan's sheet starts from its own values. */}
        {plan && <PlanForm key={plan.id} plan={plan} onCancel={() => onOpenChange(false)} />}
      </ActionSheetContent>
    </Dialog>
  );
}

function PlanForm({ plan, onCancel }: { plan: MembershipPlan; onCancel: () => void }) {
  const id = useId();
  const free = plan.id === "free";
  const form = useForm<PlanValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      prices: {
        monthly: plan.prices.monthly.toFixed(2),
        quarterly: plan.prices.quarterly.toFixed(2),
        annual: plan.prices.annual.toFixed(2),
      },
      features: plan.features.map(({ title, detail, included }) => ({ title, detail, included })),
    },
  });
  const features = useFieldArray({ control: form.control, name: "features" });
  // Features already on the plan are switched on or off; ones added here can be named.
  const existing = plan.features.length;
  const ChurnArrow = plan.churnChange <= 0 ? TrendDownIcon : TrendUpIcon;

  // UI only: there are no plan routes to save to.
  const onSubmit = form.handleSubmit(() => toast("Saving plan changes isn't available yet"));

  return (
    <>
      <div className="flex shrink-0 items-start gap-4 border-b px-8 pt-8 pb-6 max-sm:px-5 max-sm:pt-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <DialogPrimitive.Title className="text-2xl/8 font-semibold">
              {plan.name} Plan
            </DialogPrimitive.Title>
            <span className="rounded-full bg-info-soft px-2 py-0.5 text-[11px]/4 text-[#24637a] dark:bg-info-soft/15 dark:text-info-soft">
              Active
            </span>
          </div>
          <DialogPrimitive.Description className="mt-1 text-sm text-muted-foreground">
            Created on {plan.createdOn}
          </DialogPrimitive.Description>
        </div>
        <DialogPrimitive.Close className="-mr-1 rounded-md p-1 text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50">
          <XIcon aria-hidden weight="bold" className="size-5" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </div>

      <form method="post" noValidate onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-8 pt-8 pb-8 max-sm:px-5">
          <h3 className={sectionLabel}>Performance Overview</h3>
          <dl className="mt-3 grid grid-cols-2 gap-3">
            <div className={tile}>
              <dt className="text-[13px] text-muted-foreground">Active Subscribers</dt>
              <dd className="mt-1 text-2xl/8 font-semibold text-action tabular-nums dark:text-primary">
                {count.format(plan.activeSubscribers)}
              </dd>
            </div>
            <div className={tile}>
              <dt className="text-[13px] text-muted-foreground">Monthly Revenue</dt>
              <dd className="mt-1 text-2xl/8 font-semibold text-action tabular-nums dark:text-primary">
                {formatCompactMoney(plan.prices.monthly * plan.activeSubscribers)}
              </dd>
            </div>
            <div className={cn(tile, "col-span-2 flex items-end justify-between gap-3")}>
              <div>
                <dt className="text-[13px] text-muted-foreground">Churn Rate (30d)</dt>
                <dd className="mt-1 text-2xl/8 font-semibold tabular-nums">{plan.churnRate}%</dd>
              </div>
              <p
                className={cn(
                  "mb-1.5 flex items-center gap-1 text-xs",
                  plan.churnChange <= 0 ? "text-action dark:text-primary" : "text-destructive",
                )}
              >
                <ChurnArrow aria-hidden weight="bold" className="size-3.5" />
                {plan.churnChange > 0 && "+"}
                {plan.churnChange}% vs last mo
              </p>
            </div>
          </dl>
          <Button
            asChild
            variant="outline"
            className="mt-3 h-10 w-full rounded-md bg-background text-[13px] font-semibold tracking-wide text-action hover:text-action dark:bg-input/30 dark:text-primary"
          >
            <Link href={`/subscriptions/subscribers?plan=${plan.id}`}>View All Subscribers</Link>
          </Button>

          <div className="mt-10 border-t pt-10">
            <div className="flex items-center justify-between gap-3">
              <h3 className={sectionLabel}>Pricing Configuration</h3>
              <span className="rounded-md bg-primary px-2 py-0.5 text-[11px]/4 text-primary-foreground">
                {BILLING_CURRENCY.code} ({currencySymbol()})
              </span>
            </div>
            {free && (
              <p className="mt-2 text-[13px] text-muted-foreground">
                Free has no billing, so its prices stay at zero.
              </p>
            )}
            <div className="mt-4 flex flex-col gap-4">
              {PRICE_FIELDS.map((field) => {
                const error = form.formState.errors.prices?.[field.cycle];
                return (
                  <div key={field.cycle} className="flex flex-col gap-1.5">
                    <label htmlFor={`${id}-${field.cycle}`} className="text-sm">
                      {field.label}
                    </label>
                    <div className="relative">
                      <span
                        aria-hidden
                        className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[15px] text-muted-foreground"
                      >
                        {currencySymbol()}
                      </span>
                      <Input
                        id={`${id}-${field.cycle}`}
                        inputMode="decimal"
                        disabled={free}
                        aria-invalid={Boolean(error)}
                        aria-describedby={`${id}-${field.cycle}-unit`}
                        className="h-11 rounded-md bg-background pr-14 pl-9 text-[15px] tabular-nums md:text-[15px] dark:bg-input/30"
                        {...form.register(`prices.${field.cycle}`)}
                      />
                      <span
                        id={`${id}-${field.cycle}-unit`}
                        className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-muted-foreground"
                      >
                        {field.unit}
                      </span>
                    </div>
                    <FieldError errors={[error]} />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-10 border-t pt-10">
            <div className="flex items-center justify-between gap-3">
              <h3 className={sectionLabel}>Plan Features</h3>
              <button
                type="button"
                onClick={() => features.append({ title: "", detail: "", included: true })}
                className="flex items-center gap-1 rounded-sm text-[13px] font-medium text-action outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 dark:text-primary"
              >
                <PlusIcon aria-hidden weight="bold" className="size-3.5" />
                Add<span className="sr-only"> a feature</span>
              </button>
            </div>
            <ul className="mt-3 flex flex-col gap-4 rounded-xl border border-border/40 bg-surface p-4 dark:border-border dark:bg-muted/40">
              {features.fields.map((feature, index) => {
                const featureId = `${id}-feature-${feature.id}`;
                const errors = form.formState.errors.features?.[index];
                return (
                  <li key={feature.id} className="flex items-start gap-3">
                    <Controller
                      name={`features.${index}.included`}
                      control={form.control}
                      render={({ field }) => (
                        <Checkbox
                          id={featureId}
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(checked === true)}
                          className="mt-0.5 size-5 data-checked:border-action data-checked:bg-action dark:data-checked:border-primary dark:data-checked:bg-primary"
                        />
                      )}
                    />
                    {index < existing ? (
                      <label htmlFor={featureId} className="min-w-0 flex-1 cursor-pointer">
                        <span className="block text-[15px]/5">{feature.title}</span>
                        <span className="block text-[13px]/5 text-muted-foreground">
                          {feature.detail}
                        </span>
                      </label>
                    ) : (
                      // A feature added here: name it, then describe it.
                      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <Input
                          aria-label="Feature name"
                          placeholder="Feature name"
                          aria-invalid={Boolean(errors?.title)}
                          className="h-9 bg-background text-sm md:text-sm dark:bg-input/30"
                          {...form.register(`features.${index}.title`)}
                        />
                        <Input
                          aria-label="Feature description"
                          placeholder="Short description (optional)"
                          className="h-9 bg-background text-sm md:text-sm dark:bg-input/30"
                          {...form.register(`features.${index}.detail`)}
                        />
                        <FieldError errors={[errors?.title, errors?.detail]} />
                      </div>
                    )}
                    {index >= existing && (
                      <button
                        type="button"
                        onClick={() => features.remove(index)}
                        className="rounded-md p-1.5 text-muted-foreground outline-none hover:bg-muted hover:text-destructive focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <TrashIcon aria-hidden weight="bold" className="size-4" />
                        <span className="sr-only">Remove this feature</span>
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3 border-t px-6 py-6 max-sm:px-5 max-sm:py-4">
          <Button
            type="button"
            variant="ghost"
            disabled={free}
            onClick={() => toast("Deactivating plans isn't available yet")}
            className="mr-auto h-14 px-1.5 text-base font-semibold text-destructive hover:bg-destructive-soft hover:text-destructive max-sm:h-11 max-sm:text-base dark:hover:bg-destructive/10"
          >
            Deactivate Plan
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-14 rounded-[12px] bg-background px-4 text-base font-semibold max-sm:h-11 dark:bg-input/30"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-14 rounded-[12px] bg-action-icon px-5 text-base font-semibold text-white hover:bg-action-icon/90 max-sm:h-11 dark:bg-primary dark:text-primary-foreground"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </>
  );
}
