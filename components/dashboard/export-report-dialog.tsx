"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  DownloadSimpleIcon,
  FileCsvIcon,
  FilePdfIcon,
  FileTextIcon,
  TrendUpIcon,
  type Icon,
} from "@phosphor-icons/react";
import { format, subDays } from "date-fns";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { useId, useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  ActionDialogBody,
  ActionDialogContent,
  ActionDialogFooter,
  ActionDialogHeader,
  ActionDialogLabel,
} from "@/components/dashboard/action-dialog";
import { GavelIcon, PaymentsIcon } from "@/components/icons/app-icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const FORMATS: { value: "pdf" | "csv" | "excel"; label: string; icon: Icon }[] = [
  { value: "pdf", label: "PDF", icon: FilePdfIcon },
  { value: "csv", label: "CSV", icon: FileCsvIcon },
  { value: "excel", label: "Excel", icon: FileTextIcon },
];

// As in the header's range picker, each preset ends today and the day counts include it.
const RANGES = {
  today: { label: "Today", days: 1 },
  "7d": { label: "Last 7 Days", days: 7 },
  "30d": { label: "Last 30 Days", days: 30 },
  custom: { label: "Custom", days: null },
} as const;

type Range = keyof typeof RANGES;

const isRange = (value: string): value is Range => Object.hasOwn(RANGES, value);

const CATEGORIES: {
  name: "userGrowth" | "revenue" | "trustSafety";
  title: string;
  description: string;
  icon: ReactNode;
  tile: string;
}[] = [
  {
    name: "userGrowth",
    title: "User Growth",
    description: "New signups, churn rate, active sessions",
    icon: <TrendUpIcon weight="bold" />,
    tile: "bg-info-soft text-action [&_svg]:size-6",
  },
  {
    name: "revenue",
    title: "Revenue",
    description: "Subscriptions, micro-transactions, refunds",
    icon: <PaymentsIcon />,
    tile: "bg-[#e2d8cd] text-[#854f0f] [&_svg]:h-4.5 [&_svg]:w-auto",
  },
  {
    name: "trustSafety",
    title: "Trust & Safety",
    description: "Reports, bans, moderation activity",
    icon: <GavelIcon />,
    tile: "bg-[#ffdad6] text-destructive [&_svg]:h-5 [&_svg]:w-auto",
  },
];

const isoDay = (date: Date) => format(date, "yyyy-MM-dd");

const schema = z
  .object({
    format: z.enum(["pdf", "csv", "excel"]),
    range: z.enum(["today", "7d", "30d", "custom"]),
    start: z.string().min(1, "Pick a start date"),
    end: z.string().min(1, "Pick an end date"),
    userGrowth: z.boolean(),
    revenue: z.boolean(),
    trustSafety: z.boolean(),
  })
  // Both are yyyy-MM-dd, so they compare as strings.
  .refine((values) => !values.start || !values.end || values.start <= values.end, {
    message: "The end date can't be before the start date",
    path: ["end"],
  })
  .refine((values) => !values.end || values.end <= isoDay(new Date()), {
    message: "The end date can't be in the future",
    path: ["end"],
  })
  .refine((values) => values.userGrowth || values.revenue || values.trustSafety, {
    message: "Include at least one category",
    path: ["userGrowth"],
  });

type ExportValues = z.infer<typeof schema>;

/** Export options for a report: file format, period and the sections to include. */
export function ExportReportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ActionDialogContent className="max-w-144">
        {/* Mounted only while open: the dates are the viewer's, and each opening starts over. */}
        <ExportReportForm onClose={() => onOpenChange(false)} />
      </ActionDialogContent>
    </Dialog>
  );
}

function ExportReportForm({ onClose }: { onClose: () => void }) {
  const formId = useId();
  const [today] = useState(() => isoDay(new Date()));
  const form = useForm<ExportValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      format: "pdf",
      range: "7d",
      start: isoDay(subDays(new Date(), RANGES["7d"].days - 1)),
      end: today,
      userGrowth: true,
      revenue: true,
      trustSafety: false,
    },
  });

  const pickRange = (range: Range) => {
    form.setValue("range", range);
    const { days } = RANGES[range];
    if (days === null) return;
    form.setValue("start", isoDay(subDays(new Date(), days - 1)), { shouldValidate: true });
    form.setValue("end", today, { shouldValidate: true });
  };

  // UI only: there's no report export endpoint yet.
  const onSubmit = form.handleSubmit(() => toast("Report export isn't available yet"));

  return (
    <>
      <ActionDialogHeader
        title="Export Detailed Report"
        description="Configure your reporting parameters for the selected period."
        className="items-center px-10 py-10"
        titleClassName="text-2xl leading-8"
        descriptionClassName="mt-1 text-[15px] leading-5.5"
      />
      <ActionDialogBody className="px-10 pt-10 pb-8">
        <form
          id={formId}
          method="post"
          onSubmit={onSubmit}
          noValidate
          className="flex flex-col gap-10"
        >
          <section className="flex flex-col gap-3">
            <ActionDialogLabel id={`${formId}-format`}>Select format</ActionDialogLabel>
            <Controller
              name="format"
              control={form.control}
              render={({ field }) => (
                <RadioGroupPrimitive.Root
                  aria-labelledby={`${formId}-format`}
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid grid-cols-3 gap-3"
                >
                  {FORMATS.map((option) => (
                    <RadioGroupPrimitive.Item
                      key={option.value}
                      value={option.value}
                      className="flex h-18 items-center justify-center gap-1 rounded-[10px] border bg-muted text-[17px] text-foreground transition-colors outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 max-sm:flex-col max-sm:gap-0.5 max-sm:text-[15px] data-checked:border-action data-checked:bg-action/8 data-checked:text-action"
                    >
                      <option.icon aria-hidden className="size-6 shrink-0" />
                      {option.label}
                    </RadioGroupPrimitive.Item>
                  ))}
                </RadioGroupPrimitive.Root>
              )}
            />
          </section>

          <section className="flex flex-col gap-3">
            <ActionDialogLabel id={`${formId}-range`}>Date range</ActionDialogLabel>
            <Controller
              name="range"
              control={form.control}
              render={({ field }) => (
                <RadioGroupPrimitive.Root
                  aria-labelledby={`${formId}-range`}
                  value={field.value}
                  onValueChange={(value) => isRange(value) && pickRange(value)}
                  orientation="horizontal"
                  className="flex flex-wrap gap-1.5"
                >
                  {Object.entries(RANGES).map(([value, { label }]) => (
                    <RadioGroupPrimitive.Item
                      key={value}
                      value={value}
                      className="h-8.5 rounded-full border bg-muted px-6 text-sm font-medium transition-colors outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 data-checked:border-action data-checked:bg-action data-checked:text-white"
                    >
                      {label}
                    </RadioGroupPrimitive.Item>
                  ))}
                </RadioGroupPrimitive.Root>
              )}
            />
            <div className="mt-3 grid gap-6 sm:grid-cols-2">
              {(["start", "end"] as const).map((name) => (
                <Controller
                  key={name}
                  name={name}
                  control={form.control}
                  // The order error sits on End Date, so a new start date rechecks it.
                  rules={{ deps: name === "start" ? ["end"] : [] }}
                  render={({ field, fieldState }) => (
                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor={`${formId}-${name}`}
                        className="px-1 text-[13px] text-muted-foreground"
                      >
                        {name === "start" ? "Start Date" : "End Date"}
                      </label>
                      <Input
                        {...field}
                        onChange={(event) => {
                          field.onChange(event);
                          form.setValue("range", "custom");
                        }}
                        id={`${formId}-${name}`}
                        type="date"
                        max={today}
                        aria-invalid={fieldState.invalid}
                        className="h-10 rounded-md border-0 bg-muted px-4 text-base"
                      />
                      <FieldError errors={[fieldState.error]} />
                    </div>
                  )}
                />
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <ActionDialogLabel id={`${formId}-categories`}>
              Include data categories
            </ActionDialogLabel>
            <div
              role="group"
              aria-labelledby={`${formId}-categories`}
              className="flex flex-col gap-1.5"
            >
              {CATEGORIES.map((category) => (
                <Controller
                  key={category.name}
                  name={category.name}
                  control={form.control}
                  render={({ field }) => (
                    <CategoryRow
                      icon={category.icon}
                      tile={category.tile}
                      title={category.title}
                      description={category.description}
                    >
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked === true);
                          // Clears "at least one" as soon as any box is ticked again.
                          void form.trigger("userGrowth");
                        }}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        className="size-5 rounded-[4px] border-outline bg-background data-checked:border-action data-checked:bg-action dark:data-checked:bg-action"
                      />
                    </CategoryRow>
                  )}
                />
              ))}
              <FieldError errors={[form.formState.errors.userGrowth]} />
            </div>
          </section>
        </form>
      </ActionDialogBody>
      <ActionDialogFooter className="px-10 py-10">
        <Button
          variant="ghost"
          onClick={onClose}
          className="h-14 rounded-[10px] px-12 text-[17px] font-normal text-muted-foreground hover:bg-background/70 max-sm:h-11 max-sm:px-4 max-sm:text-[15px]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form={formId}
          className="h-14 w-67 gap-1.5 rounded-[10px] bg-action text-[17px] font-normal text-white hover:bg-action/90 max-sm:h-11 max-sm:w-auto max-sm:flex-1 max-sm:text-[15px]"
        >
          Generate Report
          <DownloadSimpleIcon aria-hidden weight="bold" className="size-4.5" />
        </Button>
      </ActionDialogFooter>
    </>
  );
}

function CategoryRow({
  icon,
  tile,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  tile: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <label className="flex min-h-22 cursor-pointer items-center gap-6 rounded-xl bg-muted px-6 py-4 max-sm:gap-4 max-sm:px-4">
      <span
        aria-hidden
        className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${tile}`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[17px] leading-6">{title}</span>
        <span className="block text-[13px] leading-5 text-muted-foreground">{description}</span>
      </span>
      {children}
    </label>
  );
}
