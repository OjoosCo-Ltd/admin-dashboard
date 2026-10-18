"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { WarningIcon } from "@phosphor-icons/react";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { SaveButton } from "@/components/settings/save-button";
import { formatUtc } from "@/components/settings/settings-format";
import { SettingsCard } from "@/components/settings/settings-section";
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
import { LANGUAGES, TIMEZONES } from "@/constants/regional";
import type { PlatformSettings, PlatformStatus } from "@/types/settings";

const CURRENCIES = [
  { value: "USD", label: "USD ($)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "NGN", label: "NGN (₦)" },
];

const STATUS_LABELS: Record<PlatformStatus["status"], string> = {
  operational: "Operational",
  degraded: "Degraded",
  outage: "Outage",
};

const schema = z.object({
  name: z.string().trim().min(1, "Name the platform").max(40, "Keep it under 40 characters"),
  supportEmail: z.email("Enter an email address like support@xparience.com"),
  description: z.string().trim().max(200, "Keep it under 200 characters"),
  language: z.string(),
  currency: z.string(),
  timezone: z.string(),
});

type GeneralValues = z.infer<typeof schema>;

const label = "text-[13px] font-semibold tracking-wide";
const field =
  "rounded-lg border-[#dbe1e5] bg-surface px-4 text-[15px] md:text-[15px] dark:border-border dark:bg-muted/40";

/** The platform's name, contact and regional defaults, its status, and maintenance mode. */
export function GeneralSettings({
  initial,
  status,
}: {
  initial: PlatformSettings;
  status: PlatformStatus;
}) {
  const formId = useId();
  const form = useForm<GeneralValues>({ resolver: zodResolver(schema), defaultValues: initial });

  // UI only: there's no platform settings endpoint yet.
  const onSubmit = form.handleSubmit(() => toast("Saving platform settings isn't available yet"));

  const selects = [
    { name: "language", title: "Default Language", options: LANGUAGES },
    { name: "currency", title: "Default Currency", options: CURRENCIES },
    { name: "timezone", title: "System Timezone", options: TIMEZONES },
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      <SettingsCard aria-labelledby={`${formId}-title`} className="overflow-hidden">
        <div className="border-b border-border/40 bg-surface px-6 py-6 dark:border-border dark:bg-muted/40">
          <h3 id={`${formId}-title`} className="text-xl leading-7 font-semibold">
            Platform Information
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage global settings and regional configurations for your Xparience instance.
          </p>
        </div>
        <form
          id={formId}
          method="post"
          onSubmit={onSubmit}
          noValidate
          className="flex flex-col gap-6 px-6 pt-7 pb-6"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <Controller
              name="name"
              control={form.control}
              render={({ field: name, fieldState }) => (
                <div className="flex flex-col gap-2">
                  <label htmlFor={`${formId}-name`} className={label}>
                    Platform Name
                  </label>
                  <Input
                    {...name}
                    id={`${formId}-name`}
                    aria-invalid={fieldState.invalid}
                    className={`${field} h-9.5`}
                  />
                  <FieldError errors={[fieldState.error]} />
                </div>
              )}
            />
            <Controller
              name="supportEmail"
              control={form.control}
              render={({ field: email, fieldState }) => (
                <div className="flex flex-col gap-2">
                  <label htmlFor={`${formId}-email`} className={label}>
                    Support Email
                  </label>
                  <Input
                    {...email}
                    id={`${formId}-email`}
                    type="email"
                    aria-invalid={fieldState.invalid}
                    className={`${field} h-9.5`}
                  />
                  <FieldError errors={[fieldState.error]} />
                </div>
              )}
            />
          </div>
          <Controller
            name="description"
            control={form.control}
            render={({ field: description, fieldState }) => (
              <div className="flex flex-col gap-2">
                <label htmlFor={`${formId}-description`} className={label}>
                  Platform Description
                </label>
                <Textarea
                  {...description}
                  id={`${formId}-description`}
                  aria-invalid={fieldState.invalid}
                  className={`${field} field-sizing-fixed h-19.5 min-h-0 resize-none py-2.5`}
                />
                <FieldError errors={[fieldState.error]} />
              </div>
            )}
          />
          <hr className="border-border/40 dark:border-border" />
          <div className="grid gap-6 sm:grid-cols-3">
            {selects.map((item) => (
              <Controller
                key={item.name}
                name={item.name}
                control={form.control}
                render={({ field: select }) => (
                  <div className="flex flex-col gap-2">
                    <span id={`${formId}-${item.name}`} className={label}>
                      {item.title}
                    </span>
                    <Select value={select.value} onValueChange={select.onChange}>
                      <SelectTrigger
                        aria-labelledby={`${formId}-${item.name}`}
                        className={`${field} h-9.5 w-full data-[size=default]:h-9.5 [&_svg:not([class*='size-'])]:size-5`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {item.options.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="text-sm">
                            <span lang={"lang" in option ? option.lang : undefined}>
                              {option.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
            ))}
          </div>
        </form>
        <div className="flex justify-end border-t border-border/40 bg-surface px-6 py-6 dark:border-border dark:bg-muted/40">
          <SaveButton form={formId}>Save Changes</SaveButton>
        </div>
      </SettingsCard>

      <div className="grid items-start gap-6 md:grid-cols-2">
        <SettingsCard aria-labelledby={`${formId}-status`} className="px-6 pt-6 pb-4">
          <h3 id={`${formId}-status`} className="text-xl leading-7 font-semibold">
            Platform Status
          </h3>
          <dl className="mt-6 divide-y divide-border/30 text-[15px] dark:divide-border">
            <div className="flex items-center justify-between gap-4 py-3.5">
              <dt className="text-muted-foreground">System Status</dt>
              <dd className="flex items-center gap-2 rounded-full border border-[#d6ebf6] bg-[#eff8fd] px-3 py-1 text-xs dark:border-border dark:bg-action/20">
                <span aria-hidden className="size-2 rounded-full bg-[#10b981]" />
                {STATUS_LABELS[status.status]}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-4">
              <dt className="text-muted-foreground">Current Version</dt>
              <dd className="font-medium">{status.version}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-4">
              <dt className="text-muted-foreground">Environment</dt>
              <dd className="font-medium">{status.environment}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-4">
              <dt className="text-muted-foreground">Last Update</dt>
              <dd className="font-medium">{formatUtc(status.updatedAt)}</dd>
            </div>
          </dl>
        </SettingsCard>

        <MaintenanceCard />
      </div>
    </div>
  );
}

function MaintenanceCard() {
  const titleId = useId();
  return (
    <SettingsCard aria-labelledby={titleId} className="relative overflow-hidden p-6">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-[radial-gradient(circle,rgb(255_218_214/0.55),transparent_65%)] dark:opacity-30"
      />
      <h3 id={titleId} className="relative flex items-center gap-3 text-xl leading-7 font-semibold">
        <WarningIcon aria-hidden weight="bold" className="size-6 text-destructive" />
        Maintenance Mode
      </h3>
      <p className="relative mt-3 max-w-64 text-sm leading-[21px] text-muted-foreground">
        Enabling maintenance mode will restrict access to all non-admin users. Active sessions will
        be terminated immediately. Use only during scheduled downtime.
      </p>
      <label className="relative mt-6 flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-[#f5d5d1] bg-[#fffbfb] px-4 py-4.5 dark:border-destructive/40 dark:bg-destructive/10">
        <span className="text-[15px] font-semibold">Enable Maintenance</span>
        {/* UI only: it would sign every member out, so it stays off until the endpoint exists. */}
        <Switch
          checked={false}
          onCheckedChange={() => toast("Maintenance mode isn't available yet")}
          className="h-6 w-11 data-[size=default]:h-6 data-[size=default]:w-11 data-checked:bg-destructive data-unchecked:bg-[#dfe1e5] dark:data-unchecked:bg-muted [&_[data-slot=switch-thumb]]:size-5"
        />
      </label>
    </SettingsCard>
  );
}
