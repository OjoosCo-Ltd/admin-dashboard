"use client";

import { CalendarDotsIcon, CaretDownIcon, DownloadSimpleIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { format, isSameYear, startOfMonth, startOfYear, subDays } from "date-fns";
import { type ComponentProps, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FEATURES } from "@/constants/features";

// Each preset ends today; the day counts include it.
const PRESETS = {
  mtd: { label: "Month to date", start: (today: Date) => startOfMonth(today) },
  "7d": { label: "Last 7 days", start: (today: Date) => subDays(today, 6) },
  "30d": { label: "Last 30 days", start: (today: Date) => subDays(today, 29) },
  "90d": { label: "Last 90 days", start: (today: Date) => subDays(today, 89) },
  ytd: { label: "This year", start: (today: Date) => startOfYear(today) },
};

type Preset = keyof typeof PRESETS;

const isPreset = (value: string): value is Preset => Object.hasOwn(PRESETS, value);

const subscribe = () => () => {};

/** "Jul 1 - Jul 24, 2026", with both years when the range crosses one. */
function rangeLabel(preset: Preset, today: Date) {
  const start = PRESETS[preset].start(today);
  const from = format(start, isSameYear(start, today) ? "MMM d" : "MMM d, yyyy");
  return `${from} - ${format(today, "MMM d, yyyy")}`;
}

/** The page header's date-range picker. Hidden until the stats and list routes take a range. */
export function DateRangeSelect() {
  return FEATURES.dateRanges ? <DateRangePicker /> : null;
}

function DateRangePicker() {
  const [preset, setPreset] = useState<Preset>("mtd");
  // Dates are the viewer's local ones, so the server renders none (as in TodayDate).
  const label = useSyncExternalStore(
    subscribe,
    () => rangeLabel(preset, new Date()),
    () => null,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-14 gap-1.5 rounded-[12px] bg-transparent pr-7 pl-5.5 text-sm font-normal text-subtle-foreground max-sm:w-full"
        >
          <CalendarDotsIcon aria-hidden className="size-6.5 text-muted-foreground" />
          <span className="sr-only">Date range: </span>
          {/* Holds the width until the client fills in the dates. */}
          <span className="mr-2.5 min-w-32 text-left">{label}</span>
          <CaretDownIcon
            aria-hidden
            weight="bold"
            className="ml-auto size-4 text-muted-foreground"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={preset}
          onValueChange={(value) => isPreset(value) && setPreset(value)}
        >
          {Object.entries(PRESETS).map(([id, { label }]) => (
            <DropdownMenuRadioItem key={id} value={id} className="py-2">
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** The page header's primary action. Hidden until there's an export route. */
export function ExportReportButton({
  onClick = () => toast("Report export isn't available yet"),
  className,
  ...props
}: ComponentProps<typeof Button>) {
  if (!FEATURES.exports) return null;
  return (
    <Button
      onClick={onClick}
      className={cn(
        "h-14 gap-3 rounded-[12px] pr-6 pl-5.5 text-base font-semibold max-sm:w-full",
        className,
      )}
      {...props}
    >
      <DownloadSimpleIcon aria-hidden weight="bold" className="size-3.5" />
      Export Report
    </Button>
  );
}
