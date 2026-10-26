"use client";

import { StarFourIcon, XIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useState } from "react";

import { EvidenceReviewDialog } from "@/components/conversations/evidence-review-dialog";
import { FlagConversationDialog } from "@/components/conversations/flag-conversation-dialog";
import { SuspendAccountDialog } from "@/components/conversations/suspend-account-dialog";
import { WarnUserDialog } from "@/components/conversations/warn-user-dialog";
import { ActionDialogLabel } from "@/components/dashboard/action-dialog";
import { ActionSheetContent } from "@/components/dashboard/action-sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FEATURES } from "@/constants/features";
import { initials } from "@/libs/utils";
import type { Conversation, SafetyCheck } from "@/types/conversations";

// This Figma's greens and oranges are Tailwind v3's green-700 and orange-700;
// v4's are a shade off (#008236, #ca3500), so they're spelled out.
const STATE_STYLES: Record<Conversation["state"], { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-green-100 text-[#15803d] dark:bg-success/15 dark:text-success",
  },
  paused: {
    label: "Paused",
    className: "bg-caution-soft text-caution dark:bg-caution/30 dark:text-amber-300",
  },
  closed: { label: "Closed", className: "bg-muted-strong text-muted-foreground dark:bg-muted" },
};

const CHECK_STYLES: Record<SafetyCheck["result"], { label: string; row: string; text: string }> = {
  safe: { label: "Safe", row: "bg-muted", text: "text-[#15803d] dark:text-success" },
  "needs-review": {
    label: "Needs Review",
    row: "bg-orange-100 dark:bg-orange-400/10",
    text: "text-[#c2410c] dark:text-orange-300",
  },
};

/** The sentiment bars darken toward the latest period: the Figma's five tints of the action teal. */
const BAR_TONES = [
  "bg-action/20 dark:bg-primary/20",
  "bg-action/20 dark:bg-primary/20",
  "bg-action/40 dark:bg-primary/40",
  "bg-action/60 dark:bg-primary/60",
  "bg-action dark:bg-primary",
];

const count = new Intl.NumberFormat("en-US");

/** The dialogs the sheet opens; one at a time. */
type SheetAction = "evidence" | "flag" | "warn" | "suspend";

const card = "rounded-[12px]";
// pt-0.5 drops each label 1px, onto the Figma's baseline. bg-clip-border fills
// the primary button to its edge; the outline ones are 2px taller, as drawn.
const footerButton = "rounded-[12px] pt-0.5 text-[17px] font-medium tracking-[0.01em]";
const evidenceButton = cn(
  footerButton,
  "col-span-2 h-14 bg-action bg-clip-border text-white hover:bg-action/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90",
);
// The Figma draws the actions unchanged behind their open dialogs.
const outlineButton = cn(
  footerButton,
  "h-14.5 bg-background px-3 whitespace-normal text-foreground aria-expanded:bg-background",
);

/**
 * A conversation's detail panel, opened from Conversation Management: who's
 * in it, how it's going, the AI's read and the safety checks, with the
 * moderation actions below. UI only: no action reaches /admin/chat yet.
 */
export function ConversationSheet({
  conversation,
  open,
  onOpenChange,
  onCloseAutoFocus,
}: {
  /** Kept after closing, so the panel doesn't empty while it slides out. */
  conversation?: Conversation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Rows open the sheet without a trigger, so the caller says where focus goes back to. */
  onCloseAutoFocus?: (event: Event) => void;
}) {
  const [action, setAction] = useState<SheetAction | null>(null);
  // However the sheet closes (its X, Escape, or the caller), it reopens with no dialog up.
  if (!open && action !== null) setAction(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ActionSheetContent
        nestedOpen={action !== null}
        onCloseAutoFocus={onCloseAutoFocus}
        className="max-w-100 border-border"
      >
        {conversation && (
          <SheetContents conversation={conversation} action={action} onActionChange={setAction} />
        )}
      </ActionSheetContent>
    </Dialog>
  );
}

function SheetContents({
  conversation,
  action,
  onActionChange,
}: {
  conversation: Conversation;
  action: SheetAction | null;
  onActionChange: (action: SheetAction | null) => void;
}) {
  const state = STATE_STYLES[conversation.state];
  const stats = [
    { label: "Total Messages", value: count.format(conversation.messageCount) },
    { label: "Duration", value: conversation.duration },
    { label: "Avg. Reply", value: conversation.avgReply },
    { label: "Media Shared", value: count.format(conversation.mediaShared) },
  ];

  return (
    <>
      <div className="flex shrink-0 items-start gap-4 border-b bg-surface/50 px-6 pt-6 pb-5.75">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
            <DialogPrimitive.Title className="text-xl/7 font-semibold">
              #{conversation.id}
            </DialogPrimitive.Title>
            {/* Read out with the description instead, so the state is announced on open. */}
            <span
              aria-hidden
              className={cn("rounded-full px-1 text-[11px]/4.5 font-medium", state.className)}
            >
              {state.label}
            </span>
          </div>
          <DialogPrimitive.Description className="mt-0.75 text-[13px]/5 text-muted-foreground">
            <span className="sr-only">{state.label}. </span>Matched {conversation.matchedOn}
          </DialogPrimitive.Description>
        </div>
        <DialogPrimitive.Close className="mt-1.75 -mr-0.75 rounded-md p-1 text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50">
          <XIcon aria-hidden weight="bold" className="size-5.25" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <section>
          <ActionDialogLabel asChild>
            <h3>Participants</h3>
          </ActionDialogLabel>
          <ul className="mt-3 flex flex-col gap-3">
            {conversation.participants.map((participant) => (
              <li key={participant.id} className={cn(card, "flex items-center gap-3 bg-muted p-3")}>
                <Avatar className="size-10">
                  {participant.avatarUrl && <AvatarImage src={participant.avatarUrl} alt="" />}
                  <AvatarFallback className="bg-accent text-sm font-semibold text-primary">
                    {initials(participant.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 pb-0.5 text-[13px]/4.5">
                  <p className="truncate font-medium tracking-[0.01em]">{participant.name}</p>
                  <p className="truncate text-muted-foreground">{participant.location}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6">
          <ActionDialogLabel asChild>
            <h3>Engagement Summary</h3>
          </ActionDialogLabel>
          <dl className="mt-3 grid grid-cols-2 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className={cn(card, "min-w-0 border p-3")}>
                <dt className="text-[11px]/3.5 font-medium text-muted-foreground">{stat.label}</dt>
                <dd className="text-xl/7 font-semibold tracking-[0.01em]">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {FEATURES.aiMetrics && <AiInsights conversation={conversation} />}

        {FEATURES.aiMetrics && (
          <section className="mt-6">
            <ActionDialogLabel asChild>
              <h3>Safety Analysis</h3>
            </ActionDialogLabel>
            <dl className="mt-3 flex flex-col gap-1">
              {conversation.safetyChecks.map((check) => {
                const style = CHECK_STYLES[check.result];
                return (
                  <div
                    key={check.id}
                    className={cn(
                      card,
                      "flex min-h-10.5 items-center justify-between gap-4 px-3 py-2",
                      style.row,
                    )}
                  >
                    <dt className="text-[13px]/5">{check.label}</dt>
                    <dd className={cn("shrink-0 text-[11px]/4 font-medium", style.text)}>
                      {style.label}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </section>
        )}

        {/* The Figma breaks the notice after "or"; the cap keeps that break. */}
        <p className="mt-6 rounded-md border border-border/20 bg-muted/50 p-3 text-[11px]/3.5 text-muted-foreground italic dark:border-border">
          <span className="block max-w-75">
            Notice: Message content is only visible for reported or flagged conversations per
            privacy policy.
          </span>
        </p>
      </div>

      <SheetActions conversation={conversation} action={action} onActionChange={onActionChange} />
    </>
  );
}

/**
 * The moderation actions. Each dialog renders its button as its trigger, so
 * closing one returns focus there, and reports opening to the sheet, which
 * fades its own scrim under the dialog's.
 */
function SheetActions({
  conversation,
  action,
  onActionChange,
}: {
  conversation: Conversation;
  action: SheetAction | null;
  onActionChange: (action: SheetAction | null) => void;
}) {
  const dialog = (name: SheetAction) => ({
    conversation,
    open: action === name,
    onOpenChange: (open: boolean) => onActionChange(open ? name : null),
  });

  return (
    <div className="grid shrink-0 grid-cols-2 gap-3 border-t px-6 py-6">
      {conversation.evidence ? (
        <EvidenceReviewDialog
          {...dialog("evidence")}
          trigger={<Button className={evidenceButton}>View Conversation Evidence</Button>}
        />
      ) : (
        <NoEvidenceButton />
      )}
      {FEATURES.conversationFlags && (
        <FlagConversationDialog
          {...dialog("flag")}
          trigger={
            <Button variant="outline" className={outlineButton}>
              Flag for Review
            </Button>
          }
        />
      )}
      {/* Without Flag beside it, Warn takes the whole row. */}
      <WarnUserDialog
        {...dialog("warn")}
        trigger={
          <Button
            variant="outline"
            className={cn(outlineButton, !FEATURES.conversationFlags && "col-span-2")}
          >
            Warn User
          </Button>
        }
      />
      <SuspendAccountDialog
        {...dialog("suspend")}
        trigger={
          <Button
            variant="outline"
            className={cn(
              outlineButton,
              "col-span-2 border-destructive text-destructive hover:bg-destructive/5 hover:text-destructive aria-expanded:text-destructive dark:border-destructive",
            )}
          >
            Suspend Account
          </Button>
        }
      />
    </div>
  );
}

/**
 * Without a report or flag there's no transcript to review, so the button
 * only explains why. It's aria-disabled rather than disabled, so the reason
 * can still be hovered and focused.
 */
function NoEvidenceButton() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-disabled
          onClick={(event) => event.preventDefault()}
          className={cn(
            evidenceButton,
            "cursor-not-allowed opacity-50 hover:bg-action dark:hover:bg-primary",
          )}
        >
          View Conversation Evidence
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-64 text-center">
        Message content is only visible for reported or flagged conversations.
      </TooltipContent>
    </Tooltip>
  );
}

function AiInsights({ conversation }: { conversation: Conversation }) {
  const { sentiment } = conversation;

  return (
    <section
      className={cn(
        card,
        "mt-6 border border-action/10 bg-action/5 p-6 dark:border-primary/25 dark:bg-primary/10",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h3 className="flex items-center gap-0.5 text-xs/4 font-semibold tracking-wider text-action uppercase dark:text-primary">
          <SparklesIcon />
          AI Insights
        </h3>
        <p className="text-base/6 font-bold text-action dark:text-primary">
          {conversation.quality}% Quality
        </p>
      </div>
      <p className="mt-6 text-[11px]/3.5 font-medium text-muted-foreground">
        Features Used:{" "}
        {conversation.featuresUsed.length > 0 ? conversation.featuresUsed.join(", ") : "None yet"}
      </p>
      <figure className="mt-1">
        {sentiment.length > 0 ? (
          <div aria-hidden className="flex h-8 items-end gap-0.5">
            {sentiment.map((value, index) => (
              <span
                // Periods have no ids; their order is fixed.
                key={index}
                className={cn("flex-1 rounded-t-xs", barTone(index, sentiment.length))}
                style={{ height: `${Math.min(100, Math.max(0, value))}%` }}
              />
            ))}
          </div>
        ) : (
          <p className="flex h-8 items-center justify-center text-[11px] text-muted-foreground">
            No sentiment data yet
          </p>
        )}
        <figcaption className="mt-1 text-center text-[11px]/3.5 font-medium text-muted-foreground">
          Sentiment Trend
          {sentiment.length > 0 && <span className="sr-only">: {describeTrend(sentiment)}</span>}
        </figcaption>
      </figure>
    </section>
  );
}

/** The tint for a period, spread over the five tints so the latest is the darkest. */
const barTone = (index: number, periods: number) =>
  BAR_TONES[Math.round((periods > 1 ? index / (periods - 1) : 1) * (BAR_TONES.length - 1))];

/** The bars in words: each period's score, and which way it went overall. */
function describeTrend(values: number[]) {
  const first = values[0];
  const last = values[values.length - 1];
  const direction = last - first >= 10 ? "rising" : first - last >= 10 ? "falling" : "steady";
  return `${values.join(", ")} out of 100, oldest to newest, ${direction} overall.`;
}

/**
 * The Figma's AI glyph: a large four-point star with a hollow center and two
 * small solid ones. Phosphor has no such glyph, so it's built from its
 * four-point star, like the dashboard's AI card. The hole repaints the box's
 * fill: the sheet's background under the same tint.
 */
function SparklesIcon() {
  return (
    <span aria-hidden className="relative size-5 shrink-0">
      <span className="absolute top-0.5 -left-px grid size-3.75 place-items-center *:col-start-1 *:row-start-1">
        <StarFourIcon weight="fill" className="size-full" />
        <StarFourIcon weight="fill" className="size-1.5 text-background" />
        <StarFourIcon weight="fill" className="size-1.5 text-action/5 dark:text-primary/10" />
      </span>
      <StarFourIcon weight="fill" className="absolute top-0 right-px size-2" />
      <StarFourIcon weight="fill" className="absolute right-px bottom-0 size-2" />
    </span>
  );
}
