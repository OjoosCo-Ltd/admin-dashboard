"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { InfoIcon, PaperPlaneRightIcon, WarningIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { Dialog as DialogPrimitive, RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { type ReactNode, useId } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { type ModerationSubject, subjectOf } from "@/components/conversations/participants";
import {
  ActionDialogBody,
  ActionDialogContent,
  ActionDialogFooter,
  ActionDialogHeader,
} from "@/components/dashboard/action-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel, FieldTitle } from "@/components/ui/field";
import { RadioGroup } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { initials } from "@/libs/utils";
import type { ConversationParticipant } from "@/types/conversations";

/** The Figma's prefilled message, which also stands in when no reason (or Other) is chosen. */
const generalTemplate = (name: string) =>
  `Hello ${name}, your recent activity has been flagged as a violation of our community standards regarding respectful communication. Please review our terms of service to avoid further account restrictions.`;

/**
 * ⚠️ PROVISIONAL: the Figma doesn't list the reasons and the backend has no
 * warning route yet, so these and their templates are placeholders.
 */
const REASONS: { value: string; label: string; template: (name: string) => string }[] = [
  {
    value: "harassment",
    label: "Harassment",
    template: (name) =>
      `Hello ${name}, your recent messages have been flagged as harassment, which violates our community standards. Please treat every member with respect to avoid further account restrictions.`,
  },
  {
    value: "inappropriate-language",
    label: "Inappropriate language",
    template: (name) =>
      `Hello ${name}, your recent messages have been flagged for inappropriate language, which violates our community standards regarding respectful communication. Please review our terms of service to avoid further account restrictions.`,
  },
  {
    value: "spam",
    label: "Spam or solicitation",
    template: (name) =>
      `Hello ${name}, your recent messages have been flagged as spam or solicitation. Promoting products, services or other platforms isn't allowed, so please review our terms of service to avoid further account restrictions.`,
  },
  {
    value: "contact-details",
    label: "Sharing contact details",
    template: (name) =>
      `Hello ${name}, your recent messages have been flagged for sharing contact details. To keep members safe, please keep conversations on Xparience and review our terms of service to avoid further account restrictions.`,
  },
  {
    value: "misleading-profile",
    label: "Misleading profile",
    template: (name) =>
      `Hello ${name}, your profile has been flagged as misleading. Please make sure your photos and details represent you accurately, and review our terms of service to avoid further account restrictions.`,
  },
  { value: "other", label: "Other", template: generalTemplate },
];

const SEVERITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
] as const;

const schema = z.object({
  reason: z.string().min(1, "Choose a reason for the warning"),
  severity: z.enum(["low", "medium", "high"]),
  message: z
    .string()
    .trim()
    .min(1, "Write the message the user will receive")
    .max(1000, "Keep the message under 1,000 characters"),
});

type WarnValues = z.infer<typeof schema>;

const label = "text-base/6 font-normal text-muted-foreground";
const cardLabel = "text-xs/3.5 text-muted-foreground uppercase";

/** The account status's color by standing: amber only when something is actually restricted. */
const STANDING_STYLES: Record<ConversationParticipant["standing"], string> = {
  good: "text-foreground",
  restricted: "text-caution dark:text-amber-300",
  suspended: "text-destructive",
};

/** Sends the flagged participant a formal warning, with a severity and a message they'll read. */
export function WarnUserDialog({
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
        className="max-w-150 rounded-[12px] border"
      >
        <WarnForm target={subjectOf(subject)} />
      </ActionDialogContent>
    </Dialog>
  );
}

// Mounted only while the dialog is open, so every opening starts from the template.
function WarnForm({ target }: { target: ConversationParticipant }) {
  const id = useId();
  const firstName = target.name.split(/\s+/)[0];
  const form = useForm<WarnValues>({
    resolver: zodResolver(schema),
    defaultValues: { reason: "", severity: "medium", message: generalTemplate(firstName) },
  });
  const reason = useWatch({ control: form.control, name: "reason" });

  const fillTemplate = () => {
    const template = REASONS.find((option) => option.value === reason)?.template ?? generalTemplate;
    // Validating can only clear an earlier error here: a template is never empty or too long.
    form.setValue("message", template(firstName), { shouldDirty: true, shouldValidate: true });
    form.setFocus("message");
  };

  // UI only: the backend has no route for warning a user yet.
  const onSubmit = form.handleSubmit(() => toast("Sending warnings isn't available yet"));

  return (
    <>
      <ActionDialogHeader
        icon={<WarningIcon weight="bold" />}
        iconClassName="size-8 rounded-md bg-caution-accent [&_svg]:size-5"
        title="Issue Official Warning"
        description={`Send ${target.name} a formal warning that goes on their record.`}
        descriptionClassName="sr-only"
        className="items-center gap-3 bg-container py-3 dark:bg-muted"
        // The Figma's close glyph is 14px and sits 3px above the title's center.
        closeClassName="-translate-y-0.75 hover:bg-background [&_svg]:size-5.5"
      />

      <form method="post" noValidate onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
        <ActionDialogBody>
          <TargetCard target={target} />

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <Controller
              name="reason"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                  <FieldLabel htmlFor={`${id}-reason`} className={label}>
                    Reason for Warning
                  </FieldLabel>
                  <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      ref={field.ref}
                      id={`${id}-reason`}
                      onBlur={field.onBlur}
                      aria-invalid={fieldState.invalid}
                      className="w-full rounded-md bg-background pr-2.5 pl-3 text-sm data-placeholder:text-foreground data-[size=default]:h-10 [&>svg]:text-[#6b7280] dark:[&>svg]:text-muted-foreground"
                    >
                      <SelectValue placeholder="Select reason..." />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {REASONS.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="py-2">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="severity"
              control={form.control}
              render={({ field }) => (
                <Field className="gap-1">
                  <FieldTitle id={`${id}-severity`} className={label}>
                    Warning Severity
                  </FieldTitle>
                  <RadioGroup
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                    aria-labelledby={`${id}-severity`}
                    className="grid h-10 grid-cols-3 gap-0 rounded-md border border-border/50 bg-muted px-1 py-1.25 dark:border-border"
                  >
                    {SEVERITIES.map((severity) => (
                      <RadioGroupPrimitive.Item
                        key={severity.value}
                        value={severity.value}
                        className="rounded-[5px] pb-0.5 text-[11px] font-bold text-muted-foreground uppercase transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-checked:bg-background data-checked:text-action data-checked:shadow-[0_1px_3px_rgb(0_0_0/0.06),0_0_1px_rgb(0_0_0/0.04)] dark:data-checked:text-primary"
                      >
                        {severity.label}
                      </RadioGroupPrimitive.Item>
                    ))}
                  </RadioGroup>
                </Field>
              )}
            />
          </div>

          <Controller
            name="message"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="mt-6 gap-1">
                <div className="flex items-baseline justify-between gap-4">
                  <FieldLabel htmlFor={`${id}-message`} className={label}>
                    Message to User
                  </FieldLabel>
                  <button
                    type="button"
                    onClick={fillTemplate}
                    className="rounded-sm text-xs font-bold text-action outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 dark:text-primary"
                  >
                    Use Template
                  </button>
                </div>
                <Textarea
                  {...field}
                  id={`${id}-message`}
                  aria-invalid={fieldState.invalid}
                  className="min-h-32 resize-none rounded-md bg-background p-3 md:text-sm"
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          {/* From sm, no right padding: the Figma's second line runs to 3px from the edge. */}
          <p className="mt-7.5 flex gap-2.5 rounded-md border border-border/30 bg-[#f6f7f7] py-3 pr-3 pl-2.75 text-[13px]/4.5 font-bold text-muted-foreground sm:pr-0 dark:border-border dark:bg-muted/50">
            <InfoIcon aria-hidden weight="bold" className="size-4.5 shrink-0" />
            <span>
              <strong className="font-bold text-foreground">Disclaimer:</strong> This warning will
              be recorded on the user&apos;s permanent record and may impact their eligibility for
              future premium features or community programs.
            </span>
          </p>
        </ActionDialogBody>

        {/* The Figma tops the two buttons, so the shorter Cancel sits above the other's center. */}
        <ActionDialogFooter className="items-start gap-3">
          <DialogPrimitive.Close asChild>
            <Button
              type="button"
              variant="ghost"
              className="h-12 rounded-lg px-6 text-base font-normal text-muted-foreground hover:bg-muted-strong dark:hover:bg-input/50"
            >
              Cancel
            </Button>
          </DialogPrimitive.Close>
          <Button
            type="submit"
            className="h-14 w-63 gap-1 rounded-[12px] bg-action bg-clip-border text-base font-normal text-white shadow-xs hover:bg-action/90 max-sm:h-12 max-sm:w-auto max-sm:flex-1 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
          >
            <PaperPlaneRightIcon aria-hidden weight="bold" className="size-4" />
            Send Warning
          </Button>
        </ActionDialogFooter>
      </form>
    </>
  );
}

/** Who gets the warning, and where their account stands. */
function TargetCard({ target }: { target: ConversationParticipant }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border/50 bg-muted p-3 dark:border-border">
      <Avatar className="size-10">
        {target.avatarUrl && <AvatarImage src={target.avatarUrl} alt="" />}
        <AvatarFallback className="bg-accent text-sm font-semibold text-primary">
          {initials(target.name)}
        </AvatarFallback>
      </Avatar>
      {/* On phones the status drops under the name. */}
      <dl className="grid min-w-0 flex-1 items-center gap-x-4 gap-y-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <dt className={cardLabel}>Target User</dt>
          <dd className="text-base/6">
            <span className="font-bold">{target.name}</span>{" "}
            <span className="text-xs text-muted-foreground">({target.handle})</span>
          </dd>
        </div>
        <div className="sm:text-right">
          <dt className={cardLabel}>Account Status</dt>
          <dd className={cn("text-xs/4 font-bold", STANDING_STYLES[target.standing])}>
            {target.accountStatus}
          </dd>
        </div>
      </dl>
    </div>
  );
}
