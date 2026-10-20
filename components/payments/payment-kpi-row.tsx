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

/** Each payment figure's glyph and tone, by id: the verification row's set, as this Figma reuses it. */
const LOOKS: Record<string, { icon: ReactNode; tone: CompactKpiTone }> = {
  "total-revenue": { icon: <PendingActionsIcon />, tone: "action" },
  "todays-revenue": { icon: <CheckCircleIcon weight="bold" />, tone: "success" },
  "net-revenue": { icon: <XCircleIcon weight="bold" />, tone: "destructive" },
  "successful-payments": { icon: <TimerIcon weight="bold" />, tone: "review" },
  "failed-payments": { icon: <ShieldWarningIcon weight="bold" />, tone: "destructive-band" },
  refunds: { icon: <ChartBarIcon weight="bold" />, tone: "action-band" },
};

/** The six payment KPIs, each with its sparkline: six across on wide screens, fewer below. */
export function PaymentKpiRow({ kpis }: { kpis: CompactKpi[] }) {
  return (
    <section aria-label="Key metrics" className="@container">
      <div className="grid gap-6 @min-[22rem]:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-6">
        {kpis.map((kpi) => {
          const look = LOOKS[kpi.id] ?? LOOKS["total-revenue"];
          // "Successful Payments" wraps by itself at the Figma's card width. Forcing the
          // break on wider cards would only make its row taller than the rest.
          return <CompactKpiCard key={kpi.id} kpi={kpi} icon={look.icon} tone={look.tone} />;
        })}
      </div>
    </section>
  );
}
