"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BellRingingIcon, InfoIcon, WarningIcon } from "@phosphor-icons/react";
import { Dialog as DialogPrimitive, RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { type ReactNode, useId } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { type ModerationSubject, subjectOf } from "@/components/conversations/participants";
import {
  ActionDialogContent,
  ActionDialogFooter,
  ActionDialogLabel,
} from "@/components/dashboard/action-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { RadioGroup } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { ConversationParticipant } from "@/types/conversations";

const durationSchema = z.enum(["24h", "7d", "30d", "permanent"], { error: "Choose how long" });

type Duration = z.infer<typeof durationSchema>;

const DURATIONS: { value: Duration; label: string }[] = [
  { value: "24h", label: "24 Hours" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "permanent", label: "Permanent" },
];

const schema = z.object({
  duration: durationSchema,
  reason: z
    .string()
    .trim()
    .min(1, "Give a reason for the suspension")
    .min(10, "Write at least 10 characters")
    .max(1000, "Keep the reason under 1,000 characters"),
  notify: z.boolean(),
});

type SuspendValues = z.infer<typeof schema>;

const label = "text-xs/4.5 tracking-widest";

const PERMANENT_WARNING =
  "Critical Warning: This action will immediately terminate all active matches and conversations for this user. This process is irreversible once confirmed.";
// The Figma only shows Permanent chosen, so this softer copy for 24 hours to 30 days is ours.
const TIMED_WARNING =
  "Critical Warning: This action will immediately pause all active matches and conversations for this user until the suspension ends.";

/** Suspends the flagged participant for a set time or for good, with a reason for the log. */
export function SuspendAccountDialog({
  open,
  onOpenChange,
  trigger,
  onCloseAutoFocus,
  ...subject
}: ModerationSubject & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The button that opens it. Focus returns there on close. */
  trigger?: ReactNode;
  /** Where focus goes back to when the dialog was opened without a trigger. */
  onCloseAutoFocus?: (event: Event) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <ActionDialogContent
        onCloseAutoFocus={onCloseAutoFocus}
        className="max-w-140 rounded-[16px] border"
      >
        <SuspendForm target={subjectOf(subject)} />
      </ActionDialogContent>
    </Dialog>
  );
}

// Mounted only while the dialog is open, so every opening starts with nothing chosen.
function SuspendForm({ target }: { target: ConversationParticipant }) {
  const id = useId();
  const form = useForm<SuspendValues>({
    resolver: zodResolver(schema),
    // No duration until the moderator picks one: a preselected suspension is too easy to confirm.
    defaultValues: { reason: "", notify: true },
  });
  const duration = useWatch({ control: form.control, name: "duration" });

  // UI only: the backend has no route for suspending a user yet.
  const onSubmit = form.handleSubmit(() => toast("Suspending accounts isn't available yet"));

  return (
    <>
      {/* Not ActionDialogHeader: this Figma has no close button (Cancel and Escape close it). */}
      <div className="flex shrink-0 items-center gap-6 border-b px-16 py-6 max-sm:gap-4 max-sm:px-6">
        <span
          aria-hidden
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-destructive-container text-destructive dark:bg-destructive/20"
        >
          <WarningIcon weight="fill" className="size-7.25" />
        </span>
        <div className="min-w-0 flex-1">
          <DialogPrimitive.Title className="text-2xl/7.5 font-semibold tracking-[-0.01em] max-sm:text-xl">
            Suspend User Account
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="text-sm/5 text-muted-foreground">
            Applying enforcement on <span className="text-foreground">{target.name}</span>
          </DialogPrimitive.Description>
        </div>
      </div>

      <form method="post" noValidate onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-16 pt-11 pb-4 max-sm:px-6">
          <Controller
            name="duration"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-3.5">
                <ActionDialogLabel id={`${id}-duration`} className={label}>
                  Suspension Duration
                </ActionDialogLabel>
                <RadioGroup
                  name={field.name}
                  // "" keeps the group controlled while nothing is chosen.
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  aria-labelledby={`${id}-duration`}
                  aria-invalid={fieldState.invalid}
                  className="grid-cols-2 gap-1 sm:grid-cols-4"
                >
                  {DURATIONS.map((option, index) => (
                    <RadioGroupPrimitive.Item
                      key={option.value}
                      // Focused on an invalid submit, when nothing is chosen yet.
                      ref={index === 0 ? field.ref : undefined}
                      value={option.value}
                      onBlur={field.onBlur}
                      // Hover is unchecked-only: data-checked's :where() would lose to it.
                      className="h-9.5 rounded-md border bg-background text-sm font-medium text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 data-checked:border-destructive data-checked:bg-destructive-soft data-checked:font-bold data-checked:text-destructive data-checked:ring-2 data-checked:ring-destructive/20 dark:data-checked:bg-destructive/15 data-unchecked:hover:bg-muted"
                    >
                      {option.label}
                    </RadioGroupPrimitive.Item>
                  ))}
                </RadioGroup>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            name="reason"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="mt-11 gap-3.5">
                <ActionDialogLabel asChild className={label}>
                  <FieldLabel htmlFor={`${id}-reason`}>Reason for Suspension</FieldLabel>
                </ActionDialogLabel>
                <Textarea
                  {...field}
                  id={`${id}-reason`}
                  placeholder="Enter internal audit notes and specific policy violations..."
                  aria-invalid={fieldState.invalid}
                  className="max-h-60 min-h-27.5 resize-none rounded-[12px] bg-muted p-6 placeholder:text-[#bfc8ce] focus-visible:border-action focus-visible:ring-2 focus-visible:ring-action md:text-sm dark:placeholder:text-muted-foreground dark:focus-visible:border-primary dark:focus-visible:ring-primary"
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            name="notify"
            control={form.control}
            render={({ field }) => (
              // The label stretches over the card, so any of it flips the switch.
              <Field
                orientation="horizontal"
                className="relative mt-11.5 gap-2.5 rounded-[12px] border border-border/30 bg-muted py-6 pr-6 pl-5.5 max-sm:p-4 dark:border-border"
              >
                <BellRingingIcon
                  aria-hidden
                  weight="bold"
                  className="size-6 shrink-0 text-action dark:text-primary"
                />
                <div className="min-w-0 flex-1">
                  <FieldLabel
                    htmlFor={`${id}-notify`}
                    className="cursor-pointer text-sm/5 font-semibold after:absolute after:inset-0 after:rounded-[12px]"
                  >
                    Notify user via email and in-app message
                  </FieldLabel>
                  <FieldDescription id={`${id}-notify-hint`} className="text-[13px]/4.5">
                    User will receive formal notice of the decision.
                  </FieldDescription>
                </div>
                <Switch
                  ref={field.ref}
                  id={`${id}-notify`}
                  name={field.name}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  onBlur={field.onBlur}
                  aria-describedby={`${id}-notify-hint`}
                  className="relative z-10 px-px data-[size=default]:h-6 data-[size=default]:w-11 *:data-[slot=switch-thumb]:size-5 data-checked:bg-action *:data-[slot=switch-thumb]:data-checked:translate-x-5 dark:data-checked:bg-primary"
                />
              </Field>
            )}
          />

          {/*
            Announced when the choice turns the suspension permanent, or back. The red bar is a
            clipped strip, not border-l-4, whose inner edge would curve into the corners.
          */}
          <p
            aria-live="polite"
            className="relative mt-10 flex gap-2.5 overflow-hidden rounded-[12px] border border-l-0 border-destructive/20 bg-destructive/5 py-3 pr-6 pl-3.5 text-[13px]/[21.5px] font-bold text-destructive/90 before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-destructive dark:bg-destructive/10 dark:text-red-200"
          >
            <InfoIcon
              aria-hidden
              weight="bold"
              className="-mt-0.5 size-5 shrink-0 text-destructive"
            />
            {duration === "permanent" ? PERMANENT_WARNING : TIMED_WARNING}
          </p>
        </div>

        <ActionDialogFooter className="gap-6 border-t-0 px-16 max-sm:flex-nowrap max-sm:px-6">
          <DialogPrimitive.Close asChild>
            <Button
              type="button"
              variant="ghost"
              className="h-14 rounded-[12px] border-0 px-6 text-base font-semibold text-muted-foreground hover:bg-muted-strong max-sm:px-4 dark:hover:bg-input/50"
            >
              Cancel
            </Button>
          </DialogPrimitive.Close>
          <Button
            type="submit"
            className="h-14 rounded-[12px] border-0 bg-destructive px-6 text-base font-semibold text-white shadow-[0_8px_16px_-8px_rgb(186_26_26/0.5)] hover:bg-destructive/90 max-sm:flex-1 max-sm:px-4 dark:bg-destructive/60 dark:shadow-none dark:hover:bg-destructive/70"
          >
            Confirm Suspension
          </Button>
        </ActionDialogFooter>
      </form>
    </>
  );
}
