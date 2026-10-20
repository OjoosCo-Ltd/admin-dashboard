import type { Icon } from "@phosphor-icons/react";
import {
  LightbulbIcon,
  SparkleIcon,
  TrendUpIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react/ssr";
import { cn } from "cn";

import { HAIRLINE_CARD } from "@/components/analytics/analytics-format";
import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import type { AnalyticsInsight } from "@/types/analytics";

/**
 * Each kind's glyph and tile, sampled from the Analytics Figma: mint for
 * growth, sky for a feature, peach for conversion and red for an alert. The
 * kind is also spelled out for screen readers, so color isn't the only signal.
 */
const KINDS: Record<
  AnalyticsInsight["kind"],
  { label: string; icon: Icon; weight: "regular" | "bold"; tile: string }
> = {
  growth: {
    label: "Growth",
    icon: TrendUpIcon,
    weight: "bold",
    tile: "bg-[#d1fae5] text-[#065f46] dark:bg-emerald-400/15 dark:text-emerald-300",
  },
  feature: {
    label: "Feature",
    icon: LightbulbIcon,
    weight: "regular",
    tile: "bg-[#bfe9ff] text-action dark:bg-primary/15 dark:text-primary",
  },
  conversion: {
    label: "Conversion",
    icon: SparkleIcon,
    weight: "regular",
    tile: "bg-[#ffdcbf] text-caution dark:bg-caution/30 dark:text-[#e9b97c]",
  },
  alert: {
    label: "Alert",
    icon: WarningCircleIcon,
    weight: "regular",
    tile: "bg-destructive-container text-destructive dark:bg-destructive/15",
  },
};

/** Four automated observations about the period, each on its own bordered tile. */
export function AnalyticsInsightsCard({
  insights,
  className,
}: {
  insights: AnalyticsInsight[];
  className?: string;
}) {
  return (
    // A size container, so the tiles pair up by the card's own width: from md
    // the sidebar takes 277px, and the viewport overstates the room.
    <DashboardCard className={cn(HAIRLINE_CARD, "@container", className)}>
      <DashboardCardTitle id="analytics-insights-title" className="text-lg leading-7 font-bold">
        Analytics Insights
      </DashboardCardTitle>
      <ul aria-labelledby="analytics-insights-title" className="mt-6 grid gap-4 @lg:grid-cols-2">
        {insights.map((insight) => {
          const kind = KINDS[insight.kind];
          const Glyph = kind.icon;
          return (
            <li
              key={insight.id}
              className="flex items-start gap-4 rounded-xl border border-border/20 p-4 dark:border-border"
            >
              <span
                aria-hidden
                className={cn(
                  "flex size-7.5 shrink-0 items-center justify-center rounded-lg",
                  kind.tile,
                )}
              >
                <Glyph weight={kind.weight} className="size-4" />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm leading-5 font-semibold">
                  <span className="sr-only">{kind.label}: </span>
                  {insight.title}
                </h3>
                {/* The Figma's 230px measure wraps each sample body to three lines. From
                    2xl the tiles outgrow the frame's, so the body takes their full width. */}
                <p className="mt-0.5 max-w-57.5 text-xs leading-5 text-muted-foreground 2xl:max-w-none">
                  {insight.body}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </DashboardCard>
  );
}
