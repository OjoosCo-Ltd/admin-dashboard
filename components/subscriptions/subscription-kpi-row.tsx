import {
  ChartBarIcon,
  CheckCircleIcon,
  ShieldWarningIcon,
  TimerIcon,
  XCircleIcon,
} from "@phosphor-icons/react/ssr";
import type { ReactNode } from "react";

import {
  CompactKpiCard,
  type CompactKpiTone,
  PendingActionsIcon,
} from "@/components/dashboard/compact-kpi-card";
import type { CompactKpi } from "@/types/kpi";

/** Each subscription figure's glyph and tone, by id: the verification row's set, as this Figma reuses it. */
const LOOKS: Record<string, { icon: ReactNode; tone: CompactKpiTone }> = {
  "total-subscribers": { icon: <PendingActionsIcon />, tone: "action" },
  mrr: { icon: <CheckCircleIcon weight="bold" />, tone: "success" },
  "active-subs": { icon: <XCircleIcon weight="bold" />, tone: "destructive" },
  "new-subs": { icon: <TimerIcon weight="bold" />, tone: "review" },
  "churn-rate": { icon: <ShieldWarningIcon weight="bold" />, tone: "destructive-band" },
  "renewal-rate": { icon: <ChartBarIcon weight="bold" />, tone: "action-band" },
};

/** The six subscription KPIs, each with its sparkline: six across on wide screens, fewer below. */
export function SubscriptionKpiRow({ kpis }: { kpis: CompactKpi[] }) {
  return (
    <section aria-label="Key metrics" className="@container">
      <div className="grid gap-6 @min-[22rem]:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-6">
        {kpis.map((kpi) => {
          const look = LOOKS[kpi.id] ?? LOOKS["total-subscribers"];
          return <CompactKpiCard key={kpi.id} kpi={kpi} icon={look.icon} tone={look.tone} />;
        })}
      </div>
    </section>
  );
}
