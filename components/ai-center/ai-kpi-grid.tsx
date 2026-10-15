import {
  CalendarDotsIcon,
  ChatTextIcon,
  GaugeIcon,
  ShieldPlusIcon,
  StarIcon,
  TargetIcon,
  ThumbsUpIcon,
  TimerIcon,
} from "@phosphor-icons/react/ssr";
import type { ReactNode } from "react";

import { CompactKpiCard, type CompactKpiTone } from "@/components/dashboard/compact-kpi-card";
import type { CompactKpi } from "@/types/kpi";

/**
 * Each AI figure's glyph, tone, and how wide its label runs: the Figma breaks
 * most labels after a word or two, and the two long ones after the second.
 */
const LOOKS: Record<string, { icon: ReactNode; tone: CompactKpiTone; label?: string }> = {
  "match-accuracy": { icon: <TargetIcon weight="bold" />, tone: "action" },
  "conversation-starters": { icon: <ChatTextIcon weight="bold" />, tone: "success" },
  "date-suggestions": {
    icon: <CalendarDotsIcon weight="bold" />,
    tone: "review",
    label: "max-w-40",
  },
  "recommendation-acceptance": {
    icon: <ThumbsUpIcon weight="bold" />,
    tone: "action",
    label: "max-w-40",
  },
  "avg-response": { icon: <GaugeIcon weight="bold" />, tone: "action" },
  satisfaction: { icon: <StarIcon weight="fill" />, tone: "success" },
  "requests-today": { icon: <TimerIcon weight="bold" />, tone: "review" },
  "system-health": { icon: <ShieldPlusIcon weight="bold" />, tone: "action" },
};

/** The AI Center's eight KPIs: four across on wide screens, two on tablets, one on phones. */
export function AiKpiGrid({ kpis }: { kpis: CompactKpi[] }) {
  return (
    <section aria-label="Key metrics" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => {
        const look = LOOKS[kpi.id] ?? LOOKS["match-accuracy"];
        return (
          <CompactKpiCard
            key={kpi.id}
            kpi={kpi}
            icon={look.icon}
            tone={look.tone}
            labelClassName={look.label ?? "max-w-24"}
          />
        );
      })}
    </section>
  );
}
