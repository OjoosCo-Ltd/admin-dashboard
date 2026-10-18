"use client";

import { FloppyDiskIcon } from "@phosphor-icons/react";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { CheckSwitch } from "@/components/dashboard/check-switch";
import { SettingsCard } from "@/components/settings/settings-section";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AssessmentFrequency, WellbeingSettings as WellbeingValues } from "@/types/settings";

const MODULES = [
  {
    name: "areaEnabled",
    title: "Well-being Area Enabled",
    description: "Activate the main well-being hub for all users.",
  },
  {
    name: "dailyAssessment",
    title: "Daily Assessment Enabled",
    description: "Allow users to take daily pulse checks.",
  },
  {
    name: "mindfulnessLibrary",
    title: "Mindfulness Resource Library Enabled",
    description: "Provide access to guided meditations and reading materials.",
  },
  {
    name: "coachBooking",
    title: "Dating Coach Booking Enabled",
    description: "Enable 1-on-1 sessions with relationship experts.",
  },
] as const;

const FREQUENCIES: { value: AssessmentFrequency; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every two weeks" },
  { value: "monthly", label: "Monthly" },
];

const SESSION_LENGTHS = [30, 45, 60, 90];

const select =
  "h-11 w-full rounded-lg border-[#dbe1e5] bg-surface px-4 text-[15px] data-[size=default]:h-11 dark:border-border dark:bg-muted/40 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='size-'])]:opacity-60";

/** Which well-being features are on, and how often members are prompted. */
export function WellbeingSettings({ initial }: { initial: WellbeingValues }) {
  const formId = useId();
  const form = useForm<WellbeingValues>({ defaultValues: initial });

  // UI only: there's no well-being settings endpoint yet.
  const onSubmit = form.handleSubmit(() => toast("Saving well-being settings isn't available yet"));

  return (
    <form
      id={formId}
      method="post"
      onSubmit={onSubmit}
      noValidate
      className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]"
    >
      <SettingsCard aria-labelledby={`${formId}-modules`} className="p-6">
        <h3 id={`${formId}-modules`} className="text-xl leading-7 font-semibold">
          Feature Modules
        </h3>
        <ul className="mt-6 flex flex-col gap-3">
          {MODULES.map((module) => (
            <Controller
              key={module.name}
              name={module.name}
              control={form.control}
              render={({ field }) => (
                <li className="flex items-center justify-between gap-6 rounded-lg border border-[#e6e8eb] bg-muted px-4 py-4 dark:border-border dark:bg-muted/40">
                  <div className="max-w-72">
                    <p
                      id={`${formId}-${module.name}`}
                      className="text-[13px] font-semibold tracking-wide"
                    >
                      {module.title}
                    </p>
                    <p
                      id={`${formId}-${module.name}-hint`}
                      className="mt-1 text-[13px] leading-[18px] text-muted-foreground"
                    >
                      {module.description}
                    </p>
                  </div>
                  <CheckSwitch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-labelledby={`${formId}-${module.name}`}
                    aria-describedby={`${formId}-${module.name}-hint`}
                    className="mr-1"
                  />
                </li>
              )}
            />
          ))}
        </ul>
      </SettingsCard>

      <div className="flex flex-col gap-6">
        <SettingsCard aria-labelledby={`${formId}-params`} className="p-6">
          <h3 id={`${formId}-params`} className="text-xl leading-7 font-semibold">
            Service Parameters
          </h3>
          <div className="mt-5 flex flex-col gap-6">
            <Controller
              name="assessmentFrequency"
              control={form.control}
              render={({ field }) => (
                <div className="flex flex-col gap-2">
                  <span
                    id={`${formId}-frequency`}
                    className="text-[13px] font-semibold tracking-wide"
                  >
                    Assessment Frequency
                  </span>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      aria-labelledby={`${formId}-frequency`}
                      aria-describedby={`${formId}-frequency-hint`}
                      className={select}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {FREQUENCIES.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-sm">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p
                    id={`${formId}-frequency-hint`}
                    className="text-[13px] leading-[18px] text-muted-foreground"
                  >
                    How often users are prompted for core assessments.
                  </p>
                </div>
              )}
            />
            <Controller
              name="coachSessionLength"
              control={form.control}
              render={({ field }) => (
                <div className="flex flex-col gap-2">
                  <span id={`${formId}-length`} className="text-[13px] font-semibold tracking-wide">
                    Default Coach Session Length
                  </span>
                  <Select
                    value={String(field.value)}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <SelectTrigger
                      aria-labelledby={`${formId}-length`}
                      aria-describedby={`${formId}-length-hint`}
                      className={select}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {SESSION_LENGTHS.map((minutes) => (
                        <SelectItem key={minutes} value={String(minutes)} className="text-sm">
                          {minutes} mins
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p
                    id={`${formId}-length-hint`}
                    className="text-[13px] leading-[18px] text-muted-foreground"
                  >
                    Standard duration allocated for initial bookings.
                  </p>
                </div>
              )}
            />
          </div>
        </SettingsCard>

        <SettingsCard className="flex flex-col items-center border-[#e6e8eb] bg-muted px-6 pt-8 pb-6 text-center dark:border-border dark:bg-muted/40">
          <FloppyDiskIcon
            aria-hidden
            weight="bold"
            className="size-7 text-action dark:text-primary"
          />
          <h3 className="mt-4 text-xl leading-7 font-semibold">Apply Changes</h3>
          <p className="mt-2 text-sm leading-[18px] text-muted-foreground">
            Review your configuration before saving to the live environment.
          </p>
          <button
            type="submit"
            className="mt-6 h-14 w-full rounded-xl bg-action text-base font-semibold tracking-wide text-white outline-none hover:bg-action/90 focus-visible:ring-3 focus-visible:ring-ring/50 max-sm:h-12 max-sm:text-base"
          >
            Save Well-being Settings
          </button>
        </SettingsCard>
      </div>
    </form>
  );
}
