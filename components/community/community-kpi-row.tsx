import {
  CalendarDotsIcon,
  ChatTextIcon,
  TargetIcon,
  ThumbsUpIcon,
} from "@phosphor-icons/react/ssr";
import { cn } from "cn";
import type { ReactNode } from "react";

import { CompactKpiCard, type CompactKpiTone } from "@/components/dashboard/compact-kpi-card";
import type { CompactKpi } from "@/types/kpi";

// The four tiles every community Figma reuses, whatever the figure: a teal
// target, a green message, a slate calendar and a teal thumbs-up.
const TILES = {
  target: { icon: <TargetIcon weight="bold" />, tone: "action" },
  chat: { icon: <ChatTextIcon weight="bold" />, tone: "success" },
  calendar: { icon: <CalendarDotsIcon weight="bold" />, tone: "review" },
  thumbs: { icon: <ThumbsUpIcon weight="bold" />, tone: "action" },
} satisfies Record<string, { icon: ReactNode; tone: CompactKpiTone }>;

export type KpiTile = keyof typeof TILES;

/** The Groups, Events and Moderation tabs' order. A group's pages lead with the message. */
const SECTION_ORDER: KpiTile[] = ["target", "chat", "calendar", "thumbs"];

/**
 * A community KPI row: the compact cards with a 40px tile and the comparison
 * beside the change ("↗ 12% vs last month"). Four across on the Groups tab and
 * a group's overview, three on its members and reports.
 */
export function CommunityKpiRow({
  kpis,
  tiles = SECTION_ORDER,
}: {
  kpis: CompactKpi[];
  /** Each card's tile, in order. */
  tiles?: KpiTile[];
}) {
  return (
    <section aria-label="Key metrics" className="@container">
      <div
        className={cn(
          "grid gap-6",
          kpis.length === 4
            ? "@min-[30rem]:grid-cols-2 @4xl:grid-cols-4"
            : "@min-[30rem]:grid-cols-2 @3xl:grid-cols-3",
        )}
      >
        {kpis.map((kpi, index) => {
          const look = TILES[tiles[index] ?? "target"];
          return (
            <CompactKpiCard
              key={kpi.id}
              kpi={kpi}
              icon={look.icon}
              tone={look.tone}
              comparison="inline"
              tileClassName="size-10"
              // A third card spans the row at two columns rather than sit alone.
              className={cn(kpis.length === 3 && "last:@min-[30rem]:@max-3xl:col-span-2")}
            />
          );
        })}
      </div>
    </section>
  );
}
