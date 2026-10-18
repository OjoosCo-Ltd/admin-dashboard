"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  FlagIcon,
  SlidersHorizontalIcon,
  ToggleRightIcon,
  UsersThreeIcon,
  type Icon,
} from "@phosphor-icons/react";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { CheckSwitch } from "@/components/dashboard/check-switch";
import { SaveButton } from "@/components/settings/save-button";
import { SettingsCard } from "@/components/settings/settings-section";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { CommunitySettings as CommunityValues } from "@/types/settings";

const whole = (min: number, max: number) =>
  z.coerce
    .number<string | number>({ error: "Enter a number" })
    .int("Use a whole number")
    .min(min, `Use at least ${min}`)
    .max(max, `Use at most ${max}`);

const schema = z.object({
  groupsEnabled: z.boolean(),
  userEventsEnabled: z.boolean(),
  autoModeration: z.boolean(),
  groupApprovalRequired: z.boolean(),
  maxGroupsPerUser: whole(1, 50),
  reportThreshold: whole(1, 20),
});

const BEHAVIORS = [
  {
    name: "groupsEnabled",
    title: "Community Groups Enabled",
    description: "Allow users to view and interact with community groups.",
  },
  {
    name: "userEventsEnabled",
    title: "User-Led Events Enabled",
    description: "Permit standard users to organize and host events.",
  },
  {
    name: "autoModeration",
    title: "Automated Discussion Moderation",
    description: "Use AI to flag and hide toxic comments automatically.",
  },
  {
    name: "groupApprovalRequired",
    title: "New Group Approval Required",
    description: "Admins must approve newly created groups before they go live.",
  },
] as const;

const LIMITS: {
  name: "maxGroupsPerUser" | "reportThreshold";
  title: string;
  hint: string;
  icon: Icon;
}[] = [
  {
    name: "maxGroupsPerUser",
    title: "Max Groups per User",
    hint: "Maximum number of groups a single user can create or moderate.",
    icon: UsersThreeIcon,
  },
  {
    name: "reportThreshold",
    title: "Report Threshold for Auto-Hide",
    hint: "Number of unique user reports required before content is automatically hidden pending review.",
    icon: FlagIcon,
  },
];

const cardHead =
  "flex items-center gap-3 border-b border-border/40 bg-[#fbfcfe] px-6 py-5 text-xl leading-7 font-semibold dark:border-border dark:bg-transparent";

/** Community-wide switches, and the limits that keep groups and reports in check. */
export function CommunitySettings({ initial }: { initial: CommunityValues }) {
  const formId = useId();
  const form = useForm({ resolver: zodResolver(schema), defaultValues: initial });

  // UI only: there's no community settings endpoint yet.
  const onSubmit = form.handleSubmit(() => toast("Saving community settings isn't available yet"));

  return (
    <form id={formId} method="post" onSubmit={onSubmit} noValidate className="flex flex-col gap-10">
      <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_19.75rem]">
        <SettingsCard aria-labelledby={`${formId}-behaviors`} className="overflow-hidden">
          <h3 id={`${formId}-behaviors`} className={cardHead}>
            <ToggleRightIcon
              aria-hidden
              weight="bold"
              className="size-6 text-action dark:text-primary"
            />
            Global Behaviors
          </h3>
          <ul className="divide-y divide-border/40 px-6 dark:divide-border">
            {BEHAVIORS.map((behavior) => (
              <Controller
                key={behavior.name}
                name={behavior.name}
                control={form.control}
                render={({ field }) => (
                  <li className="flex items-center justify-between gap-6 py-5.5">
                    <div className="max-w-88">
                      <p id={`${formId}-${behavior.name}`} className="text-sm font-semibold">
                        {behavior.title}
                      </p>
                      <p
                        id={`${formId}-${behavior.name}-hint`}
                        className="mt-0.5 text-[13px] leading-[18px] text-muted-foreground"
                      >
                        {behavior.description}
                      </p>
                    </div>
                    <CheckSwitch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-labelledby={`${formId}-${behavior.name}`}
                      aria-describedby={`${formId}-${behavior.name}-hint`}
                    />
                  </li>
                )}
              />
            ))}
          </ul>
        </SettingsCard>

        <SettingsCard aria-labelledby={`${formId}-limits`} className="overflow-hidden">
          <h3 id={`${formId}-limits`} className={cardHead}>
            <SlidersHorizontalIcon
              aria-hidden
              weight="bold"
              className="size-6 text-action dark:text-primary"
            />
            Limits &amp; Thresholds
          </h3>
          <div className="flex flex-col gap-8 px-6 pt-7 pb-6">
            {LIMITS.map((limit) => (
              <Controller
                key={limit.name}
                name={limit.name}
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor={`${formId}-${limit.name}`}
                      className="text-[13px] font-semibold tracking-wide"
                    >
                      {limit.title}
                    </label>
                    <div className="relative">
                      <Input
                        {...field}
                        value={field.value as number | string}
                        id={`${formId}-${limit.name}`}
                        type="number"
                        inputMode="numeric"
                        aria-invalid={fieldState.invalid}
                        aria-describedby={`${formId}-${limit.name}-hint`}
                        className="h-11 rounded-lg border-[#dbe1e5] bg-surface px-4 pr-11 text-[15px] md:text-[15px] dark:border-border dark:bg-muted/40"
                      />
                      <limit.icon
                        aria-hidden
                        className="pointer-events-none absolute top-1/2 right-4 size-4.5 -translate-y-1/2 text-border"
                      />
                    </div>
                    <FieldError errors={[fieldState.error]} />
                    <p
                      id={`${formId}-${limit.name}-hint`}
                      className="text-[13px] leading-[18px] text-muted-foreground"
                    >
                      {limit.hint}
                    </p>
                  </div>
                )}
              />
            ))}
          </div>
        </SettingsCard>
      </div>

      <SettingsCard className="flex justify-end px-6 py-6">
        <SaveButton>Save Community Settings</SaveButton>
      </SettingsCard>
    </form>
  );
}
