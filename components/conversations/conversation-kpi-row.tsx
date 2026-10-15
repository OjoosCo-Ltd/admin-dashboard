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

/** Each conversation figure's glyph and tone, by id: the verification row's set, in this Figma's order. */
const LOOKS: Record<string, { icon: ReactNode; tone: CompactKpiTone }> = {
  "active-conversations": { icon: <PendingActionsIcon />, tone: "action" },
  "messages-today": { icon: <CheckCircleIcon weight="bold" />, tone: "success" },
  "avg-response-time": { icon: <XCircleIcon weight="bold" />, tone: "destructive" },
  "ai-starters": { icon: <TimerIcon weight="bold" />, tone: "review" },
  "flagged-conversations": { icon: <ShieldWarningIcon weight="bold" />, tone: "destructive-band" },
  "moderation-cases": { icon: <ChartBarIcon weight="bold" />, tone: "action-band" },
};

/** The conversation KPIs. This Figma sets every label on two lines, hence the narrower label. */
export function ConversationKpiRow({ kpis }: { kpis: CompactKpi[] }) {
  return (
    <section aria-label="Key metrics" className="@container">
      <div className="grid gap-6 @min-[22rem]:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-6">
        {kpis.map((kpi) => {
          const look = LOOKS[kpi.id] ?? LOOKS["active-conversations"];
          return (
            <CompactKpiCard
              key={kpi.id}
              kpi={kpi}
              icon={look.icon}
              tone={look.tone}
              labelClassName="max-w-24"
            />
          );
        })}
      </div>
    </section>
  );
}
