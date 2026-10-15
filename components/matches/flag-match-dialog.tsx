"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FlagIcon } from "@phosphor-icons/react";
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

const REASONS = [
  {
    value: "suspicious-activity",
    title: "Suspicious Activity",
    detail: "Unusual session duration or IP hopping",
  },
  {
    value: "reported-by-user",
    title: "Reported by User",
    detail: "Manual flag received from one or more participants",
  },
  {
    value: "low-engagement",
    title: "Low Engagement Pattern",
    detail: "Bot-like behavior detected in interaction logs",
  },
  {
    value: "algorithm-error",
    title: "Algorithm Error",
    detail: "Incompatible pairing or logic mismatch",
  },
] as const;

const schema = z.object({
  reason: z.enum(
    REASONS.map((reason) => reason.value),
    { error: "Pick a reason for the flag" },
  ),
  notes: z.string().trim().max(2000, "Keep the notes under 2,000 characters"),
});

type FlagValues = z.input<typeof schema>;

/** Sends a match to the compliance team with a reason and the moderator's notes. */
export function FlagMatchDialog({
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
        <FlagMatchForm match={match} />
      </ActionDialogContent>
    </Dialog>
  );
}

function FlagMatchForm({ match }: { match: MatchDetail }) {
  const formId = useId();
  const form = useForm<FlagValues>({
    resolver: zodResolver(schema),
    defaultValues: { reason: undefined, notes: "" },
  });

  // UI only: there's no flagging endpoint for matches yet.
  const onSubmit = form.handleSubmit(() =>
    toast(`Flagging match #${match.publicId} isn't available yet`),
  );

  return (
    <>
      <ActionDialogHeader
        title="Flag Match for Review"
        description="Provide details for the compliance team to investigate this match."
        className="border-b-0 px-10 pt-10 pb-0 max-sm:px-5 max-sm:pt-6"
        titleClassName="text-2xl leading-8 font-bold"
        descriptionClassName="mt-1.5 text-sm/5 text-muted-foreground"
      />
      <div className="min-h-0 flex-1 overflow-y-auto px-10 pt-8 pb-12 max-sm:px-5 max-sm:pb-8">
        <form id={formId} method="post" onSubmit={onSubmit} noValidate className="flex flex-col">
          <ActionDialogLabel id={`${formId}-reason`}>Reason for flagging</ActionDialogLabel>
          <Controller
            name="reason"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <RadioGroupPrimitive.Root
                  aria-labelledby={`${formId}-reason`}
                  aria-invalid={fieldState.invalid}
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  className="mt-4 flex flex-col gap-4"
                >
                  {REASONS.map((reason) => (
                    <RadioGroupPrimitive.Item
                      key={reason.value}
                      value={reason.value}
                      className="group/reason flex min-h-14 items-center gap-6 rounded-lg border bg-surface px-3.5 py-2 text-left transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-checked:border-primary data-checked:bg-accent/60"
                    >
                      <span
                        aria-hidden
                        className="flex size-4 shrink-0 items-center justify-center rounded-full border border-outline group-data-checked/reason:border-primary"
                      >
                        <span className="size-2 rounded-full bg-primary opacity-0 group-data-checked/reason:opacity-100" />
                      </span>
                      <span>
                        <span className="block text-sm leading-5 font-semibold">
                          {reason.title}
                        </span>
                        <span className="block text-[11px] leading-4 text-muted-foreground">
                          {reason.detail}
                        </span>
                      </span>
                    </RadioGroupPrimitive.Item>
                  ))}
                </RadioGroupPrimitive.Root>
                <FieldError errors={[fieldState.error]} className="mt-2" />
              </>
            )}
          />

          <ActionDialogLabel asChild className="mt-8">
            <label htmlFor={`${formId}-notes`}>Moderator notes</label>
          </ActionDialogLabel>
          <Controller
            name="notes"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <Textarea
                  {...field}
                  id={`${formId}-notes`}
                  placeholder="Describe the specific findings or context for this flag..."
                  aria-invalid={fieldState.invalid}
                  className="mt-3 min-h-31 resize-none rounded-lg bg-surface px-4.5 py-5 text-sm placeholder:text-outline md:text-sm"
                />
                <FieldError errors={[fieldState.error]} className="mt-2" />
              </>
            )}
          />
        </form>
      </div>
      <ActionDialogFooter className="px-10 max-sm:px-5">
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
          className="h-14 gap-3 rounded-[10px] px-8 text-base font-semibold tracking-wide max-sm:h-11 max-sm:flex-1 max-sm:text-base"
        >
          <FlagIcon aria-hidden weight="bold" className="size-5" />
          Flag Match
        </Button>
      </ActionDialogFooter>
    </>
  );
}
