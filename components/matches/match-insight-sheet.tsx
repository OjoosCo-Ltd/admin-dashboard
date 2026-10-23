"use client";

import { FlagIcon, ProhibitIcon, XIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { Dialog as DialogPrimitive } from "radix-ui";
import { type ReactNode, type RefObject, useState } from "react";

import { ActionSheetContent } from "@/components/dashboard/action-sheet";
import { Dialog } from "@/components/ui/dialog";
import { ExcludeMatchingDialog } from "@/components/matches/exclude-matching-dialog";
import { FlagMatchDialog } from "@/components/matches/flag-match-dialog";
import { ParticipantAvatar } from "@/components/dashboard/pair-avatars";
import { RemoveMatchDialog } from "@/components/matches/remove-match-dialog";
import { FEATURES } from "@/constants/features";
import type { MatchDetail } from "@/types/matches";

const moment = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "UTC",
});

type NestedDialog = "flag" | "remove" | "exclude";

/** One match up close: the pair, how they scored, how it's going, and the moderation actions. */
export function MatchInsightSheet({
  match,
  open,
  onOpenChange,
  returnFocusRef,
}: {
  /** Kept after closing, so the panel doesn't empty while it slides out. */
  match: MatchDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** What had focus before the sheet opened: it opens from a row, not a trigger. */
  returnFocusRef?: RefObject<HTMLElement | null>;
}) {
  const [nested, setNested] = useState<NestedDialog | null>(null);
  const nestedProps = (name: NestedDialog) => ({
    open: nested === name,
    onOpenChange: (next: boolean) => setNested(next ? name : null),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ActionSheetContent
        nestedOpen={nested !== null}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusRef?.current?.focus();
        }}
        className="max-w-112.5"
      >
        <div className="flex h-20 shrink-0 items-center justify-between gap-4 border-b px-6">
          <DialogPrimitive.Title className="text-xl leading-7 font-semibold">
            Match Insight
          </DialogPrimitive.Title>
          <DialogPrimitive.Close className="-m-1 rounded-md p-1 text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50">
            <XIcon aria-hidden weight="bold" className="size-6" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </div>

        {match && (
          <>
            <InsightBody match={match} />
            <div className="shrink-0 border-t px-6 py-6">
              <div className={cn("grid gap-3.5", FEATURES.matchFlags && "grid-cols-2")}>
                {FEATURES.matchFlags && (
                  <FlagMatchDialog
                    match={match}
                    {...nestedProps("flag")}
                    trigger={
                      <button
                        type="button"
                        className="flex h-14 items-center justify-center gap-2.5 rounded-md border border-destructive/40 bg-background text-base text-destructive transition-colors outline-none hover:bg-destructive/5 focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <FlagIcon aria-hidden weight="bold" className="size-5" />
                        Flag for Review
                      </button>
                    }
                  />
                )}
                <RemoveMatchDialog
                  match={match}
                  {...nestedProps("remove")}
                  trigger={
                    <button
                      type="button"
                      className="flex h-14 items-center justify-center gap-2.5 rounded-md bg-[#191c1e] text-base text-white transition-colors outline-none hover:bg-[#191c1e]/90 focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-foreground dark:text-background"
                    >
                      <ProhibitIcon aria-hidden weight="bold" className="size-5" />
                      Remove Match
                    </button>
                  }
                />
              </div>
              {FEATURES.matchExclusion && (
                <ExcludeMatchingDialog
                  match={match}
                  {...nestedProps("exclude")}
                  trigger={
                    <button
                      type="button"
                      className="mt-3 flex h-14 w-full items-center justify-center rounded-md border border-outline bg-background text-base transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      Exclude Future Matching
                    </button>
                  }
                />
              )}
            </div>
          </>
        )}
      </ActionSheetContent>
    </Dialog>
  );
}

function InsightBody({ match }: { match: MatchDetail }) {
  const [first, second] = match.users;
  const lastEvent = match.timeline.length - 1;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-12 pb-8">
      <DialogPrimitive.Description className="sr-only">
        Compatibility, conversation activity and history for {first.name} and {second.name}.
      </DialogPrimitive.Description>

      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2 text-center">
        <Participant user={first} tint={0} />
        <div className="flex flex-col items-center pt-5">
          <span className="flex size-12 items-center justify-center rounded-full bg-action text-lg font-bold text-white tabular-nums">
            {match.compatibility}%
          </span>
          <span className="mt-2.5 text-[10px] font-bold tracking-wide text-action uppercase dark:text-primary">
            Match
          </span>
        </div>
        <Participant user={second} tint={1} />
      </div>

      <Section title="Compatibility breakdown" className="mt-16">
        <dl className="flex flex-col gap-2">
          {match.breakdown.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <dt>{item.label}</dt>
                <dd className="font-bold tabular-nums">{item.percent}%</dd>
              </div>
              <div aria-hidden className="mt-1.5 h-1.5 rounded-full bg-container dark:bg-muted">
                <div
                  className="h-full rounded-full bg-action dark:bg-primary"
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </div>
          ))}
        </dl>
      </Section>

      <dl className="mt-12 grid grid-cols-2 gap-6">
        <Stat
          label="Total messages"
          value={new Intl.NumberFormat("en-US").format(match.totalMessages)}
        />
        <Stat
          label="Avg reply time"
          value={match.avgReplyMinutes > 0 ? `${match.avgReplyMinutes}m` : "—"}
        />
      </dl>

      <Section title="Journey timeline" className="mt-11">
        <ol>
          {match.timeline.map((event, index) => (
            <li key={event.id} className="relative flex gap-4 pb-4 last:pb-0">
              {/* The rail between this milestone and the next. */}
              {index < lastEvent && (
                <span
                  aria-hidden
                  className="absolute top-3.5 bottom-0 left-[4.5px] w-px bg-border"
                />
              )}
              <span
                aria-hidden
                className={cn(
                  "mt-1 size-2.5 shrink-0 rounded-full",
                  index === lastEvent && index > 0 ? "bg-review" : "bg-action dark:bg-primary",
                )}
              />
              <div>
                <p className="text-xs leading-4 font-bold">{event.title}</p>
                <p className="mt-0.5 text-[10px] text-outline">
                  <time dateTime={event.at}>{moment.format(new Date(event.at))}</time> •{" "}
                  {event.source}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Section>
    </div>
  );
}

function Participant({ user, tint }: { user: MatchDetail["users"][number]; tint: number }) {
  return (
    <div className="flex min-w-0 flex-col items-center">
      <ParticipantAvatar user={user} size="lg" tint={tint} className="ring-1 ring-border/60" />
      <p className="mt-2.5 text-base font-semibold">{user.name}</p>
      <p className="text-[10px] text-muted-foreground">UID: {user.uid}</p>
    </div>
  );
}

function Section({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={className}>
      <h3 className="border-b border-muted-strong pb-2.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase dark:border-border">
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex h-17 flex-col justify-center rounded-md border border-muted-strong bg-muted px-3 dark:border-border">
      <dt className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="text-xl leading-7 font-bold tabular-nums">{value}</dd>
    </div>
  );
}
