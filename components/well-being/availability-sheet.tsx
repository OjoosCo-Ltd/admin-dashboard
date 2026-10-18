"use client";

import { CopyIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { Dialog as DialogPrimitive } from "radix-ui";
import { type ReactNode, useId, useState } from "react";
import { toast } from "sonner";

import {
  ActionDialogBody,
  ActionDialogFooter,
  ActionDialogHeader,
} from "@/components/dashboard/action-dialog";
import { ActionSheetContent } from "@/components/dashboard/action-sheet";
import { CheckSwitch } from "@/components/dashboard/check-switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  COACH_TIMEZONES,
  SESSION_LENGTHS,
  sessionLengthLabel,
  WEEKDAYS,
} from "@/components/well-being/coach-styles";
import type { Coach, CoachAvailability, HoursRange, Weekday } from "@/types/well-being";

type Day = { enabled: boolean; ranges: HoursRange[] };
type Week = Record<Weekday, Day>;

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const fromMinutes = (total: number) =>
  `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;

const DEFAULT_RANGE: HoursRange = { start: "09:00", end: "17:00" };

/** The next hour after a day's last range, so "Add hours" doesn't start out overlapping. */
const nextRange = (ranges: HoursRange[]): HoursRange => {
  const last = ranges.at(-1);
  if (!last?.end) return DEFAULT_RANGE;
  const start = Math.min(toMinutes(last.end), 23 * 60);
  return { start: fromMinutes(start), end: fromMinutes(Math.min(start + 60, 23 * 60 + 59)) };
};

/** What's wrong with a day's hours, if anything: a backwards range, or two that overlap. */
const dayError = (day: Day) => {
  if (!day.enabled) return null;
  if (day.ranges.some((range) => !range.start || !range.end)) return "Fill in every time";
  if (day.ranges.some((range) => toMinutes(range.end) <= toMinutes(range.start))) {
    return "Each end time has to be after its start time";
  }
  const sorted = day.ranges.toSorted((a, b) => toMinutes(a.start) - toMinutes(b.start));
  if (
    sorted.some(
      (range, index) => index > 0 && toMinutes(range.start) < toMinutes(sorted[index - 1].end),
    )
  ) {
    return "These hours overlap";
  }
  return null;
};

const select =
  "h-9.5 w-full rounded-md border-[#dfe3e7] bg-background px-3 text-sm text-foreground data-[size=default]:h-9.5 dark:border-border dark:bg-muted/40 [&_svg:not([class*='size-'])]:size-5";

/** A coach's session length, timezone and weekly bookable hours. */
export function AvailabilitySheet({
  coach,
  availability,
  trigger,
}: {
  coach: Coach;
  availability: CoachAvailability;
  trigger: ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <ActionSheetContent className="max-w-120">
        {/* Mounted only while open, so Cancel throws away unsaved edits. */}
        <AvailabilityForm coach={coach} availability={availability} />
      </ActionSheetContent>
    </Dialog>
  );
}

function AvailabilityForm({
  coach,
  availability,
}: {
  coach: Coach;
  availability: CoachAvailability;
}) {
  const formId = useId();
  const [sessionLength, setSessionLength] = useState(String(availability.sessionLength));
  const [timezone, setTimezone] = useState(availability.timezone);
  const [week, setWeek] = useState<Week>(
    () =>
      Object.fromEntries(
        WEEKDAYS.map(({ day }) => {
          const ranges = availability.week[day];
          return [day, { enabled: ranges.length > 0, ranges }];
        }),
      ) as Week,
  );
  const [checked, setChecked] = useState(false);

  const updateDay = (day: Weekday, change: (current: Day) => Day) =>
    setWeek((current) => ({ ...current, [day]: change(current[day]) }));

  const setTime = (day: Weekday, index: number, key: keyof HoursRange, value: string) =>
    updateDay(day, (current) => ({
      ...current,
      ranges: current.ranges.map((range, i) => (i === index ? { ...range, [key]: value } : range)),
    }));

  const copyToAll = () => {
    const source = WEEKDAYS.find(({ day }) => week[day].enabled);
    if (!source) return;
    setWeek((current) => {
      const next = { ...current };
      for (const { day } of WEEKDAYS) {
        if (next[day].enabled) next[day] = { ...next[day], ranges: current[source.day].ranges };
      }
      return next;
    });
    toast(`Copied ${source.long}'s hours to every available day`);
  };

  const errors = Object.fromEntries(WEEKDAYS.map(({ day }) => [day, dayError(week[day])]));
  const save = () => {
    setChecked(true);
    if (Object.values(errors).some(Boolean)) return;
    // UI only: there's no coach availability endpoint yet.
    toast("Saving availability isn't available yet");
  };

  return (
    <>
      <ActionDialogHeader
        title="Manage Availability"
        description="Configure weekly schedule for coaching sessions."
        className="px-6 pt-5 pb-3.5"
        titleClassName="text-xl leading-7 font-semibold"
        descriptionClassName="mt-1 text-[13px]"
      />
      <ActionDialogBody className="px-6 pt-6 pb-8">
        <div className="flex items-center gap-4 rounded-lg border border-[#eceff0] bg-surface p-3.5 dark:border-border dark:bg-muted/40">
          <Avatar className="size-10">
            {coach.avatarUrl && <AvatarImage src={coach.avatarUrl} alt="" />}
            <AvatarFallback className="bg-action-soft text-xs font-semibold text-action">
              {coach.name.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold tracking-wide">{coach.name}</p>
            <p className="truncate text-[13px] text-muted-foreground">{coach.title}</p>
          </div>
          <span className="rounded bg-info-soft px-2 py-1 text-xs font-semibold tracking-wider text-[#001f2a] uppercase dark:bg-action/30 dark:text-primary">
            {coach.status === "away" ? "Away" : "Active"}
          </span>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <span id={`${formId}-length`} className="text-[13px] font-semibold tracking-wide">
              Default Session Length
            </span>
            <Select value={sessionLength} onValueChange={setSessionLength}>
              <SelectTrigger aria-labelledby={`${formId}-length`} className={select}>
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
          <div className="flex flex-col gap-1.5">
            <span id={`${formId}-timezone`} className="text-[13px] font-semibold tracking-wide">
              Timezone
            </span>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger aria-labelledby={`${formId}-timezone`} className={select}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                {COACH_TIMEZONES.map((zone) => (
                  <SelectItem key={zone.value} value={zone.value} className="text-sm">
                    {zone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <hr className="my-16 border-muted-strong dark:border-border" />

        <section aria-labelledby={`${formId}-week`}>
          <div className="flex items-center justify-between gap-4">
            <h3
              id={`${formId}-week`}
              className="text-xs font-semibold tracking-widest text-outline uppercase"
            >
              Weekly Hours
            </h3>
            <button
              type="button"
              onClick={copyToAll}
              disabled={!WEEKDAYS.some(({ day }) => week[day].enabled)}
              className="flex items-center gap-1 rounded-sm text-[13px] font-semibold tracking-wide text-action outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:text-primary"
            >
              <CopyIcon aria-hidden weight="bold" className="size-4" />
              Copy to all
            </button>
          </div>
          <ul className="mt-6 flex flex-col gap-3">
            {WEEKDAYS.map(({ day, short, long }) => (
              <DayRow
                key={day}
                label={short}
                longLabel={long}
                day={week[day]}
                error={checked ? errors[day] : null}
                onToggle={(enabled) =>
                  updateDay(day, (current) => ({
                    enabled,
                    ranges:
                      enabled && current.ranges.length === 0 ? [DEFAULT_RANGE] : current.ranges,
                  }))
                }
                onTime={(index, key, value) => setTime(day, index, key, value)}
                onAdd={() =>
                  updateDay(day, (current) => ({
                    ...current,
                    ranges: [...current.ranges, nextRange(current.ranges)],
                  }))
                }
                onRemove={(index) =>
                  updateDay(day, (current) => {
                    const ranges = current.ranges.filter((_, i) => i !== index);
                    // Removing the last stretch makes the day unavailable.
                    return { enabled: ranges.length > 0, ranges };
                  })
                }
              />
            ))}
          </ul>
        </section>
      </ActionDialogBody>
      <ActionDialogFooter className="bg-background px-6 py-6 max-sm:p-4">
        <DialogPrimitive.Close className="h-13.5 rounded-xl border border-[#dbe1e5] bg-surface px-4 text-base font-semibold tracking-wide outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 max-sm:h-11 max-sm:flex-1 max-sm:text-base dark:border-border">
          Cancel
        </DialogPrimitive.Close>
        <button
          type="button"
          onClick={save}
          className="h-13.5 rounded-xl bg-action px-4 text-base font-semibold tracking-wide text-white outline-none hover:bg-action/90 focus-visible:ring-3 focus-visible:ring-ring/50 max-sm:h-11 max-sm:flex-1 max-sm:text-base"
        >
          Save Changes
        </button>
      </ActionDialogFooter>
    </>
  );
}

function DayRow({
  label,
  longLabel,
  day,
  error,
  onToggle,
  onTime,
  onAdd,
  onRemove,
}: {
  label: string;
  longLabel: string;
  day: Day;
  error: string | null;
  onToggle: (enabled: boolean) => void;
  onTime: (index: number, key: keyof HoursRange, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  const errorId = useId();
  return (
    <li
      className={cn(
        "grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-6 rounded-lg px-4",
        day.enabled
          ? "border border-[#eceff0] bg-surface py-3.5 dark:border-border dark:bg-muted/40"
          : "bg-[#f7f8fa] py-3.5 dark:bg-muted/25",
      )}
    >
      <CheckSwitch
        size="sm"
        checked={day.enabled}
        onCheckedChange={onToggle}
        aria-label={`Available on ${longLabel}`}
      />
      <div className="flex items-center justify-between gap-4">
        <span
          className={cn(
            "text-[13px] font-semibold tracking-wide",
            !day.enabled && "font-normal text-outline",
          )}
        >
          {label}
        </span>
        {!day.enabled && (
          <span className="text-[13px] text-[#a9aeb2] dark:text-outline">Unavailable</span>
        )}
      </div>
      {day.enabled && (
        <div className="col-start-2 mt-2.5 flex flex-col gap-2">
          {day.ranges.map((range, index) => (
            <div key={index} className="flex items-center gap-2.5">
              <TimeInput
                value={range.start}
                onChange={(value) => onTime(index, "start", value)}
                aria-label={`${longLabel} hours ${index + 1}, from`}
                aria-describedby={error ? errorId : undefined}
                invalid={Boolean(error)}
              />
              <span aria-hidden className="text-muted-foreground">
                –
              </span>
              <TimeInput
                value={range.end}
                onChange={(value) => onTime(index, "end", value)}
                aria-label={`${longLabel} hours ${index + 1}, until`}
                aria-describedby={error ? errorId : undefined}
                invalid={Boolean(error)}
              />
              <button
                type="button"
                aria-label={`Remove ${longLabel} hours ${index + 1}`}
                onClick={() => onRemove(index)}
                className="ml-auto flex size-8 shrink-0 items-center justify-center rounded-md text-outline outline-none hover:bg-destructive/10 hover:text-destructive focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <TrashIcon aria-hidden className="size-5" />
              </button>
            </div>
          ))}
          {error && <FieldError id={errorId}>{error}</FieldError>}
          <button
            type="button"
            onClick={onAdd}
            className="flex w-fit items-center gap-1 rounded-sm text-[13px] text-action outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 dark:text-primary"
          >
            <PlusIcon aria-hidden weight="bold" className="size-4" />
            Add hours
          </button>
        </div>
      )}
    </li>
  );
}

function TimeInput({
  value,
  onChange,
  invalid,
  ...props
}: {
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
  "aria-label": string;
  "aria-describedby"?: string;
}) {
  return (
    <input
      type="time"
      step={900}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-invalid={invalid}
      className="h-7.5 w-27 min-w-0 rounded-md border border-[#dfe3e7] bg-background px-2.5 text-sm tabular-nums outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive dark:border-border dark:bg-muted/40 dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:hidden"
      {...props}
    />
  );
}
