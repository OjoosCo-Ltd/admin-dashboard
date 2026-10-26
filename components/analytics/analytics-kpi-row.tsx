import { UserCheckIcon } from "@phosphor-icons/react/ssr";
import type { CSSProperties, ReactNode } from "react";

import { CompactKpiCard, type CompactKpiTone } from "@/components/dashboard/compact-kpi-card";
import {
  BubbleChatIcon,
  CalendarLoveIcon,
  FavoriteIcon,
  GroupIcon,
  PaymentsIcon,
} from "@/components/icons/app-icons";
import { enabled } from "@/constants/features";
import type { AnalyticsKpi, AnalyticsKpiId } from "@/types/analytics";

// The chat and calendar glyphs are drawn with 1.5-unit strokes in a 24-unit box,
// which the 20px tile thins to 1.25px; at 2 units they match the filled glyphs
// beside them (about 1.7-2px).
const EVEN_STROKE = "[&_*]:stroke-2";

// Each figure's glyph and tone. The Figma's glyphs are copied from other pages (a
// clipboard-clock on Total Users, a cancel ✕ on Matches Created, a stopwatch on Active
// Convos, a shield on Virtual Dates), so these say what each card counts, mostly with
// the sidebar's glyphs. Revenue's banknotes name no currency, as the billing currency
// is still open.
const CARDS: Record<AnalyticsKpiId, { icon: ReactNode; tone: CompactKpiTone }> = {
  "total-users": { icon: <GroupIcon />, tone: "action" },
  "active-users": { icon: <UserCheckIcon weight="bold" />, tone: "success" },
  "matches-created": { icon: <FavoriteIcon />, tone: "orange" },
  "active-conversations": { icon: <BubbleChatIcon className={EVEN_STROKE} />, tone: "review" },
  "virtual-dates": { icon: <CalendarLoveIcon className={EVEN_STROKE} />, tone: "violet" },
  revenue: { icon: <PaymentsIcon />, tone: "action-band" },
};

/**
 * The headline figures: one row from 1400px, three or two to a row below that.
 * Each basis leaves a gap's width spare and the cards grow into the row, so
 * when a figure is hidden the short last row stretches to the edge.
 */
export function AnalyticsKpiRow({ kpis }: { kpis: AnalyticsKpi[] }) {
  const cards = enabled(kpis);
  return (
    <section
      aria-label="Analytics figures"
      className="flex flex-wrap gap-4 sm:gap-6"
      style={{ "--kpi-count": cards.length } as CSSProperties}
    >
      {cards.map((kpi) => (
        <CompactKpiCard
          key={kpi.id}
          kpi={kpi}
          icon={CARDS[kpi.id].icon}
          tone={CARDS[kpi.id].tone}
          className="min-w-0 grow basis-[calc(50%-24px)] lg:basis-[calc(100%/3-24px)] min-[87.5rem]:basis-[calc(100%/var(--kpi-count)-24px)]"
        />
      ))}
    </section>
  );
}
