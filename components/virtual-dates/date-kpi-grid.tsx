import {
  CalendarCheckIcon,
  ChartBarIcon,
  CheckCircleIcon,
  StarIcon,
  TimerIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react/ssr";
import type { ReactNode } from "react";

import {
  CompactKpiCard,
  type CompactKpiTone,
  PendingActionsIcon,
} from "@/components/dashboard/compact-kpi-card";
import { PaymentsIcon } from "@/components/icons/app-icons";
import type { CompactKpi } from "@/types/kpi";

/** Each virtual-date figure's glyph and tone, by id. */
const LOOKS: Record<string, { icon: ReactNode; tone: CompactKpiTone }> = {
  scheduled: { icon: <CalendarCheckIcon weight="bold" />, tone: "action" },
  completed: { icon: <CheckCircleIcon weight="bold" />, tone: "success" },
  "completion-rate": { icon: <ChartBarIcon weight="bold" />, tone: "review" },
  "avg-duration": { icon: <TimerIcon weight="bold" />, tone: "action" },
  "avg-rating": { icon: <StarIcon weight="fill" />, tone: "amber" },
  revenue: { icon: <PaymentsIcon className="h-4 w-auto" />, tone: "success" },
  upcoming: {
    icon: <PendingActionsIcon discClassName="bg-indigo-50 dark:bg-[#22223a]" />,
    tone: "indigo",
  },
  reported: { icon: <WarningCircleIcon weight="bold" />, tone: "destructive" },
};

/** The virtual-date KPIs: four across on wide screens, two on tablets, one on phones. */
export function DateKpiGrid({ kpis }: { kpis: CompactKpi[] }) {
  return (
    <section aria-label="Key metrics" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => {
        const look = LOOKS[kpi.id] ?? LOOKS.scheduled;
        return <CompactKpiCard key={kpi.id} kpi={kpi} icon={look.icon} tone={look.tone} />;
      })}
    </section>
  );
}
