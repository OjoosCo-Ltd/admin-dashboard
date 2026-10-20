"use client";

import { cn } from "cn";
import { useState } from "react";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { SegmentedControl } from "@/components/subscriptions/segmented-control";
import type { ChurnPeriod, ChurnReason } from "@/types/subscriptions";

const PERIODS = [
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
  { value: "1y", label: "1 Year" },
] as const satisfies readonly { value: ChurnPeriod; label: string }[];

/** The Figma's bar for each reason: red, amber, pale slate and grey. */
const BAR_TONES: Record<ChurnReason["id"], string> = {
  voluntary: "bg-[#b3261e] dark:bg-destructive",
  involuntary: "bg-[#f6b26b]",
  expired: "bg-[#aac4d3]",
  cancelled: "bg-outline",
};

const count = new Intl.NumberFormat("en-GB");

/** Why members left over the chosen period, each reason's bar sized by its share of all of them. */
export function ChurnCard({
  data,
  className,
}: {
  data: Record<ChurnPeriod, ChurnReason[]>;
  className?: string;
}) {
  const [period, setPeriod] = useState<ChurnPeriod>("30d");
  const reasons = data[period];
  const total = reasons.reduce((sum, reason) => sum + reason.count, 0);

  return (
    <DashboardCard className={cn("flex flex-col px-8 py-8 max-sm:px-5", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DashboardCardTitle className="text-xl/7 font-semibold">
          Subscription Churn
        </DashboardCardTitle>
        <SegmentedControl
          label="Churn period"
          options={PERIODS}
          value={period}
          onChange={setPeriod}
        />
      </div>
      <ul className="mt-7 flex flex-col gap-5">
        {reasons.map((reason) => {
          const share = total ? (reason.count / total) * 100 : 0;
          return (
            <li key={reason.id}>
              <div className="flex items-baseline justify-between gap-3 text-[13px]/5">
                <span id={`churn-${reason.id}`}>{reason.label}</span>
                <span className="tabular-nums">{count.format(reason.count)}</span>
              </div>
              <div
                role="meter"
                aria-labelledby={`churn-${reason.id}`}
                aria-valuenow={Math.round(share)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuetext={`${Math.round(share)}% of churn`}
                className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted dark:bg-muted/60"
              >
                <div
                  className={cn("h-full rounded-full", BAR_TONES[reason.id])}
                  style={{ width: `${share}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </DashboardCard>
  );
}
