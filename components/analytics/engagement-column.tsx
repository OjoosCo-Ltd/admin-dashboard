import { cn } from "cn";

import {
  formatDuration,
  formatPercent,
  HAIRLINE_CARD,
} from "@/components/analytics/analytics-format";
import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import type { AlgorithmPerformance, EngagementSummary } from "@/types/analytics";

const VERDICT_LABEL: Record<EngagementSummary["stickinessVerdict"], string> = {
  healthy: "Healthy",
  watch: "Watch",
  low: "Low",
};

/**
 * ⚠️ PROVISIONAL: the stickiness meter's full track. The Figma reads DAU/MAU
 * against 50%, not 100%: even very sticky apps rarely pass half, so on a
 * 0-100 track a healthy ratio would look weak.
 */
const STICKINESS_SCALE_MAX = 50;

/**
 * The column beside User Growth: the stickiness ratio on the brand card, the
 * session figures, and how the matching algorithm is doing. The grid stretches
 * it to the row, and Algorithm Performance takes up any extra height.
 */
export function EngagementColumn({
  engagement,
  algorithm,
  className,
}: {
  engagement: EngagementSummary;
  algorithm: AlgorithmPerformance;
  className?: string;
}) {
  const stickiness = formatPercent(engagement.stickiness);
  const stickinessOnScale = Math.min(engagement.stickiness, STICKINESS_SCALE_MAX);
  const verdict = VERDICT_LABEL[engagement.stickinessVerdict];
  // Two scores on the same 0-100 scale share one accent: a second hue would
  // suggest a difference between them that isn't there.
  const algorithmMeters = [
    {
      id: "prediction-accuracy",
      label: "Prediction Accuracy",
      value: algorithm.predictionAccuracy,
    },
    { id: "avg-match-score", label: "Avg Match Score", value: algorithm.avgMatchScore },
  ];

  return (
    <div
      className={cn(
        "grid gap-4 lg:grid-cols-2 xl:grid-cols-1 xl:grid-rows-[auto_auto_1fr]",
        className,
      )}
    >
      <DashboardCard className="border-0 bg-action text-white dark:bg-brand-800">
        <DashboardCardTitle className="text-sm leading-5 font-medium text-white/85">
          Stickiness Ratio
        </DashboardCardTitle>
        <p className="mt-1 text-3xl leading-9 font-bold">{stickiness}</p>
        <div className="mt-6 flex items-center justify-between gap-3 text-xs leading-4 font-semibold tracking-wider text-white/80 uppercase">
          <span>
            <span aria-hidden>DAU / MAU</span>
            <span className="sr-only">Daily over monthly active users</span>
          </span>
          <span>{verdict}</span>
        </div>
        <div
          role="meter"
          aria-label="Stickiness ratio"
          aria-valuenow={stickinessOnScale}
          aria-valuemin={0}
          aria-valuemax={STICKINESS_SCALE_MAX}
          aria-valuetext={`${stickiness}, ${verdict.toLowerCase()}`}
          className="mt-3 h-2 overflow-hidden rounded-full bg-white/20"
        >
          <div
            className="h-full rounded-full bg-[#bfe9ff]"
            style={{ width: `${(stickinessOnScale / STICKINESS_SCALE_MAX) * 100}%` }}
          />
        </div>
      </DashboardCard>

      <DashboardCard className={cn("flex flex-col justify-center", HAIRLINE_CARD)}>
        <h2 className="sr-only">Sessions and retention</h2>
        <dl className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-sm leading-5 text-muted-foreground">Avg Session Duration</dt>
            <dd className="text-lg leading-7 font-semibold">
              {formatDuration(engagement.avgSessionSeconds)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-sm leading-5 text-muted-foreground">Returning Users</dt>
            <dd className="text-lg leading-7 font-semibold">
              {formatPercent(engagement.returningUsers)}
            </dd>
          </div>
        </dl>
      </DashboardCard>

      <DashboardCard className={cn(HAIRLINE_CARD, "lg:col-span-2 xl:col-span-1")}>
        <DashboardCardTitle className="text-xl leading-7 font-semibold">
          Algorithm Performance
        </DashboardCardTitle>
        <ul className="mt-4 flex flex-col gap-4">
          {algorithmMeters.map((meter) => (
            <li key={meter.id}>
              <div className="flex items-baseline justify-between gap-3 text-[11px] leading-4">
                <span id={`analytics-${meter.id}`} className="text-muted-foreground">
                  {meter.label}
                </span>
                <span className="font-semibold text-foreground tabular-nums">
                  {formatPercent(meter.value)}
                </span>
              </div>
              <div
                role="meter"
                aria-labelledby={`analytics-${meter.id}`}
                aria-valuenow={meter.value}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuetext={formatPercent(meter.value)}
                className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-muted-strong dark:bg-muted"
              >
                <div
                  className="h-full rounded-full bg-action dark:bg-primary"
                  style={{ width: `${meter.value}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </DashboardCard>
    </div>
  );
}
