"use client";

import { CaretDownIcon, CheckIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { Switch as SwitchPrimitive } from "radix-ui";
import {
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { SaveButton, SecondaryButton } from "@/components/settings/save-button";
import { SettingsCard } from "@/components/settings/settings-section";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGUAGES, type TimezoneOption, TIMEZONES, timezoneFor } from "@/constants/regional";
import type { DateFormat, LanguagePreferences } from "@/types/settings";

const DATE_FORMATS: { value: DateFormat; example: string }[] = [
  { value: "DD/MM/YYYY", example: "31/12/2026" },
  { value: "MM/DD/YYYY", example: "12/31/2026" },
  { value: "YYYY-MM-DD", example: "2026-12-31" },
  { value: "D MMM YYYY", example: "31 Dec 2026" },
];

// Case, accents and the minus sign don't matter: "sao paulo" and "utc-03" both find São Paulo.
function normalize(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").replaceAll("−", "-").toLowerCase();
}

function matches(zone: TimezoneOption, query: string) {
  const wanted = normalize(query.trim());
  return !wanted || normalize(`${zone.label} ${zone.value.replaceAll("_", " ")}`).includes(wanted);
}

// The current minute, re-read every 30 seconds. The server has no clock worth sharing, so it
// renders null and the browser fills the time in after hydration.
function subscribeToClock(onTick: () => void) {
  const timer = window.setInterval(onTick, 30_000);
  return () => window.clearInterval(timer);
}

function readMinute() {
  return Math.floor(Date.now() / 60_000);
}

function readServerMinute() {
  return null;
}

function formatClock(minute: number, timeZone: string, clock24: boolean) {
  try {
    return new Intl.DateTimeFormat(clock24 ? "en-GB" : "en-US", {
      timeZone,
      hour: clock24 ? "2-digit" : "numeric",
      minute: "2-digit",
      hourCycle: clock24 ? "h23" : "h12",
    }).format(minute * 60_000);
  } catch {
    // An unknown zone: show nothing rather than the wrong time.
    return null;
  }
}

const trigger =
  "h-11.5 w-full rounded-lg border-border/30 bg-card pr-2.5 pl-4 text-sm data-[size=default]:h-11.5 dark:border-border dark:bg-input/30 [&_svg]:size-5 [&_svg]:text-outline dark:[&_svg]:text-muted-foreground";

/** The signed-in admin's display language, date and time formats, and timezone. */
export function LanguageSettings({ initial }: { initial: LanguagePreferences }) {
  const id = useId();
  const formId = `${id}-form`;
  const form = useForm<LanguagePreferences>({ defaultValues: initial });
  const [clock24, timezone] = useWatch({ control: form.control, name: ["clock24", "timezone"] });

  // UI only: there's no endpoint for an admin's own preferences yet.
  const onSubmit = form.handleSubmit(() => toast("Saving language and region isn't available yet"));

  return (
    <SettingsCard className="overflow-hidden">
      <form
        id={formId}
        method="post"
        noValidate
        onSubmit={onSubmit}
        className="@container divide-y divide-border/20 dark:divide-border"
      >
        <PreferenceRow
          titleId={`${id}-language`}
          title="Display Language"
          description="Select the primary language for the dashboard interface."
        >
          <Controller
            name="language"
            control={form.control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger aria-labelledby={`${id}-language`} className={trigger}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  {LANGUAGES.map((language) => (
                    <SelectItem key={language.value} value={language.value} className="text-sm">
                      <span lang={language.lang}>{language.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </PreferenceRow>

        <PreferenceRow
          titleId={`${id}-format`}
          title="Date & Time Format"
          description="Customize how dates and times are displayed."
          className="bg-surface/30 dark:bg-muted/15"
        >
          <span
            id={`${id}-date`}
            className="mb-1.5 block text-[11px] leading-4 font-medium text-muted-foreground uppercase"
          >
            Date format
          </span>
          <Controller
            name="dateFormat"
            control={form.control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger aria-labelledby={`${id}-date`} className={trigger}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  {DATE_FORMATS.map((format) => (
                    <SelectItem key={format.value} value={format.value} className="text-sm">
                      {format.value} ({format.example})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <label className="mt-6 flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-border/20 bg-card px-4 py-4 dark:border-border dark:bg-input/10">
            <span className="min-w-0">
              <span id={`${id}-clock`} className="block text-sm leading-5 font-medium">
                Use 24-hour clock
              </span>
              <span
                id={`${id}-clock-hint`}
                className="block text-[13px] leading-[18px] text-muted-foreground"
              >
                e.g., 14:00 instead of 2:00 PM
              </span>
            </span>
            <Controller
              name="clock24"
              control={form.control}
              render={({ field }) => (
                <ClockSwitch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-labelledby={`${id}-clock`}
                  aria-describedby={`${id}-clock-hint`}
                />
              )}
            />
          </label>
        </PreferenceRow>

        <PreferenceRow
          titleId={`${id}-timezone`}
          title="Timezone"
          description="Set your local timezone for accurate scheduling."
        >
          <Controller
            name="timezone"
            control={form.control}
            render={({ field }) => (
              <TimezoneCombobox
                value={field.value}
                onChange={field.onChange}
                labelledBy={`${id}-timezone`}
              />
            )}
          />
          <CurrentTime zone={timezoneFor(timezone)} clock24={clock24} />
        </PreferenceRow>
      </form>

      <div className="flex flex-wrap justify-end gap-3 border-t border-border/20 bg-container px-6 py-6 max-sm:px-5 max-sm:py-5 dark:border-border dark:bg-muted/40">
        <SecondaryButton
          onClick={() => form.reset(initial)}
          className="font-semibold tracking-wide"
        >
          Cancel
        </SecondaryButton>
        <SaveButton form={formId}>Save Changes</SaveButton>
      </div>
    </SettingsCard>
  );
}

/** A title and description on the left, the controls on the right; stacked when narrow. */
function PreferenceRow({
  titleId,
  title,
  description,
  className,
  children,
}: {
  titleId: string;
  title: string;
  description: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid gap-y-5 px-5 py-6 @2xl:grid-cols-[15rem_minmax(0,1fr)] @2xl:gap-x-13 @2xl:px-8 @2xl:py-8",
        className,
      )}
    >
      <div>
        <h3 id={titleId} className="text-xl leading-7 font-semibold">
          {title}
        </h3>
        <p className="mt-1 text-[13px] leading-[18px] text-muted-foreground">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** The Figma's plain toggle: 44 × 24, with a white thumb inset 2px. */
function ClockSwitch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors outline-none after:absolute after:-inset-2 focus-visible:ring-3 focus-visible:ring-ring/50 data-checked:bg-action dark:data-checked:bg-primary data-unchecked:bg-input dark:data-unchecked:bg-input/80",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block size-5 rounded-full bg-white shadow-[0_1px_2px_rgb(0_0_0/0.15)] transition-transform data-checked:translate-x-5" />
    </SwitchPrimitive.Root>
  );
}

/** "Current time in WAT: 14:32", in the chosen zone. Rendered only in the browser. */
function CurrentTime({ zone, clock24 }: { zone: TimezoneOption; clock24: boolean }) {
  const minute = useSyncExternalStore(subscribeToClock, readMinute, readServerMinute);
  const time = minute === null ? null : formatClock(minute, zone.value, clock24);
  return (
    <p className="mt-2 text-[13px] leading-[18px] text-muted-foreground italic">
      Current time in {zone.short}:{" "}
      {time === null ? (
        <span aria-hidden className="invisible">
          00:00
        </span>
      ) : (
        <span className="text-foreground">{time}</span>
      )}
    </p>
  );
}

/**
 * A searchable timezone picker: the button opens a search field over a listbox. Type to filter,
 * ↑/↓ to move, Enter to pick, Escape to close (focus goes back to the button).
 */
function TimezoneCombobox({
  value,
  onChange,
  labelledBy,
}: {
  value: string;
  onChange: (value: string) => void;
  labelledBy: string;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const selected = timezoneFor(value);
  const results = TIMEZONES.filter((zone) => matches(zone, query));
  const activeZone = results[active];
  const optionId = (zone: TimezoneOption) => `${id}-${zone.value.replace(/\W/g, "-")}`;

  function show(seed: string) {
    setQuery(seed);
    setActive(seed ? 0 : Math.max(0, TIMEZONES.indexOf(selected)));
    setOpen(true);
  }

  function pick(zone: TimezoneOption) {
    onChange(zone.value);
    setOpen(false);
  }

  function moveTo(index: number) {
    setActive(index);
    const zone = results[index];
    if (zone) document.getElementById(optionId(zone))?.scrollIntoView({ block: "nearest" });
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      show("");
    } else if (
      event.key.length === 1 &&
      event.key !== " " &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      // Typing on the closed picker starts a search with that letter.
      event.preventDefault();
      show(event.key);
    }
  }

  function onSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveTo(Math.min(active + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveTo(Math.max(active - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (activeZone) pick(activeZone);
    }
  }

  return (
    <Popover open={open} onOpenChange={(next) => (next ? show("") : setOpen(false))}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-labelledby={`${labelledBy} ${id}-value`}
          onKeyDown={onTriggerKeyDown}
          className="flex h-11.5 w-full items-center gap-2 rounded-lg border border-border/30 bg-card pr-3 pl-2.5 text-left text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=open]:border-ring dark:border-border dark:bg-input/30 dark:hover:bg-input/50"
        >
          <MagnifyingGlassIcon
            aria-hidden
            weight="bold"
            className="size-5.5 shrink-0 text-outline"
          />
          <span id={`${id}-value`} className="min-w-0 flex-1 truncate">
            {selected.label}
          </span>
          <CaretDownIcon
            aria-hidden
            weight="bold"
            className="size-4 shrink-0 text-outline dark:text-muted-foreground"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        aria-label="Choose a timezone"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          const input = inputRef.current;
          input?.focus();
          input?.setSelectionRange(input.value.length, input.value.length);
          if (activeZone)
            document.getElementById(optionId(activeZone))?.scrollIntoView({ block: "nearest" });
        }}
        className="w-(--radix-popover-trigger-width) gap-0 overflow-hidden p-0"
      >
        <div className="flex items-center gap-2 border-b border-border/30 px-3 dark:border-border">
          <MagnifyingGlassIcon aria-hidden className="size-4.5 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeZone ? optionId(activeZone) : undefined}
            aria-label="Search timezones"
            placeholder="Search timezones"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onSearchKeyDown}
            className="h-11 w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div
          role="listbox"
          id={listId}
          aria-label="Timezones"
          className="max-h-72 overflow-y-auto overscroll-contain p-1 empty:hidden"
        >
          {results.map((zone, index) => (
            <div
              key={zone.value}
              id={optionId(zone)}
              role="option"
              aria-selected={zone.value === value}
              data-active={index === active}
              onPointerMove={() => setActive(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => pick(zone)}
              className="flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 text-sm aria-selected:font-medium data-active:bg-accent dark:data-active:bg-muted"
            >
              <span className="min-w-0 flex-1">{zone.label}</span>
              {zone.value === value && (
                <CheckIcon
                  aria-hidden
                  weight="bold"
                  className="size-4 shrink-0 text-action dark:text-foreground"
                />
              )}
            </div>
          ))}
        </div>
        {results.length === 0 && (
          <p role="status" className="px-3 py-6 text-center text-sm text-muted-foreground">
            No timezone matches “{query.trim()}”
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}
