"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarBlankIcon,
  CalendarDotsIcon,
  InfinityIcon,
  InfoIcon,
  ProhibitIcon,
  type Icon,
} from "@phosphor-icons/react";
import { Dialog as DialogPrimitive, RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { type ReactNode, useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  ActionDialogContent,
  ActionDialogFooter,
  ActionDialogHeader,
  ActionDialogLabel,
} from "@/components/dashboard/action-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import type { MatchDetail } from "@/types/matches";

const DURATIONS: { value: "permanent" | "90d" | "1y"; label: string; icon: Icon }[] = [
  { value: "permanent", label: "Permanent", icon: InfinityIcon },
  { value: "90d", label: "90 Days", icon: CalendarBlankIcon },
  { value: "1y", label: "1 Year", icon: CalendarDotsIcon },
];

const schema = z.object({
  duration: z.enum(["permanent", "90d", "1y"]),
  reason: z.string().trim().min(1, "Note why, for the audit trail"),
});

type ExcludeValues = z.infer<typeof schema>;

/** Stops the engine from ever pairing these two again, for a while or for good. */
export function ExcludeMatchingDialog({
  match,
  open,
  onOpenChange,
  trigger,
}: {
  match: MatchDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The button that opens it, so focus returns there when it closes. */
  trigger?: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <ActionDialogContent className="max-w-130">
        {/* Mounted only while open, so every opening starts a fresh form. */}
        <ExcludeMatchingForm match={match} />
      </ActionDialogContent>
    </Dialog>
  );
}

function ExcludeMatchingForm({ match }: { match: MatchDetail }) {
  const formId = useId();
  const form = useForm<ExcludeValues>({
    resolver: zodResolver(schema),
    defaultValues: { duration: "permanent", reason: "" },
  });

  // UI only: there's no exclusion endpoint yet.
  const onSubmit = form.handleSubmit(() =>
    toast(`Excluding match #${match.publicId} isn't available yet`),
  );

  return (
    <>
      <ActionDialogHeader
        title={
          <span className="flex items-center gap-3">
            <ProhibitIcon aria-hidden weight="fill" className="size-7 shrink-0" />
            Exclude Future Matching
          </span>
        }
        description={
          <span className="sr-only">
            Stop {match.users[0].name} and {match.users[1].name} from being matched again.
          </span>
        }
        className="items-center py-6"
        titleClassName="text-xl leading-7 font-semibold text-destructive"
      />
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-6 pb-8">
        <form id={formId} method="post" onSubmit={onSubmit} noValidate className="flex flex-col">
          <p className="text-sm/5 text-muted-foreground">
            By confirming this action, the AI engine will ensure this specific pair will never be
            suggested to each other again. This action is tracked internally for quality assurance
            and compliance purposes.
          </p>

          <ActionDialogLabel id={`${formId}-duration`} className="mt-8">
            Exclusion duration
          </ActionDialogLabel>
          <Controller
            name="duration"
            control={form.control}
            render={({ field }) => (
              <RadioGroupPrimitive.Root
                aria-labelledby={`${formId}-duration`}
                value={field.value}
                onValueChange={field.onChange}
                orientation="horizontal"
                className="mt-4 grid grid-cols-3 gap-3"
              >
                {DURATIONS.map((duration) => (
                  <RadioGroupPrimitive.Item
                    key={duration.value}
                    value={duration.value}
                    className="flex h-19 flex-col items-center justify-center gap-1.5 rounded-lg border text-xs font-semibold tracking-wide text-muted-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-checked:border-2 data-checked:border-action data-checked:bg-action/5 data-checked:text-action dark:data-checked:border-primary dark:data-checked:text-primary"
                  >
                    <duration.icon aria-hidden weight="bold" className="size-6" />
                    {duration.label}
                  </RadioGroupPrimitive.Item>
                ))}
              </RadioGroupPrimitive.Root>
            )}
          />

          <ActionDialogLabel asChild className="mt-8">
            <label htmlFor={`${formId}-reason`}>Reason for internal tracking</label>
          </ActionDialogLabel>
          <Controller
            name="reason"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <Textarea
                  {...field}
                  id={`${formId}-reason`}
                  placeholder="e.g., Conflict of interest, previous project friction, or user request..."
                  aria-invalid={fieldState.invalid}
                  className="mt-4 min-h-21 resize-none rounded-md bg-muted px-4 py-3 text-sm placeholder:text-[#6b7280] md:text-sm"
                />
                <FieldError errors={[fieldState.error]} className="mt-2" />
              </>
            )}
          />

          <p className="mt-7.5 flex gap-3 rounded-lg bg-[#fff5ec] px-4 py-3 text-[13px]/5 text-[#6a3b00] dark:bg-caution/20 dark:text-[#e9b97c]">
            <InfoIcon aria-hidden weight="fill" className="size-5.5 shrink-0" />
            This action cannot be undone automatically. Manual intervention by a Senior
            Administrator is required to reverse an exclusion.
          </p>
        </form>
      </div>
      <ActionDialogFooter>
        <DialogPrimitive.Close asChild>
          <Button
            variant="outline"
            className="h-14 rounded-[10px] border-muted-foreground bg-background px-8 text-base font-semibold tracking-wide max-sm:h-11 max-sm:flex-1 max-sm:text-base"
          >
            Cancel
          </Button>
        </DialogPrimitive.Close>
        <Button
          type="submit"
          form={formId}
          className="h-14 rounded-[10px] px-8 text-base font-semibold tracking-wide max-sm:h-11 max-sm:flex-1 max-sm:text-base"
        >
          Confirm Exclusion
        </Button>
      </ActionDialogFooter>
    </>
  );
}
