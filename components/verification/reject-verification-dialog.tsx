"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { InfoIcon, WarningIcon, XIcon } from "@phosphor-icons/react";
import { Dialog as DialogPrimitive } from "radix-ui";
import type { ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { ActionDialogContent } from "@/components/dashboard/action-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

/**
 * ⚠️ PROVISIONAL: the backend takes a free-text `rejectionReason` and the
 * Figma doesn't list the options, so these are placeholders.
 */
const REJECTION_REASONS = [
  { value: "unreadable", label: "Document is blurry or unreadable" },
  { value: "expired", label: "Document has expired" },
  { value: "face-mismatch", label: "Selfie doesn't match the document" },
  { value: "tampered", label: "Document looks altered or forged" },
  { value: "unsupported", label: "Document type isn't accepted" },
  { value: "details-mismatch", label: "Details don't match the profile" },
  { value: "other", label: "Other" },
];

const schema = z
  .object({
    reason: z.string().min(1, "Choose a reason for the rejection"),
    notes: z.string().trim().max(1000, "Keep the notes under 1,000 characters"),
  })
  .refine((values) => values.reason !== "other" || values.notes.length > 0, {
    message: "Describe the issue when the reason is Other",
    path: ["notes"],
  });

type RejectValues = z.infer<typeof schema>;

const label = "text-[13px] font-semibold tracking-wide text-muted-foreground";
const control =
  "w-full rounded-lg bg-muted md:text-sm dark:bg-input/30 aria-invalid:border-destructive";

/** Confirms a rejection with a reason and notes for the internal log. */
export function RejectVerificationDialog({
  name,
  open,
  onOpenChange,
  trigger,
}: {
  /** Whose verification this is. */
  name: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The button that opens it. Focus returns there on close. */
  trigger?: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <ActionDialogContent className="max-w-lg rounded-[12px] border">
        <RejectForm name={name} onCancel={() => onOpenChange(false)} />
      </ActionDialogContent>
    </Dialog>
  );
}

// Mounted only while the dialog is open, so every opening starts blank.
function RejectForm({ name, onCancel }: { name: string; onCancel: () => void }) {
  const form = useForm<RejectValues>({
    resolver: zodResolver(schema),
    defaultValues: { reason: "", notes: "" },
  });

  // UI only: the decision doesn't reach /verification/admin/{userId}/review yet.
  const onSubmit = form.handleSubmit(() => toast("Rejecting a verification isn't available yet"));

  return (
    <>
      <div className="flex shrink-0 items-center gap-3.5 border-b bg-muted px-6 py-6">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive-container text-destructive dark:bg-destructive/20"
        >
          <WarningIcon weight="bold" className="size-5.5" />
        </span>
        <DialogPrimitive.Title className="min-w-0 flex-1 text-xl/7 font-semibold">
          Reject Identity Verification
        </DialogPrimitive.Title>
        <DialogPrimitive.Close className="-m-1 rounded-md p-1 text-muted-foreground transition-colors outline-none hover:bg-background hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50">
          <XIcon aria-hidden weight="bold" className="size-6" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </div>

      <form method="post" noValidate onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <DialogPrimitive.Description className="text-base/6 text-foreground">
            Are you sure you want to reject {name}&rsquo;s identity verification?
          </DialogPrimitive.Description>

          <div className="mt-11 flex flex-col gap-7">
            <Controller
              name="reason"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-3">
                  <FieldLabel htmlFor="rejection-reason" className={label}>
                    Reason for Rejection
                  </FieldLabel>
                  <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      ref={field.ref}
                      id="rejection-reason"
                      onBlur={field.onBlur}
                      aria-invalid={fieldState.invalid}
                      className={`${control} h-11.5 px-4 data-placeholder:text-foreground data-[size=default]:h-11.5`}
                    >
                      <SelectValue placeholder="Select a reason..." />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {REJECTION_REASONS.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value} className="py-2">
                          {reason.label}
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
                <Field data-invalid={fieldState.invalid} className="gap-3">
                  <FieldLabel htmlFor="rejection-notes" className={label}>
                    Additional Moderator Notes
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="rejection-notes"
                    placeholder="Describe the specific issues for the internal log..."
                    aria-invalid={fieldState.invalid}
                    className={`${control} min-h-26.5 resize-none px-4 py-3 placeholder:text-[#6b7280]`}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </div>

          <p className="mt-7.5 flex gap-3 rounded-lg bg-destructive-soft p-3 text-[13px]/4.5 text-[#93000a] dark:bg-destructive/15 dark:text-red-200">
            <InfoIcon aria-hidden weight="bold" className="size-4.5 shrink-0 text-destructive" />
            The user will be notified via email that their verification was rejected and will be
            asked to re-submit if eligible.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap justify-end gap-3 px-6 pt-6 pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-14 rounded-lg bg-background px-6 text-[17px] font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-14 rounded-lg bg-destructive px-6 text-[17px] font-semibold text-white hover:bg-destructive/90"
          >
            Confirm Rejection
          </Button>
        </div>
      </form>
    </>
  );
}
