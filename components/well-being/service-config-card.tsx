"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { SESSION_LENGTHS, sessionLengthLabel } from "@/components/well-being/coach-styles";
import type { CoachServiceConfig } from "@/types/well-being";

const schema = z.object({
  acceptingBookings: z.boolean(),
  sessionLength: z.string(),
  rate: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, "Enter an amount like 75 or 75.00")
    .refine((value) => Number(value) > 0, "The rate has to be more than $0")
    .refine((value) => Number(value) <= 1000, "Keep the rate at $1,000 or less"),
  description: z
    .string()
    .trim()
    .min(1, "Describe the service for members")
    .max(300, "Keep it under 300 characters"),
});

type ServiceValues = z.infer<typeof schema>;

const field =
  "rounded-md border-[#dbe1e5] bg-surface text-sm text-foreground md:text-sm dark:border-border dark:bg-muted/40";
const label = "text-xs font-semibold tracking-wider text-muted-foreground";

/** What members see and pay for a coaching session, and whether they can book one. */
export function ServiceConfigCard({ initial }: { initial: CoachServiceConfig }) {
  const formId = useId();
  const form = useForm<ServiceValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      acceptingBookings: initial.acceptingBookings,
      sessionLength: String(initial.sessionLength),
      rate: initial.rate.toFixed(2),
      description: initial.description,
    },
  });
  const accepting = useWatch({ control: form.control, name: "acceptingBookings" });

  // UI only: there's no coaching service endpoint yet.
  const onSubmit = form.handleSubmit(() =>
    toast("Saving the service configuration isn't available yet"),
  );

  return (
    <DashboardCard className="border-border/30 pb-6 dark:border-border">
      <DashboardCardTitle id={`${formId}-title`} className="text-xl leading-7 font-semibold">
        Service Configuration
      </DashboardCardTitle>
      <form
        aria-labelledby={`${formId}-title`}
        method="post"
        onSubmit={onSubmit}
        noValidate
        className="mt-3 flex flex-col"
      >
        <Controller
          name="acceptingBookings"
          control={form.control}
          render={({ field: switchField }) => (
            <div className="flex flex-col gap-1">
              <span id={`${formId}-status`} className={label}>
                Global Service Status
              </span>
              <label className="flex w-fit cursor-pointer items-center gap-3 text-sm">
                <Switch
                  aria-describedby={`${formId}-status`}
                  checked={switchField.value}
                  onCheckedChange={switchField.onChange}
                  className="h-6 w-10 data-[size=default]:h-6 data-[size=default]:w-10 data-checked:bg-action dark:data-checked:bg-primary [&_[data-slot=switch-thumb]]:size-5 [&_[data-slot=switch-thumb]]:data-checked:translate-x-[calc(100%-4px)]"
                />
                {accepting ? "Accepting Bookings" : "Bookings Paused"}
              </label>
            </div>
          )}
        />

        <hr className="my-4 border-muted-strong dark:border-border" />

        <div className="flex flex-col gap-4">
          <Controller
            name="sessionLength"
            control={form.control}
            render={({ field: length }) => (
              <div className="flex flex-col gap-1.5">
                <span id={`${formId}-length`} className={label}>
                  Default Session Length
                </span>
                <Select value={length.value} onValueChange={length.onChange}>
                  <SelectTrigger
                    aria-labelledby={`${formId}-length`}
                    className={`${field} h-9 w-full px-3 data-[size=default]:h-9 [&_svg:not([class*='size-'])]:size-5`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {SESSION_LENGTHS.map((minutes) => (
                      <SelectItem key={minutes} value={String(minutes)} className="text-sm">
                        {sessionLengthLabel(minutes)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />
          <Controller
            name="rate"
            control={form.control}
            render={({ field: rate, fieldState }) => (
              <div className="flex flex-col gap-1.5">
                <label htmlFor={`${formId}-rate`} className={label}>
                  Standard Rate ($)
                </label>
                <Input
                  {...rate}
                  id={`${formId}-rate`}
                  inputMode="decimal"
                  autoComplete="off"
                  aria-invalid={fieldState.invalid}
                  className={`${field} h-9 px-3`}
                />
                <FieldError errors={[fieldState.error]} />
              </div>
            )}
          />
          <Controller
            name="description"
            control={form.control}
            render={({ field: description, fieldState }) => (
              <div className="flex flex-col gap-1.5">
                <label htmlFor={`${formId}-description`} className={label}>
                  Service Description (Appears to Users)
                </label>
                <Textarea
                  {...description}
                  id={`${formId}-description`}
                  aria-invalid={fieldState.invalid}
                  className={`${field} field-sizing-fixed h-19.5 min-h-0 resize-none px-3 py-2 leading-5`}
                />
                <FieldError errors={[fieldState.error]} />
              </div>
            )}
          />
        </div>

        <button
          type="submit"
          className="mt-5 h-8.5 rounded-md border border-[#dbe1e5] bg-surface text-xs font-semibold tracking-wider outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 dark:border-border dark:bg-muted/40"
        >
          Save Configuration
        </button>
      </form>
    </DashboardCard>
  );
}
