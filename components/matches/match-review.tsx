"use client";

import { type ReactNode, Suspense, useRef, useState } from "react";

import { ExcludeMatchingDialog } from "@/components/matches/exclude-matching-dialog";
import { FlagMatchDialog } from "@/components/matches/flag-match-dialog";
import { HighConfidenceMatchesCard } from "@/components/matches/high-confidence-matches-card";
import { MatchInsightSheet } from "@/components/matches/match-insight-sheet";
import {
  type MatchAction,
  RecentMatchesCard,
  RecentMatchesFallback,
} from "@/components/matches/recent-matches-card";
import { RemoveMatchDialog } from "@/components/matches/remove-match-dialog";
import type { MatchDetail } from "@/types/matches";

/**
 * The two match tables and what they open: the insight sheet, and the
 * moderation dialogs a row's menu reaches directly. `children` is the card
 * beside the high-confidence table (Score Distribution).
 */
export function MatchReview({
  highConfidence,
  matches,
  totalCount,
  children,
}: {
  highConfidence: MatchDetail[];
  matches: MatchDetail[];
  totalCount: number;
  children: ReactNode;
}) {
  const [insight, setInsight] = useState<MatchDetail | null>(null);
  const [insightOpen, setInsightOpen] = useState(false);
  // Kept after closing, so a dialog doesn't empty while it fades out.
  const [dialog, setDialog] = useState<{
    action: Exclude<MatchAction, "insight">;
    match: MatchDetail;
  } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  // The row button that opened the sheet or dialog: neither has a trigger of its own.
  const openerRef = useRef<HTMLElement | null>(null);

  const onAction = (action: MatchAction, match: MatchDetail, opener: HTMLElement) => {
    openerRef.current = opener;
    if (action === "insight") {
      setInsight(match);
      setInsightOpen(true);
    } else {
      setDialog({ action, match });
      setDialogOpen(true);
    }
  };

  const closeDialog = () => {
    setDialogOpen(false);
    // Once its focus trap has let go, back to the row's menu button.
    setTimeout(() => openerRef.current?.focus());
  };

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-3">
        {children}
        <HighConfidenceMatchesCard
          matches={highConfidence}
          onView={(match, opener) => onAction("insight", match, opener)}
          className="xl:col-span-2"
        />
      </div>

      {/* The table's filter lives in the URL; until it's read, the first page stands in. */}
      <Suspense
        fallback={
          <RecentMatchesFallback matches={matches} totalCount={totalCount} onAction={onAction} />
        }
      >
        <RecentMatchesCard matches={matches} totalCount={totalCount} onAction={onAction} />
      </Suspense>

      <MatchInsightSheet
        match={insight}
        open={insightOpen}
        onOpenChange={setInsightOpen}
        returnFocusRef={openerRef}
      />
      {dialog?.action === "flag" && (
        <FlagMatchDialog
          match={dialog.match}
          open={dialogOpen}
          onOpenChange={(open) => !open && closeDialog()}
        />
      )}
      {dialog?.action === "remove" && (
        <RemoveMatchDialog
          match={dialog.match}
          open={dialogOpen}
          onOpenChange={(open) => !open && closeDialog()}
        />
      )}
      {dialog?.action === "exclude" && (
        <ExcludeMatchingDialog
          match={dialog.match}
          open={dialogOpen}
          onOpenChange={(open) => !open && closeDialog()}
        />
      )}
    </>
  );
}
