"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarBlankIcon,
  DownloadSimpleIcon,
  FileCsvIcon,
  FilePdfIcon,
  FileXlsIcon,
  type Icon,
} from "@phosphor-icons/react";
import { format, subDays } from "date-fns";
import { Dialog as DialogPrimitive, RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { type ReactNode, useId, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  ActionDialogBody,
  ActionDialogContent,
  ActionDialogFooter,
  ActionDialogHeader,
  ActionDialogLabel,
} from "@/components/dashboard/action-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const RANGES = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "custom", label: "Custom" },
] as const;

const FORMATS: { value: "csv" | "xlsx" | "pdf"; label: string; icon: Icon }[] = [
  { value: "csv", label: "CSV", icon: FileCsvIcon },
  { value: "xlsx", label: "XLSX", icon: FileXlsIcon },
  { value: "pdf", label: "PDF", icon: FilePdfIcon },
];

// Session and user IDs are always exported: without them the rows can't be traced.
const FIELDS = [
  { name: "sessionId", label: "Session ID", required: true },
  { name: "userId", label: "User ID", required: true },
  { name: "coachName", label: "Coach Name" },
  { name: "rating", label: "Rating" },
  { name: "revenue", label: "Revenue" },
  { name: "duration", label: "Session Duration" },
] as const;

const isoDay = (date: Date) => format(date, "yyyy-MM-dd");

const schema = z
  .object({
    range: z.enum(["today", "7d", "30d", "custom"]),
    start: z.string(),
    end: z.string(),
    format: z.enum(["csv", "xlsx", "pdf"]),
    sessionId: z.boolean(),
    userId: z.boolean(),
    coachName: z.boolean(),
    rating: z.boolean(),
    revenue: z.boolean(),
    duration: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.range !== "custom") return;
    if (!values.start)
      ctx.addIssue({ code: "custom", path: ["start"], message: "Pick a start date" });
    if (!values.end) ctx.addIssue({ code: "custom", path: ["end"], message: "Pick an end date" });
    // Both are yyyy-MM-dd, so they compare as strings.
    if (values.start && values.end && values.start > values.end) {
      ctx.addIssue({
        code: "custom",
        path: ["end"],
        message: "The end date can't be before the start date",
      });
    }
  });

type ExportValues = z.infer<typeof schema>;

const option =
  "rounded-md border border-[#eceff0] bg-background text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-checked:border-action data-checked:bg-action-soft data-checked:text-action dark:border-border dark:data-checked:border-primary dark:data-checked:bg-action/25 dark:data-checked:text-primary";

/** Which coaching sessions to export, as what file, with which columns. */
export function ExportSessionsDialog({ trigger }: { trigger: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <ActionDialogContent className="max-w-150">
        {/* Mounted only while open: each opening starts from the defaults. */}
        <ExportSessionsForm />
      </ActionDialogContent>
    </Dialog>
  );
}

function ExportSessionsForm() {
  const formId = useId();
  const [today] = useState(() => isoDay(new Date()));
  const form = useForm<ExportValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      range: "7d",
      start: "",
      end: today,
      format: "csv",
      sessionId: true,
      userId: true,
      coachName: true,
      rating: true,
      revenue: false,
      duration: false,
    },
  });
  const range = useWatch({ control: form.control, name: "range" });

  // UI only: there's no session export endpoint yet.
  const onSubmit = form.handleSubmit(() => toast("Session export isn't available yet"));

  return (
    <>
      <ActionDialogHeader
        title="Export Session Data"
        description="Configure your export parameters to generate a comprehensive report."
        className="items-center px-6 py-5"
        titleClassName="leading-7"
        descriptionClassName="mt-1 text-sm"
      />
      <ActionDialogBody className="px-6 pt-6 pb-6">
        <form
          id={formId}
          method="post"
          onSubmit={onSubmit}
          noValidate
          className="flex flex-col gap-6"
        >
          <section className="flex flex-col gap-3">
            <ActionDialogLabel id={`${formId}-range`} className="text-[13px] text-foreground">
              Date range
            </ActionDialogLabel>
            <Controller
              name="range"
              control={form.control}
              render={({ field }) => (
                <RadioGroupPrimitive.Root
                  aria-labelledby={`${formId}-range`}
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Custom starts from the last week, ready to adjust.
                    if (value === "custom" && !form.getValues("start")) {
                      form.setValue("start", isoDay(subDays(new Date(), 6)));
                    }
                  }}
                  orientation="horizontal"
                  className="grid grid-cols-2 gap-3.5 sm:grid-cols-4"
                >
                  {RANGES.map((choice) => (
                    <RadioGroupPrimitive.Item
                      key={choice.value}
                      value={choice.value}
                      className={`${option} flex h-10.5 items-center justify-center gap-2 text-[13px]`}
                    >
                      {choice.value === "custom" && (
                        <CalendarBlankIcon aria-hidden weight="bold" className="size-4.5" />
                      )}
                      {choice.label}
                    </RadioGroupPrimitive.Item>
                  ))}
                </RadioGroupPrimitive.Root>
              )}
            />
            {range === "custom" && (
              <div className="grid gap-4 sm:grid-cols-2">
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
                          className="text-[13px] text-muted-foreground"
                        >
                          {name === "start" ? "Start Date" : "End Date"}
                        </label>
                        <Input
                          {...field}
                          id={`${formId}-${name}`}
                          type="date"
                          max={today}
                          aria-invalid={fieldState.invalid}
                          className="h-10 rounded-md border-[#eceff0] px-3 text-base dark:border-border"
                        />
                        <FieldError errors={[fieldState.error]} />
                      </div>
                    )}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <ActionDialogLabel id={`${formId}-format`} className="text-[13px] text-foreground">
              Format
            </ActionDialogLabel>
            <Controller
              name="format"
              control={form.control}
              render={({ field }) => (
                <RadioGroupPrimitive.Root
                  aria-labelledby={`${formId}-format`}
                  value={field.value}
                  onValueChange={field.onChange}
                  orientation="horizontal"
                  className="grid grid-cols-3 gap-3.5"
                >
                  {FORMATS.map((choice) => (
                    <RadioGroupPrimitive.Item
                      key={choice.value}
                      value={choice.value}
                      className={`${option} flex h-17 flex-col items-center justify-center gap-1 text-[13px] data-checked:border-2`}
                    >
                      <choice.icon aria-hidden className="size-6" />
                      {choice.label}
                    </RadioGroupPrimitive.Item>
                  ))}
                </RadioGroupPrimitive.Root>
              )}
            />
          </section>

          <section className="flex flex-col gap-3">
            <ActionDialogLabel id={`${formId}-fields`} className="text-[13px] text-foreground">
              Data fields
            </ActionDialogLabel>
            <div
              role="group"
              aria-labelledby={`${formId}-fields`}
              className="grid gap-x-6 gap-y-4 sm:grid-cols-2"
            >
              {FIELDS.map((item) => (
                <Controller
                  key={item.name}
                  name={item.name}
                  control={form.control}
                  render={({ field }) => {
                    const required = "required" in item;
                    return (
                      <label
                        className={`flex h-8 items-center gap-4 text-[13px] ${required ? "text-[#797f82] dark:text-subtle-foreground" : "cursor-pointer"}`}
                      >
                        <Checkbox
                          checked={field.value}
                          disabled={required}
                          onCheckedChange={(checked) => field.onChange(checked === true)}
                          onBlur={field.onBlur}
                          ref={field.ref}
                          className="size-5 rounded-[4px] border-[#bcbfc0] bg-background disabled:opacity-100 data-checked:border-action data-checked:bg-action dark:data-checked:bg-action"
                        />
                        {item.label}
                        {required && " (Required)"}
                      </label>
                    );
                  }}
                />
              ))}
            </div>
          </section>
        </form>
      </ActionDialogBody>
      <ActionDialogFooter className="bg-background px-8 py-4.5 max-sm:px-4">
        <DialogPrimitive.Close className="h-14 rounded-lg border border-[#dbe1e5] bg-background px-6 text-base outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 max-sm:h-11 max-sm:px-4 max-sm:text-[15px] dark:border-border">
          Cancel
        </DialogPrimitive.Close>
        <button
          type="submit"
          form={formId}
          className="flex h-14 items-center justify-center gap-2 rounded-lg bg-action px-6 text-base whitespace-nowrap text-white outline-none hover:bg-action/90 focus-visible:ring-3 focus-visible:ring-ring/50 max-sm:h-11 max-sm:flex-1 max-sm:px-4 max-sm:text-[15px]"
        >
          <DownloadSimpleIcon aria-hidden weight="bold" className="size-5" />
          Download Report
        </button>
      </ActionDialogFooter>
    </>
  );
}
