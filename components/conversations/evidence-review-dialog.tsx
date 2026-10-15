"use client";

import {
  CheckIcon,
  ClipboardIcon,
  ClockCounterClockwiseIcon,
  WarningIcon,
  WarningOctagonIcon,
} from "@phosphor-icons/react";
import { cn } from "cn";
import { Dialog as DialogPrimitive } from "radix-ui";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { participantById } from "@/components/conversations/participants";
import {
  ActionDialogBody,
  ActionDialogContent,
  ActionDialogFooter,
  ActionDialogHeader,
} from "@/components/dashboard/action-dialog";
import { GavelIcon, VerifiedUserIcon } from "@/components/icons/app-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { initials } from "@/libs/utils";
import type { Conversation, ConversationEvidence, EvidenceMessage } from "@/types/conversations";

const PRIORITY_LABELS: Record<ConversationEvidence["priority"], string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const barLabel = "text-xs font-semibold tracking-wider text-muted-foreground uppercase";
const muted = "text-outline dark:text-muted-foreground";
const footerButton =
  "h-14 rounded-[12px] px-6 text-base font-semibold tracking-[0.0375em] shadow-xs max-sm:h-12 max-sm:w-full";

/**
 * The transcript of a reported or flagged conversation, for moderators: who
 * was in it, every message with the AI's redactions, and the message that
 * tripped a safety rule. UI only: logging the review doesn't reach /admin/chat yet.
 */
export function EvidenceReviewDialog({
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
  const { evidence } = conversation;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <ActionDialogContent
        onCloseAutoFocus={onCloseAutoFocus}
        className={cn(
          "rounded-[12px] dark:border",
          // The Figma's 936px panel: the transcript scrolls inside it.
          evidence ? "max-h-[min(58.5rem,calc(100svh-2rem))] max-w-4xl" : "max-w-120",
        )}
      >
        {evidence ? (
          <EvidenceView conversation={conversation} evidence={evidence} />
        ) : (
          <NoEvidence id={conversation.id} safety={conversation.safety} />
        )}
      </ActionDialogContent>
    </Dialog>
  );
}

function EvidenceView({
  conversation,
  evidence,
}: {
  conversation: Conversation;
  evidence: ConversationEvidence;
}) {
  const [first, second] = conversation.participants;
  const triggerId = evidence.messages.find((message) => message.violation)?.id;

  return (
    <>
      <p className="flex shrink-0 items-center justify-center gap-3 bg-sidebar px-6 py-1 text-center text-xs font-semibold tracking-widest text-white uppercase max-sm:px-4">
        <VerifiedUserIcon className="h-3.75 w-3 shrink-0" />
        Confidential Data - Moderator Access Only
      </p>

      <ActionDialogHeader
        icon={<GavelIcon />}
        // The Figma's tile is taller than it is wide, with the gavel near its top.
        iconClassName="mt-0.75 h-10.25 w-8.5 items-start rounded-md bg-info-soft pt-2 text-[#4d6876] [&_svg]:size-auto dark:bg-info-soft/15 dark:text-info-soft"
        title="Conversation Evidence Review"
        description={`Case ID: #${evidence.caseId} • ${PRIORITY_LABELS[evidence.priority]} Priority`}
        className="items-start gap-3 pt-3 pb-2.75"
        // The Figma's close glyph is 14px, a little below the header's top padding.
        closeClassName="mt-1.25 mr-0 [&_svg]:size-5.25"
        // The Figma sets the description 1px closer to the title than the line boxes would.
        descriptionClassName="-mt-px text-[13px]/5"
      />

      <dl className="flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b bg-muted px-6 py-3 max-sm:px-4">
        <div className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-1">
          <dt className={barLabel}>Participants:</dt>
          <dd className="flex min-w-0 items-center gap-2">
            <span aria-hidden className="flex shrink-0 -space-x-2">
              <ParticipantPhoto name={first.name} url={first.avatarUrl} />
              <ParticipantPhoto name={second.name} url={second.avatarUrl} />
            </span>
            <span className="text-sm/5 font-semibold text-action dark:text-primary">
              {first.name} &amp; {second.name}
            </span>
          </dd>
        </div>
        <div className="flex flex-wrap items-center gap-x-1">
          <dt className={barLabel}>Incident Time:</dt>
          <dd className="text-sm/5">{evidence.incidentTime}</dd>
        </div>
      </dl>

      <ActionDialogBody
        role="region"
        aria-label="Transcript"
        // Focusable, so the transcript scrolls from the keyboard too.
        tabIndex={0}
        className="bg-surface outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
      >
        <p
          className={cn(
            "flex items-center gap-6 text-[11px]/3.5 font-medium uppercase before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border",
            muted,
          )}
        >
          {evidence.day}
        </p>
        <ol className="mt-6 flex flex-col gap-6">
          {evidence.messages.map((message) => (
            <TranscriptMessage
              key={message.id}
              message={message}
              name={participantById(conversation, message.authorId)?.name ?? "Unknown participant"}
              side={message.authorId === second.id ? "right" : "left"}
              trigger={message.id === triggerId}
            />
          ))}
        </ol>
      </ActionDialogBody>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t px-6 py-6 max-sm:p-4">
        <p className={cn("flex items-center gap-2 text-[13px]/5", muted)}>
          <ClockCounterClockwiseIcon aria-hidden weight="bold" className="size-4.25 shrink-0" />
          Last log entry: {evidence.lastLog}
        </p>
        <div className="flex flex-wrap items-center gap-6 max-sm:w-full max-sm:gap-3">
          {/* The Figma strokes this one outside its 56px box, so it stands 2px taller. */}
          <DialogPrimitive.Close asChild>
            <Button variant="outline" className={cn(footerButton, "h-14.5")}>
              Close Evidence View
            </Button>
          </DialogPrimitive.Close>
          <Button
            onClick={() => toast("Logging review activity isn't available yet")}
            className={cn(
              footerButton,
              // pl-5: Phosphor's clipboard sits inset in its box; the Figma's glyph starts 24px in.
              "gap-2.5 bg-action pl-5 text-white hover:bg-action/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90",
            )}
          >
            <ClipboardCheckIcon />
            Log Review Activity
          </Button>
        </div>
      </div>
    </>
  );
}

/** One message: the author's initials, their name and the time, then the bubble. */
function TranscriptMessage({
  message,
  name,
  side,
  trigger,
}: {
  message: EvidenceMessage;
  name: string;
  /** The first participant's messages sit on the left, the second's on the right. */
  side: "left" | "right";
  /** The first message that tripped a safety rule: the alert pill goes above it. */
  trigger: boolean;
}) {
  const flagged = Boolean(message.violation);
  const right = side === "right";

  return (
    <li>
      {trigger && (
        <p className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-destructive/20 bg-destructive-container px-6 py-2 text-center text-xs font-semibold tracking-wider text-[#93000a] uppercase dark:bg-destructive/15 dark:text-red-200">
          <WarningOctagonIcon aria-hidden weight="bold" className="size-3.5 shrink-0" />
          Automated safety trigger detected
        </p>
      )}
      <div className={cn("flex items-start gap-3", right && "flex-row-reverse")}>
        <span
          aria-hidden
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-bold",
            flagged
              ? "bg-destructive text-white ring-4 ring-destructive/10 dark:bg-destructive/25 dark:text-red-200 dark:ring-destructive/15"
              : right
                ? "bg-action-icon text-white"
                : "bg-[#e0e3e6] text-review dark:bg-muted dark:text-muted-foreground",
          )}
        >
          {initials(name)}
        </span>
        <div className={cn("flex min-w-0 flex-1 flex-col", right ? "items-end" : "items-start")}>
          <p
            className={cn(
              "flex flex-wrap items-center gap-x-3 gap-y-1",
              right && "flex-row-reverse",
            )}
          >
            <span className="text-xs/4 font-bold tracking-[0.05em]">{name}</span>
            <time className={cn("text-[11px]/4 font-medium", muted)}>{message.time}</time>
            {flagged && (
              <span className="flex h-4.75 items-center rounded-full bg-destructive px-3 text-[10px] tracking-tighter text-white uppercase dark:bg-destructive/25 dark:text-red-200">
                Safety trigger
              </span>
            )}
          </p>
          <div
            className={cn(
              // The Figma's bubbles stop at 677px of the 804px column.
              "mt-1 max-w-[84.2%] rounded-[12px] border px-3 py-3 text-sm/5 wrap-break-word",
              right ? "rounded-tr-none text-right" : "rounded-tl-none",
              flagged
                ? "border-destructive bg-[#faeded] font-medium text-[#93000a] shadow-md dark:bg-destructive/15 dark:text-red-200"
                : "bg-background shadow-xs dark:bg-card",
            )}
          >
            {message.redaction ? (
              <p className={muted}>
                <span aria-hidden>[AI REDACTED - {message.redaction}]</span>
                <span className="sr-only">
                  Redacted by the AI ({message.redaction.toLowerCase()})
                </span>
              </p>
            ) : (
              <p>{message.text}</p>
            )}
          </div>
          {message.violation && (
            <p
              className={cn(
                "mt-1 flex items-start gap-1.75 text-[11px]/3.5 font-medium text-destructive",
                right && "text-right",
              )}
            >
              <WarningIcon aria-hidden weight="bold" className="size-3.5 shrink-0" />
              <span>
                <span className="sr-only">Violation: </span>
                {message.violation}
              </span>
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

/** A participant's photo on the participants bar, or their initials. */
function ParticipantPhoto({ name, url }: { name: string; url?: string }) {
  return (
    <Avatar className="size-6 border border-white ring-2 ring-muted after:hidden dark:border-background">
      {url && <AvatarImage src={url} alt="" />}
      <AvatarFallback className="bg-accent text-[9px] font-semibold text-primary">
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

/** Phosphor has no clipboard with a check, the Figma's glyph, so the check sits in its clipboard. */
function ClipboardCheckIcon() {
  return (
    <span aria-hidden className="relative size-4.5 shrink-0">
      <ClipboardIcon weight="bold" className="size-full" />
      <CheckIcon weight="bold" className="absolute top-1.5 left-1/2 size-2.25 -translate-x-1/2" />
    </span>
  );
}

/**
 * A conversation opened without evidence. A healthy one is private by policy;
 * a reported or reviewed one just has no transcript loaded yet.
 */
function NoEvidence({ id, safety }: { id: string; safety: Conversation["safety"] }) {
  return (
    <>
      <ActionDialogHeader
        icon={<GavelIcon />}
        iconClassName="bg-info-soft text-[#4d6876] [&_svg]:size-auto dark:bg-info-soft/15 dark:text-info-soft"
        title="No evidence to review"
        description={`Conversation #${id}`}
        descriptionClassName="text-[13px]/5"
      />
      <ActionDialogBody>
        <p className="text-sm/5 text-muted-foreground">
          {safety === "healthy"
            ? "This conversation hasn’t been reported or flagged, so its content stays private."
            : "The transcript for this case isn’t available yet."}
        </p>
      </ActionDialogBody>
      <ActionDialogFooter className="py-4">
        <DialogPrimitive.Close asChild>
          <Button
            variant="outline"
            className="h-10 rounded-[10px] bg-background px-4 font-semibold"
          >
            Close
          </Button>
        </DialogPrimitive.Close>
      </ActionDialogFooter>
    </>
  );
}
