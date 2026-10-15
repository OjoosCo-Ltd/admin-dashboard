import {
  CheckCircleIcon,
  ClipboardIcon,
  ClockIcon,
  TrendDownIcon,
  TrendUpIcon,
  WarningIcon,
} from "@phosphor-icons/react/ssr";
import { cn } from "cn";
import type { ComponentProps, ReactNode } from "react";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { Sparkline, type SparklineStyle } from "@/components/dashboard/sparkline";
import type { CompactKpi } from "@/types/kpi";

/** The six tile and sparkline styles of the Figma's compact KPI row, left to right. */
export type CompactKpiTone =
  | "action"
  | "success"
  | "destructive"
  | "review"
  | "action-band"
  | "destructive-band"
  // Virtual Dates' Average Rating and Upcoming Sessions tiles.
  | "amber"
  | "indigo"
  // Analytics' Matches Created and Virtual Dates cards.
  | "orange"
  | "violet";

// The two fills the dashboard's KPI cards also use (stat-card.tsx): a faint
// wash for the primary line, and a band that deepens before fading out.
const FAINT_FILL: [number, number][] = [
  [0, 0.06],
  [0.3, 0.06],
  [0.95, 0],
];
const BAND_FILL: [number, number][] = [
  [0, 0.14],
  [0.45, 0.3],
  [1, 0],
];

const ACTION_TILE = "bg-action-soft text-action dark:bg-action/25 dark:text-primary";
const DESTRUCTIVE_TILE = "bg-destructive-soft text-destructive dark:bg-destructive/15";

/** Each tone's icon tile and sparkline, as drawn in the Figma. */
/**
 * Each tone's icon tile, its sparkline, and (where the line's color needs a
 * different step per theme) the custom property that supplies it.
 */
const TONES: Record<CompactKpiTone, { tile: string; sparkline: SparklineStyle; vars?: string }> = {
  action: {
    tile: ACTION_TILE,
    sparkline: { color: "var(--chart-1)", stroke: 1, dot: 2.75, fill: FAINT_FILL },
  },
  success: {
    tile: "bg-success-soft text-success dark:bg-success/15",
    sparkline: {
      color: "var(--success)",
      stroke: 1.5,
      dot: 3.75,
      fill: [
        [0, 0.24],
        [0.87, 0],
      ],
    },
  },
  destructive: {
    tile: DESTRUCTIVE_TILE,
    sparkline: {
      color: "var(--destructive)",
      stroke: 1.5,
      dot: 3.75,
      fill: [
        [0, 0.15],
        [0.65, 0.2],
        [1, 0],
      ],
    },
  },
  review: {
    tile: "bg-[#eff8fd] text-review dark:bg-review/30 dark:text-subtle-foreground",
    // The review slate is too dark to read on the dark card, so dark mode lifts it.
    sparkline: { color: "var(--sparkline)", stroke: 1.5, dot: 3.75, fill: BAND_FILL },
    vars: "[--sparkline:#48626f] dark:[--sparkline:#94a3b8]",
  },
  "action-band": {
    tile: ACTION_TILE,
    sparkline: { color: "var(--chart-1)", stroke: 1.5, dot: 3.75, fill: BAND_FILL },
  },
  "destructive-band": {
    tile: DESTRUCTIVE_TILE,
    sparkline: {
      color: "var(--destructive)",
      stroke: 1.5,
      dot: 3.75,
      fill: [
        [0, 0.4],
        [0.3, 0.4],
        [1, 0],
      ],
    },
  },
  // No Figma card draws a trend in these two; the sparklines just follow their tile.
  amber: {
    tile: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
    sparkline: { color: "#d97706", stroke: 1.5, dot: 3.75, fill: BAND_FILL },
  },
  indigo: {
    tile: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300",
    sparkline: { color: "#4f46e5", stroke: 1.5, dot: 3.75, fill: BAND_FILL },
  },
  // From the Analytics Figma: an orange line over a barely-there wash, and a
  // violet one (the chart-3 token, which lightens in dark mode) over a band.
  // The Figma's #f97316 is 2.8:1 on white, so the light line is a step deeper.
  orange: {
    tile: "bg-[#ffedea] text-[#f97316] dark:bg-orange-500/15 dark:text-orange-300",
    sparkline: { color: "var(--sparkline)", stroke: 1.5, dot: 3.75, fill: FAINT_FILL },
    vars: "[--sparkline:#ea580c] dark:[--sparkline:#f97316]",
  },
  violet: {
    tile: "bg-[#f7f2fe] text-[#7b2fef] dark:bg-violet-500/15 dark:text-violet-300",
    sparkline: { color: "var(--chart-3)", stroke: 1.5, dot: 3.75, fill: BAND_FILL },
  },
};

const PILL = "rounded-full px-3 py-0.5 text-[17px] leading-6";

// The corner pills: AI Center's peach high point and info-blue steady state, Virtual
// Dates' emerald rating and indigo activity, and Community's smaller grey period tag.
const BADGE_TONES: Record<NonNullable<CompactKpi["badge"]>["tone"], string> = {
  warm: cn(PILL, "bg-[#ffdcbf] text-[#6a3b00] dark:bg-caution/30 dark:text-[#e9b97c]"),
  cool: cn(PILL, "bg-info-soft text-[#314a57] dark:bg-info-soft/20 dark:text-info-soft"),
  emerald: cn(PILL, "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"),
  indigo: cn(PILL, "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"),
  neutral:
    "rounded-sm bg-muted-strong px-2.5 py-0.75 text-xs/4 text-muted-foreground dark:bg-muted",
};

const STATUS_TONES: Record<NonNullable<CompactKpi["status"]>["tone"], string> = {
  steady: "text-action dark:text-primary",
  critical: "text-destructive",
};

/**
 * The Figma's "pending actions" glyph: a clipboard with a clock over its
 * corner. Phosphor has no such icon, so the clock sits on a disc of the
 * tile's color that cuts into the clipboard. Pass `discClassName` on another tile.
 */
export function PendingActionsIcon({
  className,
  // Dark: the action/25 tile composited over the dark card, so the cut-out matches it.
  discClassName = "bg-action-soft dark:bg-[#112a32]",
}: {
  className?: string;
  discClassName?: string;
}) {
  return (
    <span className={cn("relative size-5", className)}>
      <ClipboardIcon weight="bold" className="size-full" />
      <span
        className={cn("absolute -right-0.5 -bottom-0.5 flex size-2.75 rounded-full", discClassName)}
      >
        <ClockIcon weight="bold" className="size-full" />
      </span>
    </span>
  );
}

/**
 * "↗ 12%", optionally with the comparison on its own line below or after it
 * on the same line: green when favorable, red when not.
 */
function Change({
  change,
  comparison,
  className,
  ...props
}: ComponentProps<"p"> & {
  change: NonNullable<CompactKpi["change"]>;
  comparison?: "below" | "inline";
}) {
  const Arrow = change.direction === "up" ? TrendUpIcon : TrendDownIcon;
  return (
    <p
      className={cn(
        "text-xs/4 font-bold tracking-wider",
        // success-strong: the chart green (--success) is 3.3:1 on white, too faint for 12px text.
        change.favorable ? "text-success-strong dark:text-success" : "text-destructive",
        className,
      )}
      {...props}
    >
      <span className="flex items-center gap-0.75">
        <Arrow weight="bold" aria-hidden className="size-3.25 shrink-0" />
        <span className="sr-only">{change.direction === "up" ? "Up" : "Down"}</span>
        {change.label}
        {comparison === "inline" && ` ${change.comparison}`}
      </span>
      {/* Indented to the change, past the arrow. */}
      {comparison === "below" && <span className="block pl-4">{change.comparison}</span>}
    </p>
  );
}

/**
 * A compact KPI: icon tile and change on top, then label, value, the change
 * (or a status) and, when the figure has a trend, a sparkline. `tone` picks
 * the tile and sparkline colors; `labelClassName` narrows the label where the
 * Figma breaks it onto two lines. `comparison="inline"` sets "↗ 12% vs last
 * month" on one line, as the Community cards do, and `tileClassName` resizes
 * the tile there (size-10).
 */
export function CompactKpiCard({
  kpi,
  icon,
  tone,
  comparison = "below",
  labelClassName,
  tileClassName,
  className,
}: {
  kpi: CompactKpi;
  icon: ReactNode;
  tone: CompactKpiTone;
  comparison?: "below" | "inline";
  labelClassName?: string;
  tileClassName?: string;
  className?: string;
}) {
  const style = TONES[tone];
  const StatusIcon = kpi.status?.tone === "critical" ? WarningIcon : CheckCircleIcon;

  return (
    <DashboardCard className={cn("flex flex-col", style.vars, className)}>
      <div className="flex items-start justify-between gap-3">
        <span
          aria-hidden
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-md [&>svg]:size-5",
            style.tile,
            tileClassName,
          )}
        >
          {icon}
        </span>
        {kpi.badge ? (
          <span className={BADGE_TONES[kpi.badge.tone]}>
            <span className="sr-only">Status: </span>
            {kpi.badge.label}
          </span>
        ) : (
          // Repeats the change below, so screen readers skip it.
          kpi.change && <Change aria-hidden change={kpi.change} />
        )}
      </div>
      <DashboardCardTitle
        className={cn(
          "mt-2 text-xs/4 font-semibold tracking-wider text-muted-foreground",
          labelClassName,
        )}
      >
        {kpi.label}
      </DashboardCardTitle>
      <p className={cn("text-2xl/8 font-bold", kpi.valueTone === "critical" && "text-destructive")}>
        {kpi.value}
      </p>
      {kpi.change && <Change change={kpi.change} comparison={comparison} />}
      {kpi.status && (
        <p
          className={cn(
            // Unlike the change, the Figma sets the status without letter-spacing.
            "flex items-center gap-0.5 text-xs/4 font-bold",
            STATUS_TONES[kpi.status.tone],
          )}
        >
          <StatusIcon aria-hidden weight="bold" className="size-3.5 shrink-0" />
          {kpi.status.label}
        </p>
      )}
      {/* Pinned to the foot, so a row stretched by one card's two-line label keeps its sparklines level. */}
      {kpi.trend && (
        <div className="mt-auto">
          <Sparkline data={kpi.trend} style={style.sparkline} />
        </div>
      )}
    </DashboardCard>
  );
}
