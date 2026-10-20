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
import type { ReportKpi, ReportKpiId } from "@/types/reports";

// Each card's glyph, tone, and where the Figma's tile differs from the tone's (Banned,
// AI Safety Alerts and Avg Resolution Time keep a slate or teal sparkline under a tinted tile).
const CARDS: Record<ReportKpiId, { icon: ReactNode; tone: CompactKpiTone; tile?: string }> = {
  open: { icon: <CalendarCheckIcon weight="bold" />, tone: "action" },
  "resolved-today": { icon: <CheckCircleIcon weight="bold" />, tone: "success" },
  "high-priority": { icon: <ChartBarIcon weight="bold" />, tone: "review" },
  suspended: { icon: <TimerIcon weight="bold" />, tone: "action-band" },
  banned: {
    icon: <StarIcon weight="fill" />,
    tone: "action",
    tile: "bg-amber-100 text-[#c76e0a] dark:bg-amber-500/15 dark:text-amber-300",
  },
  "fraud-prevented": { icon: <PaymentsIcon />, tone: "success" },
  "ai-alerts": {
    icon: <PendingActionsIcon discClassName="bg-indigo-50 dark:bg-[#1e2140]" />,
    tone: "review",
    tile: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300",
  },
  "resolution-time": {
    icon: <WarningCircleIcon weight="bold" />,
    tone: "review",
    tile: "bg-[#f8e7e8] text-destructive dark:bg-destructive/15",
  },
};

/** The eight safety figures, four to a row on wide screens. */
export function ReportKpiRow({ kpis }: { kpis: ReportKpi[] }) {
  return (
    <section aria-label="Safety figures" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => {
        const card = CARDS[kpi.id];
        return (
          <CompactKpiCard
            key={kpi.id}
            kpi={kpi}
            icon={card.icon}
            tone={card.tone}
            tileClassName={card.tile ? `size-10 ${card.tile}` : "size-10"}
          />
        );
      })}
    </section>
  );
}
