import { cn } from "cn";
import { useId } from "react";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { FEATURES } from "@/constants/features";
import type { TrustSafety } from "@/types/dashboard";

const count = new Intl.NumberFormat("en-US");
const change = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});
const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 });

/** Fraud and report counts, plus how much of the verification queue is getting through. */
export function TrustSafetyCard({ data }: { data: TrustSafety }) {
  const throughputId = useId();
  const throughput = Math.min(100, Math.max(0, data.verificationThroughput));

  return (
    <DashboardCard className="@container">
      <DashboardCardTitle>Trust & Safety</DashboardCardTitle>

      <dl
        className={cn(
          "mx-auto mt-6 grid w-full max-w-63.5 gap-3",
          FEATURES.fraudSignals && "@min-[15rem]:grid-cols-2",
        )}
      >
        {FEATURES.fraudSignals && (
          <SafetyTile
            label="Fraud Attempts"
            value={count.format(data.fraudAttempts)}
            valueClassName="text-destructive"
            note={`${change.format(data.fraudChange / 100)} vs last week`}
            // Fewer fraud attempts is the good direction.
            noteClassName={cn(
              "font-semibold",
              data.fraudChange < 0 && "text-success",
              data.fraudChange > 0 && "text-destructive",
              data.fraudChange === 0 && "text-muted-foreground",
            )}
          />
        )}
        <SafetyTile
          label="Reported Profiles"
          value={count.format(data.reportedProfiles)}
          note="Awaiting review"
          noteClassName="text-muted-foreground"
        />
      </dl>

      <div className="mt-6 flex items-baseline justify-between gap-3 text-xs font-semibold tracking-wider">
        <span id={throughputId}>Verification Throughput</span>
        {/* The progress bar already exposes the value to assistive tech. */}
        <span aria-hidden>{percent.format(throughput / 100)}</span>
      </div>
      <div
        role="progressbar"
        aria-labelledby={throughputId}
        aria-valuenow={throughput}
        aria-valuemin={0}
        aria-valuemax={100}
        className="mt-1 h-1.5 rounded-xs bg-muted"
      >
        <div className="h-full bg-primary" style={{ width: `${throughput}%` }} />
      </div>
    </DashboardCard>
  );
}

function SafetyTile({
  label,
  value,
  valueClassName,
  note,
  noteClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  note: string;
  noteClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-muted p-3">
      <dt className="text-[11px] leading-3.5 text-muted-foreground">{label}</dt>
      <dd className={cn("text-xl font-bold", valueClassName)}>{value}</dd>
      <dd className={cn("text-[10px] leading-4", noteClassName)}>{note}</dd>
    </div>
  );
}
