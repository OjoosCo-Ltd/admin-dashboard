"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRightIcon,
  CalendarBlankIcon,
  CpuIcon,
  InfoIcon,
  PercentIcon,
  SlidersHorizontalIcon,
  TimerIcon,
  type Icon,
} from "@phosphor-icons/react";
import { cn } from "cn";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { CheckSwitch } from "@/components/dashboard/check-switch";
import { ToastButton } from "@/components/dashboard/toast-button";
import { SaveButton } from "@/components/settings/save-button";
import { formatTimeAgo } from "@/components/settings/settings-format";
import { SettingsCard } from "@/components/settings/settings-section";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FEATURES } from "@/constants/features";
import type { EngineStatus, MatchingSettings as MatchingValues } from "@/types/settings";

const whole = (min: number, max: number, unit: string) =>
  z.coerce
    .number<string | number>({ error: "Enter a number" })
    .int("Use a whole number")
    .min(min, `Use at least ${min} ${unit}`)
    .max(max, `Use at most ${max} ${unit}`);

const schema = z.object({
  matchingEnabled: z.boolean(),
  aiEnabled: z.boolean(),
  insightsEnabled: z.boolean(),
  expirationHours: whole(1, 168, "hours"),
  compatibilityThreshold: whole(0, 100, "percent"),
  dailyMatchLimit: whole(1, 50, "matches"),
});

const TOGGLES = [
  {
    name: "matchingEnabled",
    title: "Matching Enabled",
    description: "Master switch for the entire discovery system.",
  },
  {
    name: "aiEnabled",
    title: "AI Matchmaking Enabled",
    description: "Engage the neural engine for predictive pairings.",
  },
  {
    name: "insightsEnabled",
    title: "Smart Compatibility Insights Integration",
    description: "Display detailed compatibility breakdowns to users.",
  },
] as const;

const NUMBERS: {
  name: "expirationHours" | "compatibilityThreshold" | "dailyMatchLimit";
  title: string;
  icon: Icon;
}[] = [
  { name: "expirationHours", title: "Match Expiration (Hours)", icon: TimerIcon },
  { name: "compatibilityThreshold", title: "Compatibility Threshold (%)", icon: PercentIcon },
  { name: "dailyMatchLimit", title: "Daily Match Limit", icon: CalendarBlankIcon },
];

/** The matchmaking engine's switches and limits, beside its live status. */
export function MatchingSettings({
  initial,
  engine,
}: {
  initial: MatchingValues;
  engine: EngineStatus;
}) {
  const formId = useId();
  const form = useForm({ resolver: zodResolver(schema), defaultValues: initial });

  // UI only: the matching weights endpoint covers scoring, not these switches.
  const onSubmit = form.handleSubmit(() => toast("Saving matching settings isn't available yet"));

  return (
    <div
      className={cn(
        "grid items-start gap-6",
        FEATURES.matchingSettings && "xl:grid-cols-[minmax(0,1fr)_17.5rem]",
      )}
    >
      {FEATURES.matchingSettings && (
        <SettingsCard aria-labelledby={`${formId}-title`} className="px-6 pt-8 pb-6 sm:px-11">
          <div className="flex items-start gap-4 border-b border-border/40 pb-4 dark:border-border">
            <span
              aria-hidden
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f2fbff] text-action-icon dark:bg-action/25 dark:text-primary"
            >
              <SlidersHorizontalIcon weight="bold" className="size-6" />
            </span>
            <div>
              <h3 id={`${formId}-title`} className="text-xl leading-7 font-semibold">
                Matching Engine Controls
              </h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Manage core logic and thresholds for user pairings.
              </p>
            </div>
          </div>

          <form id={formId} method="post" onSubmit={onSubmit} noValidate>
            <ul className="mt-12 flex flex-col gap-6">
              {TOGGLES.map((toggle) => (
                <Controller
                  key={toggle.name}
                  name={toggle.name}
                  control={form.control}
                  render={({ field }) => (
                    <li className="flex items-center justify-between gap-6">
                      <div>
                        <p
                          id={`${formId}-${toggle.name}`}
                          className="text-base leading-6 font-semibold"
                        >
                          {toggle.title}
                        </p>
                        <p
                          id={`${formId}-${toggle.name}-hint`}
                          className="text-[13px] text-muted-foreground"
                        >
                          {toggle.description}
                        </p>
                      </div>
                      <CheckSwitch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-labelledby={`${formId}-${toggle.name}`}
                        aria-describedby={`${formId}-${toggle.name}-hint`}
                      />
                    </li>
                  )}
                />
              ))}
            </ul>

            <div className="mt-16 grid gap-x-6 gap-y-6 rounded-lg border border-[#e6eaef] bg-surface p-6 sm:grid-cols-2 dark:border-border dark:bg-muted/40">
              {NUMBERS.map((item) => (
                <Controller
                  key={item.name}
                  name={item.name}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor={`${formId}-${item.name}`}
                        className="text-[13px] font-semibold tracking-wide"
                      >
                        {item.title}
                      </label>
                      <div className="relative sm:max-w-44">
                        <item.icon
                          aria-hidden
                          className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-[#a9aeb2]"
                        />
                        <Input
                          {...field}
                          value={field.value as number | string}
                          id={`${formId}-${item.name}`}
                          type="number"
                          inputMode="numeric"
                          aria-invalid={fieldState.invalid}
                          className="h-9.5 rounded-lg border-[#e6e8eb] bg-background pl-11 text-[15px] md:text-[15px] dark:border-border"
                        />
                      </div>
                      <FieldError errors={[fieldState.error]} />
                    </div>
                  )}
                />
              ))}
            </div>

            <div className="mt-20 flex justify-end border-t border-border/40 pt-6 dark:border-border">
              <SaveButton className="bg-action-icon hover:bg-action-icon/90">
                Save Configuration
              </SaveButton>
            </div>
          </form>
        </SettingsCard>
      )}

      {/* The note explains the engine switch, so it goes with the controls, and
          the status then has the row to itself. */}
      <div className={cn("grid gap-6", FEATURES.matchingSettings && "max-xl:sm:grid-cols-2")}>
        <SettingsCard aria-labelledby={`${formId}-engine`} className="p-6">
          <h3 id={`${formId}-engine`} className="flex items-center gap-2 text-[17px] font-semibold">
            <CpuIcon
              aria-hidden
              weight="bold"
              className="size-5 text-action-icon dark:text-primary"
            />
            Engine Status
          </h3>
          <dl className="mt-4 flex flex-col gap-3 text-[13px]">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-[#e6eaef] bg-surface px-3 py-3 dark:border-border dark:bg-muted/40">
              <dt className="whitespace-nowrap text-muted-foreground">Model Version</dt>
              <dd className="rounded bg-[#e0e3e6] px-2 py-1 text-xs font-semibold tracking-wide whitespace-nowrap dark:bg-muted">
                {engine.modelVersion}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-[#e6eaef] bg-surface px-3 py-4 dark:border-border dark:bg-muted/40">
              <dt className="whitespace-nowrap text-muted-foreground">Current Load</dt>
              <dd className="flex items-center gap-2.5">
                <span
                  aria-hidden
                  className="h-1.5 w-14 overflow-hidden rounded-full bg-muted-strong dark:bg-muted"
                >
                  <span
                    className="block h-full rounded-full bg-action-icon"
                    style={{ width: `${engine.load}%` }}
                  />
                </span>
                <span className="font-semibold tracking-wide tabular-nums">{engine.load}%</span>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-[#e6eaef] bg-surface px-3 py-4 dark:border-border dark:bg-muted/40">
              <dt className="text-muted-foreground">Last Synced</dt>
              <dd>{formatTimeAgo(engine.lastSyncedAt)}</dd>
            </div>
          </dl>
        </SettingsCard>

        {FEATURES.matchingSettings && (
          <section
            aria-labelledby={`${formId}-about`}
            className="flex gap-3 rounded-2xl border border-[#cfe6f3] bg-[#e9f4fb] p-6 dark:border-border dark:bg-action/15"
          >
            <InfoIcon
              aria-hidden
              weight="bold"
              className="mt-0.5 size-5 shrink-0 text-action-icon dark:text-primary"
            />
            <div>
              <h3 id={`${formId}-about`} className="text-[13px] font-semibold tracking-wide">
                About AI Matchmaking
              </h3>
              <p className="mt-1 text-[13px] leading-[21px] text-muted-foreground">
                Enabling the neural engine offloads standard deterministic matching to our
                predictive models. This requires a 24-hour calibration period upon initial
                activation.
              </p>
              <ToastButton
                message="The matchmaking documentation isn't available yet"
                className="mt-3 flex items-center gap-1 rounded-sm text-[13px] font-semibold tracking-wide text-action-icon outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 dark:text-primary"
              >
                View Documentation
                <ArrowRightIcon aria-hidden weight="bold" className="size-3.5" />
              </ToastButton>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
