"use client";

import { CaretRightIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { useId } from "react";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { PairAvatars } from "@/components/dashboard/pair-avatars";
import { pairName } from "@/components/matches/match-parts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { enabled, FEATURES, type Feature } from "@/constants/features";
import type { MatchDetail } from "@/types/matches";

/** Widths in percent. */
const COLUMNS = enabled<{ label: string; width: number; align?: string; feature?: Feature }>([
  { label: "Match ID", width: 16 },
  { label: "Pairs", width: 17 },
  { label: "Compatibility", width: 30 },
  { label: "AI Confidence", width: 22, feature: "aiMetrics" },
  { label: "Actions", width: 15, align: "text-right" },
]);

// A hidden column's share goes to the others, in proportion.
const TOTAL_WIDTH = COLUMNS.reduce((sum, column) => sum + column.width, 0);

const confidence = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

/** The engine's surest recent pairings; each row opens its match insight. */
export function HighConfidenceMatchesCard({
  matches,
  onView,
  className,
}: {
  matches: MatchDetail[];
  onView: (match: MatchDetail, opener: HTMLElement) => void;
  className?: string;
}) {
  const titleId = useId();

  return (
    <DashboardCard className={cn("flex flex-col overflow-hidden p-0", className)}>
      <div className="flex h-18 shrink-0 items-center justify-between gap-4 border-b border-muted px-6">
        <DashboardCardTitle id={titleId} className="text-xl leading-7 font-semibold">
          Recent High-Confidence Matches
        </DashboardCardTitle>
        {/* The full list is the Recent Matches table further down. */}
        <a
          href="#recent-matches"
          className="shrink-0 rounded-sm text-[15px] font-semibold text-primary outline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
        >
          View All
        </a>
      </div>
      <Table aria-labelledby={titleId} className={FEATURES.aiMetrics ? "min-w-140" : "min-w-110"}>
        <colgroup>
          {COLUMNS.map((column) => (
            <col
              key={column.label}
              style={{ width: `${((column.width / TOTAL_WIDTH) * 100).toFixed(2)}%` }}
            />
          ))}
        </colgroup>
        <TableHeader className="[&_tr]:border-b-0">
          <TableRow className="bg-surface hover:bg-surface">
            {COLUMNS.map((column) => (
              <TableHead
                key={column.label}
                className={cn(
                  "h-16 px-3 text-xs/4 font-semibold tracking-wider whitespace-normal text-outline uppercase first:pl-6 last:pr-6",
                  column.align,
                )}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {matches.map((match) => (
            <TableRow key={match.id} className="border-muted">
              <TableCell className="py-6 pr-3 pl-6 font-mono text-[13px] text-foreground">
                #{match.publicId}
              </TableCell>
              <TableCell className="px-3 py-6">
                <span className="flex items-center">
                  <PairAvatars users={match.users} size="sm" />
                  <span className="sr-only">{pairName(match.users)}</span>
                </span>
              </TableCell>
              <TableCell className="px-3 py-6">
                <span className="flex items-center gap-4">
                  <span
                    aria-hidden
                    className="h-1.5 w-full max-w-23 rounded-full bg-container dark:bg-muted"
                  >
                    <span
                      className="block h-full rounded-full bg-online"
                      style={{ width: `${match.compatibility}%` }}
                    />
                  </span>
                  <span className="text-[13px] font-bold tabular-nums">{match.compatibility}%</span>
                </span>
              </TableCell>
              {FEATURES.aiMetrics && (
                <TableCell className="px-3 py-6">
                  <span className="inline-block max-w-23 rounded bg-green-100 px-1.5 py-1 text-[11px]/5 font-bold tracking-wide whitespace-normal text-green-700 uppercase dark:bg-success/15 dark:text-success">
                    {confidence.format(match.aiConfidence)}% AI certainty
                  </span>
                </TableCell>
              )}
              <TableCell className="py-6 pr-6 pl-3 text-right">
                <button
                  type="button"
                  aria-label={`Open insight for match #${match.publicId}`}
                  onClick={(event) => onView(match, event.currentTarget)}
                  className="inline-flex size-8 items-center justify-center rounded-md text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <CaretRightIcon aria-hidden weight="bold" className="size-4.5" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DashboardCard>
  );
}
