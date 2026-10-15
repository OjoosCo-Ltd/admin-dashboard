"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ExclamationMarkIcon,
  FlagIcon,
  InfoIcon,
  LockIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { Dialog as DialogPrimitive, RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { type ReactNode, useId } from "react";
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
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { RadioGroup } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Conversation } from "@/types/conversations";

const PRIORITIES = [
  { value: "routine", label: "Routine", Icon: InfoIcon, tone: "text-action dark:text-primary" },
  {
    value: "urgent",
    label: "Urgent",
    Icon: WarningIcon,
    tone: "text-caution dark:text-amber-300",
  },
  { value: "critical", label: "Critical", Icon: ExclamationMarkIcon, tone: "text-destructive" },
] as const;

/** ⚠️ PROVISIONAL: the Figma shows only Trust & Safety, so the other teams are placeholders. */
const TEAMS = [
  { value: "trust-safety", label: "Trust & Safety" },
  { value: "legal-compliance", label: "Legal & Compliance" },
  { value: "fraud-prevention", label: "Fraud Prevention" },
  { value: "community-support", label: "Community Support" },
  { value: "senior-moderators", label: "Senior Moderators" },
];

const schema = z.object({
  priority: z.enum(["routine", "urgent", "critical"]),
  team: z.string().min(1, "Choose the team to assign"),
  notes: z
    .string()
    .trim()
    .min(1, "Explain why this conversation needs a senior review")
    .max(1000, "Keep the notes under 1,000 characters"),
});

type FlagValues = z.infer<typeof schema>;

// The Figma's labels sit on an 18px line, 14px above their control.
const sectionLabel = "text-xs/4.5";
const control =
  "w-full rounded-md border-border/50 bg-background dark:border-input dark:bg-input/30";

/** Escalates a conversation to a team of senior moderators, with a priority and internal notes. */
export function FlagConversationDialog({
  conversation,
  open,
  onOpenChange,
  trigger,
  onCloseAutoFocus,
}: {
  conversation: Conversation;
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
        className="max-w-140 rounded-[12px] border border-border/50 dark:border-border"
      >
        <FlagForm conversation={conversation} />
      </ActionDialogContent>
    </Dialog>
  );
}

// Mounted only while the dialog is open, so every opening starts at Routine with blank notes.
function FlagForm({ conversation }: { conversation: Conversation }) {
  const id = useId();
  const form = useForm<FlagValues>({
    resolver: zodResolver(schema),
    defaultValues: { priority: "routine", team: "trust-safety", notes: "" },
  });

  // UI only: the backend has no route for escalating a conversation yet.
  const onSubmit = form.handleSubmit(() => toast("Flagging conversations isn't available yet"));

  return (
    <>
      <ActionDialogHeader
        icon={<FlagIcon weight="fill" />}
        iconClassName="rounded-md bg-caution-accent [&_svg]:size-5.5"
        title="Flag Conversation for Senior Review"
        description={`Escalate conversation #${conversation.id} for detailed audit`}
        // The Figma centers the row, and its 14px close glyph sits 28px in from the edge.
        className="items-center gap-3 pr-7"
        closeClassName="[&_svg]:size-5.5"
        descriptionClassName="text-[13px]/4.5"
      />

      <form method="post" noValidate onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
        <ActionDialogBody className="flex flex-col gap-7 pt-7">
          <Controller
            name="priority"
            control={form.control}
            render={({ field }) => (
              <div className="flex flex-col gap-3.5">
                <ActionDialogLabel id={`${id}-priority`} className={sectionLabel}>
                  Priority Level
                </ActionDialogLabel>
                {/* The Figma's cards hug their icons (70, 69 and 68px tall); these share one height. */}
                <RadioGroup
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                  aria-labelledby={`${id}-priority`}
                  className="grid-cols-3 gap-3"
                >
                  {PRIORITIES.map(({ value, label, Icon, tone }) => (
                    <RadioGroupPrimitive.Item
                      key={value}
                      value={value}
                      onBlur={field.onBlur}
                      className="flex flex-col items-center rounded-md border bg-background py-2.5 text-sm/6 font-medium transition-colors outline-none not-data-checked:hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 dark:border-input dark:bg-input/30 data-checked:border-action data-checked:bg-action-soft dark:data-checked:border-primary dark:data-checked:bg-primary/15"
                    >
                      <Icon aria-hidden weight="bold" className={`size-6 ${tone}`} />
                      {label}
                    </RadioGroupPrimitive.Item>
                  ))}
                </RadioGroup>
              </div>
            )}
          />

          <Controller
            name="team"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-3.5">
                <ActionDialogLabel asChild className={sectionLabel}>
                  <FieldLabel htmlFor={`${id}-team`}>Assigned Team</FieldLabel>
                </ActionDialogLabel>
                <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    ref={field.ref}
                    id={`${id}-team`}
                    onBlur={field.onBlur}
                    aria-invalid={fieldState.invalid}
                    className={`${control} pr-2.5 pl-6 data-[size=default]:h-12 [&>svg]:size-4.5 [&>svg]:text-[#6b7280] dark:[&>svg]:text-muted-foreground`}
                  >
                    <SelectValue placeholder="Select a team..." />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {TEAMS.map((team) => (
                      <SelectItem key={team.value} value={team.value} className="py-2">
                        {team.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            name="notes"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-3.5">
                <ActionDialogLabel asChild className={sectionLabel}>
                  <FieldLabel htmlFor={`${id}-notes`}>Internal Notes</FieldLabel>
                </ActionDialogLabel>
                <Textarea
                  {...field}
                  id={`${id}-notes`}
                  placeholder="Explain why this conversation needs further escalation..."
                  aria-invalid={fieldState.invalid}
                  aria-describedby={`${id}-notes-hint`}
                  // Keeps the Textarea's 16px below md, so iOS doesn't zoom in on focus.
                  className={`${control} min-h-32.5 resize-none p-6 placeholder:text-[#bfc8ce] dark:placeholder:text-muted-foreground`}
                />
                <FieldError errors={[fieldState.error]} />
                <p
                  id={`${id}-notes-hint`}
                  className="mt-1 flex items-center gap-px text-[11px]/3.5 font-medium text-outline dark:text-muted-foreground"
                >
                  <LockIcon aria-hidden weight="bold" className="size-3.25 shrink-0" />
                  Notes are only visible to internal administrative personnel.
                </p>
              </Field>
            )}
          />
        </ActionDialogBody>

        <ActionDialogFooter className="gap-6 border-t-0 py-6.25">
          <DialogPrimitive.Close asChild>
            <Button
              type="button"
              variant="ghost"
              className="h-12 rounded-[12px] px-6 text-xs font-semibold tracking-wider text-action hover:bg-muted-strong hover:text-action dark:text-primary dark:hover:bg-input/50 dark:hover:text-primary"
            >
              Cancel
            </Button>
          </DialogPrimitive.Close>
          <Button
            type="submit"
            className="h-12 gap-2.5 rounded-[12px] border-0 bg-action pr-6 pl-5.5 text-xs font-semibold tracking-wider text-white shadow-xs hover:bg-action/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
          >
            <FlagIcon aria-hidden weight="bold" className="size-3.25" />
            Flag Conversation
          </Button>
        </ActionDialogFooter>
      </form>
    </>
  );
}
