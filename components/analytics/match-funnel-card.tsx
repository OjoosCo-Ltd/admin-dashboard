import { cn } from "cn";

import {
  formatCompactCount,
  formatCount,
  formatPercent,
  FUNNEL_RAMP,
  HAIRLINE_CARD,
  RAMP_VARS,
} from "@/components/analytics/analytics-format";
import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { FunnelStage } from "@/types/analytics";

/** Whole percents from 10% up and one decimal below, as the Figma prints them. */
const formatShare = (share: number) => formatPercent(share, share < 10 ? 1 : 0);

/** The five stages of last month's matches, from generated to a virtual date. */
export function MatchFunnelCard({
  stages,
  className,
}: {
  stages: FunnelStage[];
  className?: string;
}) {
  const generated = stages[0]?.count ?? 0;
  const rows = stages.map((stage, index) => {
    const previous = index > 0 ? stages[index - 1] : undefined;
    return {
      ...stage,
      share: generated ? (stage.count / generated) * 100 : 0,
      previous: previous
        ? { label: previous.label, rate: previous.count ? (stage.count / previous.count) * 100 : 0 }
        : undefined,
    };
  });

  return (
    <DashboardCard className={cn("flex flex-col", HAIRLINE_CARD, RAMP_VARS, className)}>
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <DashboardCardTitle id="match-funnel-title" className="text-lg leading-7 font-bold">
          Match Funnel Performance
        </DashboardCardTitle>
        <span className="mt-px shrink-0 rounded-sm bg-action-soft px-2 py-0.75 text-[11px] leading-4 whitespace-nowrap text-action dark:bg-action/30 dark:text-primary">
          Past 30 Days
        </span>
      </div>

      {/* The bars are held to 24px where the Figma draws 32, so the wider gaps keep its 80px row pitch and card height. */}
      <ol
        aria-labelledby="match-funnel-title"
        className="mt-8 flex flex-1 flex-col justify-between gap-8"
      >
        {rows.map((row, index) => (
          <li key={row.id}>
            <Tooltip>
              {/* The ring stands off the trigger: flush, it would run into the bar's teal. */}
              <TooltipTrigger className="group block w-full rounded-md text-left outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card">
                <span className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm leading-5">
                  <span>{row.label}</span>
                  <span className="font-bold whitespace-nowrap">
                    {formatShare(row.share)} ({formatCompactCount(row.count)})
                  </span>
                </span>
                {/* Drawn to scale from one baseline, so each length is the stage's share of generated matches. */}
                <span
                  aria-hidden
                  className="mt-1 block h-6 rounded-r-[4px] transition-opacity group-hover:opacity-80 group-focus-visible:opacity-80"
                  style={{
                    width: `${Math.max(row.share, 1)}%`,
                    backgroundColor: FUNNEL_RAMP[row.id],
                  }}
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="flex-col items-start gap-0.5 py-2">
                <span className="text-sm font-semibold tabular-nums">
                  {formatCount(row.count)} matches
                </span>
                <span>{row.label}</span>
                <span className="opacity-80">
                  {formatShare(row.share)} of generated matches
                  {/* The second stage's previous stage is the first, so its rate would repeat the share. */}
                  {index > 1 && row.previous
                    ? ` · ${formatPercent(row.previous.rate, 0)} of ${row.previous.label.toLowerCase()}`
                    : null}
                </span>
              </TooltipContent>
            </Tooltip>
          </li>
        ))}
      </ol>

      <div className="sr-only">
        <table>
          <caption>Match funnel over the past 30 days</caption>
          <thead>
            <tr>
              <th scope="col">Stage</th>
              <th scope="col">Matches</th>
              <th scope="col">Share of generated matches</th>
              <th scope="col">Share of the previous stage</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <th scope="row">{row.label}</th>
                <td>{formatCount(row.count)}</td>
                <td>{formatPercent(row.share)}</td>
                <td>{row.previous ? formatPercent(row.previous.rate) : "Not applicable"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
}
