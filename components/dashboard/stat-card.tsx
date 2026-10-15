"use client";

import {
  ClipboardIcon,
  ClockIcon,
  ProhibitIcon,
  StarIcon,
  TrendDownIcon,
  TrendUpIcon,
} from "@phosphor-icons/react";
import { cn } from "cn";
import type { ComponentProps } from "react";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { Sparkline, type SparklineStyle } from "@/components/dashboard/sparkline";
import {
  FavoriteIcon,
  GroupIcon,
  LeaderboardIcon,
  VerifiedUserIcon,
} from "@/components/icons/app-icons";
import type { KpiStat, KpiTone } from "@/types/dashboard";

const integer = new Intl.NumberFormat("en-US");
const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 });

const TILE_TONES: Record<KpiTone, string> = {
  primary: "bg-accent text-primary",
  success: "bg-success-soft text-success dark:bg-success/15",
  "success-strong": "bg-[#e9fde8] text-success-strong dark:bg-success-strong/30 dark:text-success",
  premium: "bg-premium-soft text-premium dark:bg-premium/25 dark:text-chart-3",
  // The Users Figma's tile tints: a pink a step deeper than destructive-soft, and caution-soft.
  destructive: "bg-[#f8e7e8] text-destructive dark:bg-destructive/15",
  caution: "bg-caution-soft text-caution dark:bg-caution/30 dark:text-[#e9b97c]",
};

/**
 * Each sparkline as drawn in the Figma: its chart color, line weight, end dot
 * and fill (gradient stops as [offset, opacity], top to bottom).
 */
const SPARKLINES: Record<KpiTone, SparklineStyle> = {
  primary: {
    color: "var(--chart-1)",
    stroke: 1,
    dot: 2.75,
    fill: [
      [0, 0.06],
      [0.3, 0.06],
      [0.95, 0],
    ],
  },
  success: {
    color: "var(--chart-2)",
    stroke: 1.5,
    dot: 3.75,
    fill: [
      [0, 0.14],
      [0.5, 0.14],
      [1, 0],
    ],
  },
  "success-strong": {
    color: "var(--chart-2)",
    stroke: 1.5,
    dot: 3.75,
    fill: [
      [0, 0.24],
      [0.87, 0],
    ],
  },
  premium: {
    color: "var(--chart-3)",
    stroke: 1.5,
    dot: 3.75,
    fill: [
      [0, 0.14],
      [0.5, 0.3],
      [1, 0],
    ],
  },
  destructive: {
    color: "var(--destructive)",
    stroke: 1.5,
    dot: 3.75,
    fill: [
      [0, 0.14],
      [0.5, 0.3],
      [1, 0],
    ],
  },
  // Caution cards carry a note instead of a trend; kept for completeness. The
  // caution token is inlined by Tailwind, so there's no CSS variable for it.
  caution: { color: "#84500e", stroke: 1.5, dot: 3.75, fill: [[0, 0]] },
};

function KpiIcon({ id }: { id: string }) {
  switch (id) {
    case "total-users":
      return <GroupIcon />;
    case "verified":
    case "verified-profiles":
      return <VerifiedUserIcon />;
    case "active-today":
    case "active-matches":
      return <FavoriteIcon />;
    case "premium-subscribers":
      return <StarIcon weight="bold" className="size-5.5" />;
    case "suspended":
      return <ProhibitIcon weight="bold" className="size-6" />;
    case "pending-verification":
      // The Figma's clipboard-with-clock glyph.
      return (
        <span className="relative size-5.5">
          <ClipboardIcon weight="bold" className="size-full" />
          <span className="absolute -right-0.5 -bottom-0.5 flex size-3 rounded-full bg-caution-soft dark:bg-card">
            <ClockIcon weight="bold" className="size-full" />
          </span>
        </span>
      );
    default:
      return <LeaderboardIcon />;
  }
}

/** "↗ 8.3%" plus any trailing text: green when up, red when down. The arrow is read as a word. */
function Change({ value, className, children, ...props }: ComponentProps<"p"> & { value: number }) {
  const down = value < 0;
  const Arrow = down ? TrendDownIcon : TrendUpIcon;
  return (
    <p
      className={cn(
        "flex items-center gap-0.75 text-xs/4 font-bold tracking-wider",
        down ? "text-destructive" : "text-success",
        className,
      )}
      {...props}
    >
      <Arrow weight="bold" aria-hidden className="size-3.25 shrink-0" />
      <span className="sr-only">{down ? "Down" : "Up"}</span>
      {/* One flex item, so the text wraps; the comparison wraps as a unit, after the figure. */}
      <span>
        {percent.format(Math.abs(value) / 100)}
        {children ? (
          <>
            {" "}
            <span className="whitespace-nowrap">{children}</span>
          </>
        ) : null}
      </span>
    </p>
  );
}

/**
 * A headline KPI: icon tile and change (or a badge) on top, then label, value,
 * change vs the last period, and a sparkline or a note pinned to the bottom.
 */
export function StatCard({ stat, className }: { stat: KpiStat; className?: string }) {
  return (
    <DashboardCard className={cn("flex flex-col", className)}>
      <div className="flex items-start justify-between gap-3">
        <span
          aria-hidden
          className={cn(
            "flex size-11.5 shrink-0 items-center justify-center rounded-md",
            TILE_TONES[stat.tone],
          )}
        >
          <KpiIcon id={stat.id} />
        </span>
        {stat.badge ? (
          <span className="rounded-full bg-caution px-2.5 py-0.75 text-center text-[10px]/3.5 font-bold tracking-wide text-white uppercase">
            {stat.badge}
          </span>
        ) : (
          // Repeats the change below, so screen readers skip it.
          <Change aria-hidden value={stat.change} />
        )}
      </div>
      <DashboardCardTitle className="mt-2 text-xs/4 font-semibold tracking-wider text-muted-foreground">
        {stat.label}
      </DashboardCardTitle>
      <p className="text-2xl/8 font-bold">{integer.format(stat.value)}</p>
      <Change value={stat.change}>{stat.comparison}</Change>
      {/* Pinned to the bottom, so a row of cards lines its sparklines up. */}
      {stat.trend && (
        <div className="mt-auto">
          <Sparkline data={stat.trend} style={SPARKLINES[stat.tone]} />
        </div>
      )}
      {stat.note && (
        <p
          className={cn(
            "mt-auto pt-6 text-xs/4 font-semibold",
            stat.tone === "caution" ? "text-caution dark:text-[#e9b97c]" : "text-muted-foreground",
          )}
        >
          {stat.note}
        </p>
      )}
    </DashboardCard>
  );
}
