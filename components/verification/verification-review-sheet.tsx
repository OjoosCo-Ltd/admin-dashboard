"use client";

import { ImageBrokenIcon, InfoIcon, XIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import Image from "next/image";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useId, useState } from "react";
import { toast } from "sonner";

import { ActionDialogLabel } from "@/components/dashboard/action-dialog";
import { ActionSheetContent } from "@/components/dashboard/action-sheet";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { RejectVerificationDialog } from "@/components/verification/reject-verification-dialog";
import { RequestDocumentsDialog } from "@/components/verification/request-documents-dialog";
import {
  RISK_STYLES,
  type ScoreBand,
  scoreBand,
} from "@/components/verification/verification-styles";
import { FEATURES } from "@/constants/features";
import type { CaseEvent, VerificationCase, VerificationDocument } from "@/types/verification";

const CHECK_STYLES: Record<ScoreBand, { bar: string; text: string }> = {
  pass: { bar: "bg-action dark:bg-primary", text: "text-action dark:text-primary" },
  review: { bar: "bg-caution dark:bg-amber-400", text: "text-caution dark:text-amber-300" },
  fail: { bar: "bg-destructive", text: "text-destructive" },
};

const ACTOR_DOT: Record<CaseEvent["actor"], string> = {
  user: "bg-action dark:bg-primary",
  moderator: "bg-action dark:bg-primary",
  system: "bg-border",
};

type Decision = "reject" | "request";

/**
 * The "Reviewing <name>" side sheet: the submitted images, the automated
 * checks, the OCR read-out and the case history, with the decisions below.
 * UI only: no decision reaches the verification endpoints yet.
 */
export function VerificationReviewSheet({
  verification,
  open,
  onOpenChange,
  onCloseAutoFocus,
}: {
  verification?: VerificationCase;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Rows open the sheet without a trigger, so the caller says where focus goes back to. */
  onCloseAutoFocus?: (event: Event) => void;
}) {
  const [decision, setDecision] = useState<Decision | null>(null);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setDecision(null);
        onOpenChange(next);
      }}
    >
      <ActionSheetContent nestedOpen={decision !== null} onCloseAutoFocus={onCloseAutoFocus}>
        {verification && (
          <SheetContents
            verification={verification}
            decision={decision}
            onDecisionChange={setDecision}
          />
        )}
      </ActionSheetContent>
    </Dialog>
  );
}

function SheetContents({
  verification,
  decision,
  onDecisionChange,
}: {
  verification: VerificationCase;
  decision: Decision | null;
  onDecisionChange: (decision: Decision | null) => void;
}) {
  const noteId = useId();
  const risk = RISK_STYLES[verification.risk];
  const priorityClass = cn(
    "w-fit shrink-0 rounded-full px-3 py-1 text-[11px]/4 font-bold tracking-wider uppercase",
    risk.className,
  );
  const checks = [
    { label: "Face Match Score", score: verification.faceMatch, unit: "Match" },
    { label: "Liveness Detection", score: verification.liveness, unit: "Human" },
    { label: "Document Authenticity", score: verification.authenticity, unit: "Confidence" },
  ];

  return (
    <>
      <div className="flex shrink-0 items-center gap-5 border-b border-border/30 px-6 py-4.5 dark:border-border">
        <DialogPrimitive.Close className="rounded-md p-1 text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50">
          <XIcon aria-hidden weight="bold" className="size-5" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
        <div className="min-w-0 flex-1">
          <DialogPrimitive.Title className="text-xl/7 font-semibold">
            Reviewing {verification.name}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="text-[13px]/5 font-semibold text-muted-foreground">
            Case #{verification.caseId} • Submitted {verification.submitted}
          </DialogPrimitive.Description>
          {/* On phones the pill drops under the title, which keeps the width to wrap. */}
          {FEATURES.verificationRisk && (
            <p className={cn(priorityClass, "mt-2 sm:hidden")}>Priority: {risk.label}</p>
          )}
        </div>
        {FEATURES.verificationRisk && (
          <p className={cn(priorityClass, "max-sm:hidden")}>Priority: {risk.label}</p>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-6 pb-10">
        <section>
          <ActionDialogLabel asChild>
            <h3>Identity Documents</h3>
          </ActionDialogLabel>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {verification.documents.map((document) => (
              <DocumentImage key={document.id} document={document} name={verification.name} />
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl bg-muted p-6">
          <ActionDialogLabel asChild>
            <h3>AI Verification Results</h3>
          </ActionDialogLabel>
          <dl className="mt-4 flex flex-col gap-4">
            {checks.map((check) => {
              const style = CHECK_STYLES[scoreBand(check.score)];
              const score = Math.min(100, Math.max(0, check.score));
              return (
                <div key={check.label}>
                  <div className="flex items-baseline justify-between gap-4 text-sm/5">
                    <dt>{check.label}</dt>
                    <dd className={cn("font-bold", style.text)}>
                      {check.score}% {check.unit}
                    </dd>
                  </div>
                  <div
                    aria-hidden
                    className="mt-1 h-2 rounded-full bg-muted-strong dark:bg-background"
                  >
                    <div
                      className={cn("h-full rounded-full", style.bar)}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </dl>
          <p className="mt-4 flex gap-2.5 rounded-lg border border-primary/10 bg-primary/4 p-3 text-[13px]/5 text-muted-foreground">
            <InfoIcon
              aria-hidden
              weight="bold"
              className="mt-0.5 size-4 shrink-0 text-action dark:text-primary"
            />
            {verification.summary}
          </p>
        </section>

        <section className="mt-10">
          <ActionDialogLabel asChild>
            <h3>Extracted Data (OCR)</h3>
          </ActionDialogLabel>
          <dl className="mt-6 grid gap-x-8 gap-y-5.5 sm:grid-cols-2">
            {verification.ocr.map((field) => (
              <div key={field.id} className="border-b border-border/30 pb-1 dark:border-border">
                <dt className="text-[11px]/4 text-muted-foreground uppercase">{field.label}</dt>
                <dd className={cn("mt-0.5 text-sm/5", field.flagged && "text-destructive")}>
                  {field.value}
                  {field.flagged && <span className="sr-only"> (flagged)</span>}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-10">
          <ActionDialogLabel asChild>
            <h3>{FEATURES.verificationNotes ? "History & Notes" : "History"}</h3>
          </ActionDialogLabel>
          <ol className="mt-4">
            {verification.history.map((event, index) => (
              <li key={event.id} className="relative pb-6 pl-6 last:pb-0">
                {/* The rail joins each dot to the next. */}
                {index < verification.history.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute top-3 bottom-1 left-0.75 w-px bg-border/50"
                  />
                )}
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-1 left-0 size-2 rounded-full",
                    ACTOR_DOT[event.actor],
                  )}
                />
                <p className="text-[13px]/5 font-semibold">{event.title}</p>
                <p className="text-xs/5 text-muted-foreground">{event.time}</p>
              </li>
            ))}
          </ol>
          {FEATURES.verificationNotes && (
            <>
              <label htmlFor={noteId} className="sr-only">
                Moderator note
              </label>
              <Textarea
                id={noteId}
                placeholder="Add a moderator note..."
                className="mt-4 min-h-26 resize-none rounded-lg border-border/40 bg-muted px-3 py-4.5 text-[13px] placeholder:text-[#6b7280] md:text-[13px] dark:border-border"
              />
            </>
          )}
        </section>
      </div>

      {/* Not in the Figma: the frames show the dialogs but not the buttons that open them. */}
      <div
        className={cn(
          "grid shrink-0 grid-cols-2 gap-3 border-t border-border/30 px-6 py-4 dark:border-border",
          FEATURES.verificationResubmission && "sm:grid-cols-3",
        )}
      >
        {/* The dialogs render their buttons as triggers, so closing one returns focus here. */}
        {FEATURES.verificationResubmission && (
          <RequestDocumentsDialog
            verification={verification}
            open={decision === "request"}
            onOpenChange={(open) => onDecisionChange(open ? "request" : null)}
            trigger={
              <Button
                variant="outline"
                className="col-span-2 h-12 rounded-[10px] bg-background px-3 text-[15px] font-semibold text-muted-foreground sm:col-span-1"
              >
                Request Documents
              </Button>
            }
          />
        )}
        <RejectVerificationDialog
          name={verification.name}
          open={decision === "reject"}
          onOpenChange={(open) => onDecisionChange(open ? "reject" : null)}
          trigger={
            <Button
              variant="outline"
              disabled={verification.status === "REJECTED"}
              className="h-12 rounded-[10px] border-destructive bg-background text-[15px] font-semibold text-destructive hover:bg-destructive/5 hover:text-destructive"
            >
              Reject
            </Button>
          }
        />
        <Button
          disabled={verification.status === "APPROVED"}
          onClick={() => toast("Approving a verification isn't available yet")}
          className="h-12 rounded-[10px] bg-action text-[15px] font-semibold text-white hover:bg-action/90 dark:bg-primary dark:text-primary-foreground"
        >
          Approve
        </Button>
      </div>
    </>
  );
}

/** A submitted image with its label chip, or a placeholder when the image is gone. */
function DocumentImage({ document, name }: { document: VerificationDocument; name: string }) {
  return (
    <figure className="relative aspect-4/3 overflow-hidden rounded-lg border bg-muted">
      {document.url ? (
        <Image
          src={document.url}
          alt={`${document.label} submitted by ${name}`}
          fill
          sizes="(min-width: 640px) 17rem, 100vw"
          // The sheet mounts only when open, so these are what the reviewer came to see.
          loading="eager"
          className="object-cover"
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
          <ImageBrokenIcon aria-hidden className="size-8" />
          Image unavailable
        </div>
      )}
      <figcaption className="absolute bottom-2 left-2 rounded-sm bg-black/55 px-1.5 py-0.5 text-[11px]/4.5 text-white">
        {document.label}
      </figcaption>
    </figure>
  );
}
