import { VideoCameraIcon, WarningIcon } from "@phosphor-icons/react/ssr";
import { cn } from "cn";
import type { ReactNode } from "react";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { PaymentsIcon, PsychologyIcon } from "@/components/icons/app-icons";
import type { OpsMetric } from "@/types/dashboard";

const ICONS: Record<OpsMetric["id"], ReactNode> = {
  revenue: <PaymentsIcon className="text-primary" />,
  "ai-match": <PsychologyIcon className="text-primary" />,
  "virtual-dates": (
    <VideoCameraIcon weight="bold" className="size-5.5 text-success-strong dark:text-success" />
  ),
  "pending-verifications": <WarningIcon weight="bold" className="size-6 text-attention" />,
};

const NOTE_TONES: Record<OpsMetric["tone"], string> = {
  positive: "font-bold text-success",
  primary: "font-bold text-primary",
  neutral: "font-medium text-muted-foreground",
  attention: "font-medium text-attention",
};

/** An operations figure under the KPIs: icon and two-line label, value and a note. Attention tints the card. */
export function MetricCard({ metric, className }: { metric: OpsMetric; className?: string }) {
  const attention = metric.tone === "attention";

  return (
    <DashboardCard
      className={cn(
        attention && "border-attention-border bg-attention-soft dark:bg-attention/10",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span aria-hidden className="flex size-6 shrink-0 items-center">
          {ICONS[metric.id]}
        </span>
        {/* The Figma sets every label on two lines. */}
        <DashboardCardTitle className="max-w-30 text-xs/4 font-semibold tracking-wider text-muted-foreground">
          {metric.label}
        </DashboardCardTitle>
      </div>
      <p className={cn("mt-2.25 text-2xl/8 font-bold", attention && "text-attention")}>
        {metric.value}
      </p>
      <p className={cn("mt-0.75 flex items-center gap-2 text-[11px]/3.5", NOTE_TONES[metric.tone])}>
        {attention ? (
          <span aria-hidden className="size-2 shrink-0 rounded-full bg-current" />
        ) : null}
        {metric.note}
      </p>
    </DashboardCard>
  );
}
