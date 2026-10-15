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

/** Each verification figure's glyph and tone, by id. */
const LOOKS: Record<string, { icon: ReactNode; tone: CompactKpiTone }> = {
  pending: { icon: <PendingActionsIcon />, tone: "action" },
  approved: { icon: <CheckCircleIcon weight="bold" />, tone: "success" },
  rejected: { icon: <XCircleIcon weight="bold" />, tone: "destructive" },
  "review-time": { icon: <TimerIcon weight="bold" />, tone: "review" },
  "success-rate": { icon: <ChartBarIcon weight="bold" />, tone: "action-band" },
  fraud: { icon: <ShieldWarningIcon weight="bold" />, tone: "destructive-band" },
};

/** The verification KPIs: six across where each card keeps the Figma's 165px, fewer on narrower screens. */
export function VerificationKpiRow({ kpis }: { kpis: CompactKpi[] }) {
  return (
    <section aria-label="Key metrics" className="@container">
      <div className="grid gap-6 @min-[22rem]:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-6">
        {kpis.map((kpi) => {
          const look = LOOKS[kpi.id] ?? LOOKS.pending;
          return <CompactKpiCard key={kpi.id} kpi={kpi} icon={look.icon} tone={look.tone} />;
        })}
      </div>
    </section>
  );
}
