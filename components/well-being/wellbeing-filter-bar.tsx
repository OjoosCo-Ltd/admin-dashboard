"use client";

import { FunnelSimpleIcon } from "@phosphor-icons/react";
import { toast } from "sonner";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Option {
  value: string;
  label: string;
}

/** The section's filter row: a category and a status dropdown, and More Filters at the end. */
export function WellbeingFilterBar({
  category,
  categories,
  onCategoryChange,
  status,
  statuses,
  onStatusChange,
}: {
  category: string;
  categories: Option[];
  onCategoryChange: (value: string) => void;
  status: string;
  statuses: Option[];
  onStatusChange: (value: string) => void;
}) {
  const statusLabel = statuses.find((option) => option.value === status)?.label ?? "All";

  return (
    <DashboardCard className="flex flex-wrap items-center gap-x-6 gap-y-3 px-6 py-6 sm:py-5.5">
      <FilterSelect
        label="Category"
        value={category}
        options={categories}
        onValueChange={onCategoryChange}
      />
      <FilterSelect
        label="Status"
        value={status}
        options={statuses}
        onValueChange={onStatusChange}
        display={`Status: ${statusLabel}`}
      />
      {/* UI only: the Figma has no frame for the extra filters yet. */}
      <button
        type="button"
        onClick={() => toast("More filters aren't available yet")}
        className="ml-auto flex h-9 items-center gap-2 rounded-md px-2 text-base font-semibold tracking-wide text-action outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 dark:text-primary"
      >
        <FunnelSimpleIcon aria-hidden weight="bold" className="size-5" />
        More Filters
      </button>
    </DashboardCard>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onValueChange,
  display,
}: {
  label: string;
  value: string;
  options: Option[];
  onValueChange: (value: string) => void;
  /** What the closed button reads, when it isn't the option's own label. */
  display?: string;
}) {
  const selected = options.find((option) => option.value === value) ?? options[0];
  return (
    <Select value={selected.value} onValueChange={onValueChange}>
      <SelectTrigger
        aria-label={`${label}: ${selected.label}`}
        className="h-9.5 min-w-40 gap-6 rounded-md border-0 bg-container px-4 text-[17px] text-foreground data-[size=default]:h-9.5 dark:bg-muted [&_svg]:text-foreground [&_svg:not([class*='size-'])]:size-4.5"
      >
        <SelectValue>{display ?? selected.label}</SelectValue>
      </SelectTrigger>
      <SelectContent position="popper" align="start">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className="py-2 text-sm">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
