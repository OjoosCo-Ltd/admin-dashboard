"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { InfoIcon, XIcon } from "@phosphor-icons/react";
import { Dialog as DialogPrimitive } from "radix-ui";
import type { ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { ActionDialogContent } from "@/components/dashboard/action-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ResubmissionDocument, VerificationCase } from "@/types/verification";

const DOCUMENTS: { id: ResubmissionDocument; label: string }[] = [
  { id: "id-front", label: "Clear Government ID (Front)" },
  { id: "id-back", label: "Clear Government ID (Back)" },
  { id: "selfie", label: "New Liveness Selfie" },
];

const schema = z.object({
  documents: z
    .array(z.enum(["id-front", "id-back", "selfie"]))
    .min(1, "Choose at least one document to request"),
  message: z.string().trim().max(1000, "Keep the message under 1,000 characters"),
});

type RequestValues = z.infer<typeof schema>;

const sectionLabel = "text-xs font-semibold tracking-wider text-muted-foreground uppercase";

/** Asks the user to upload documents again. Those the checks flagged start ticked. */
export function RequestDocumentsDialog({
  verification,
  open,
  onOpenChange,
  trigger,
}: {
  verification: VerificationCase;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The button that opens it. Focus returns there on close. */
  trigger?: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <ActionDialogContent className="max-w-140 rounded-[16px]">
        <RequestForm verification={verification} onCancel={() => onOpenChange(false)} />
      </ActionDialogContent>
    </Dialog>
  );
}

// Mounted only while the dialog is open, so every opening starts from the flagged documents.
function RequestForm({
  verification,
  onCancel,
}: {
  verification: VerificationCase;
  onCancel: () => void;
}) {
  const issues = verification.documentIssues ?? {};
  const form = useForm<RequestValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      documents: DOCUMENTS.filter((document) => issues[document.id]).map(({ id }) => id),
      message: "",
    },
  });

  // UI only: the backend has no route for requesting new documents yet.
  const onSubmit = form.handleSubmit(() => toast("Requesting new documents isn't available yet"));

  return (
    <>
      <div className="flex shrink-0 items-start gap-4 px-6 pt-10 sm:px-16">
        <div className="min-w-0 flex-1">
          <DialogPrimitive.Title className="text-2xl/8 font-semibold">
            Request New Documents
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-1 text-[15px]/5 text-muted-foreground">
            Select which documents {verification.name} needs to resubmit.
          </DialogPrimitive.Description>
        </div>
        <DialogPrimitive.Close className="mt-1 -mr-1 rounded-md p-1 text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50">
          <XIcon aria-hidden weight="bold" className="size-6" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </div>

      <form method="post" noValidate onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-7 pb-10 sm:px-16">
          <Controller
            name="documents"
            control={form.control}
            render={({ field, fieldState }) => (
              <FieldSet className="gap-0">
                <FieldLegend variant="label" className={`mb-4 ${sectionLabel}`}>
                  Required Resubmissions
                </FieldLegend>
                <div className="flex flex-col gap-2">
                  {DOCUMENTS.map((document, index) => {
                    const id = `resubmit-${document.id}`;
                    const issue = issues[document.id];
                    return (
                      // The label stretches over the whole card, so any of it toggles the box.
                      <div
                        key={document.id}
                        className="relative flex items-center gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/50 has-focus-visible:border-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/50 dark:border-border"
                      >
                        <Checkbox
                          // The first box takes RHF's ref, so an empty choice focuses it.
                          ref={index === 0 ? field.ref : undefined}
                          id={id}
                          checked={field.value.includes(document.id)}
                          onCheckedChange={(checked) =>
                            field.onChange(
                              checked
                                ? [...field.value, document.id]
                                : field.value.filter((value) => value !== document.id),
                            )
                          }
                          onBlur={field.onBlur}
                          aria-invalid={fieldState.invalid}
                          aria-describedby={issue ? `${id}-issue` : undefined}
                          className="size-5.5 data-checked:border-action data-checked:bg-action dark:data-checked:border-primary dark:data-checked:bg-primary [&_[data-slot=checkbox-indicator]>svg]:size-4"
                        />
                        <div className="min-w-0 flex-1">
                          <label
                            htmlFor={id}
                            className="block cursor-pointer text-base/6 font-semibold after:absolute after:inset-0 after:rounded-xl"
                          >
                            {document.label}
                          </label>
                          {issue && (
                            <p id={`${id}-issue`} className="text-[13px]/5 text-muted-foreground">
                              {issue}
                            </p>
                          )}
                        </div>
                        {issue && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {/* Above the label's overlay, so it opens its tooltip instead of toggling. */}
                              <button
                                type="button"
                                className="relative z-10 rounded-full text-[#b2b6b8] outline-none hover:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                              >
                                <InfoIcon aria-hidden className="size-5" />
                                <span className="sr-only">Why {document.label} is flagged</span>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Flagged by the automated checks</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    );
                  })}
                </div>
                <FieldError className="mt-2" errors={[fieldState.error]} />
              </FieldSet>
            )}
          />

          <Controller
            name="message"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="mt-7 gap-3">
                <FieldLabel htmlFor="resubmit-message" className={sectionLabel}>
                  Message to User
                </FieldLabel>
                <Textarea
                  {...field}
                  id="resubmit-message"
                  placeholder="Enter detailed instructions for the user..."
                  aria-invalid={fieldState.invalid}
                  aria-describedby="resubmit-message-hint"
                  className="min-h-32.5 resize-none rounded-lg px-6 pt-5 pb-4 placeholder:text-outline md:text-sm"
                />
                <FieldDescription id="resubmit-message-hint" className="text-xs text-outline">
                  This message will be included in the automated notification email.
                </FieldDescription>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-4 px-6 py-10 sm:px-16">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-14 rounded-md border-outline bg-background text-base font-semibold tracking-wide"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-14 rounded-md text-base font-semibold tracking-wide shadow-[0_6px_14px_rgb(0_80_105/0.25)]"
          >
            Send Request
          </Button>
        </div>
      </form>
    </>
  );
}
