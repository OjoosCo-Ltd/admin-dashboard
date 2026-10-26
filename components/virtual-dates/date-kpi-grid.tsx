import {
  CalendarCheckIcon,
  ChartBarIcon,
  CheckCircleIcon,
  StarIcon,
  TimerIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react/ssr";
import { cn } from "cn";
import type { ReactNode } from "react";

import {
  CompactKpiCard,
  type CompactKpiTone,
  PendingActionsIcon,
} from "@/components/dashboard/compact-kpi-card";
import { PaymentsIcon } from "@/components/icons/app-icons";
import { enabled } from "@/constants/features";
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

// Each basis leaves a gap's width spare and the cards grow into the row, so a
// short last row stretches to the edge rather than leaving a hole.
const TWO_UP = "basis-full sm:basis-[calc(50%-24px)]";
const FOUR_UP = "xl:basis-[calc(25%-24px)]";

/**
 * The wide rows, by how many figures are on: five sit three over two, then
 * five across from 1400px, where each corner pill has room beside its tile;
 * six sit three to a row. Every other count sits four to a row.
 */
const WIDE_ROWS: Partial<Record<number, string>> = {
  5: "lg:basis-[calc(100%/3-24px)] min-[87.5rem]:basis-[calc(20%-24px)]",
  6: "xl:basis-[calc(100%/3-24px)]",
};

/** The virtual-date KPIs: four across on wide screens, two on tablets, one on phones. */
export function DateKpiGrid({ kpis }: { kpis: CompactKpi[] }) {
  const cards = enabled(kpis);
  const wide = WIDE_ROWS[cards.length] ?? FOUR_UP;
  return (
    <section aria-label="Key metrics" className="flex flex-wrap gap-6">
      {cards.map((kpi) => {
        const look = LOOKS[kpi.id] ?? LOOKS.scheduled;
        return (
          <CompactKpiCard
            key={kpi.id}
            kpi={kpi}
            icon={look.icon}
            tone={look.tone}
            className={cn("min-w-0 grow", TWO_UP, wide)}
          />
        );
      })}
    </section>
  );
}
