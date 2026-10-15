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

/** Each match figure's glyph and tone, by id: the Verification row's six, relabeled. */
const LOOKS: Record<string, { icon: ReactNode; tone: CompactKpiTone }> = {
  "total-matches": { icon: <PendingActionsIcon />, tone: "action" },
  "created-today": { icon: <CheckCircleIcon weight="bold" />, tone: "success" },
  "acceptance-rate": { icon: <XCircleIcon weight="bold" />, tone: "destructive" },
  "active-chats": { icon: <TimerIcon weight="bold" />, tone: "review" },
  "virtual-dates": { icon: <ChartBarIcon weight="bold" />, tone: "action-band" },
  "avg-comp-score": { icon: <ShieldWarningIcon weight="bold" />, tone: "destructive-band" },
};

/** The match KPIs: six across where each card keeps the Figma's 165px, fewer on narrower screens. */
export function MatchesKpiRow({ kpis }: { kpis: CompactKpi[] }) {
  return (
    <section aria-label="Key metrics" className="@container">
      <div className="grid gap-6 @min-[22rem]:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-6">
        {kpis.map((kpi) => {
          const look = LOOKS[kpi.id] ?? LOOKS["total-matches"];
          return <CompactKpiCard key={kpi.id} kpi={kpi} icon={look.icon} tone={look.tone} />;
        })}
      </div>
    </section>
  );
}
