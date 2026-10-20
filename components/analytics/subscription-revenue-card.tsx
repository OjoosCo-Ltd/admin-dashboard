"use client";

import { cn } from "cn";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import {
  HAIRLINE_CARD,
  niceStep,
  RAMP_VARS,
  TIER_RAMP,
} from "@/components/analytics/analytics-format";
import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { formatCompactMoney, formatWholeMoney } from "@/libs/money";
import type { RevenuePoint, SubscriptionRevenue } from "@/types/analytics";

type RevenueView = "weekly" | "monthly";

const VIEWS: { value: RevenueView; label: string; periods: number; noun: string }[] = [
  { value: "weekly", label: "Weekly", periods: 8, noun: "week" },
  { value: "monthly", label: "Monthly", periods: 7, noun: "month" },
];

/** The paid plans, in the order they stack up from the baseline (Free brings in nothing). */
const TIERS = [
  { key: "elite", label: "Elite" },
  { key: "premium", label: "Premium" },
  { key: "basic", label: "Basic" },
] as const;

const totalOf = (point: RevenuePoint) => point.elite + point.premium + point.basic;

/** About three clean steps (1, 2, 2.5 or 5 × 10ⁿ), topping out just above the tallest column. */
function niceScale(max: number, steps = 3) {
  const step = niceStep(Math.max(max, 1) / steps);
  const top = Math.ceil(max / step) * step || step;
  return { top, ticks: Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step) };
}

const percent = (value: number, of: number) => `${(value / of) * 100}%`;

/** The y-axis gutter: the money ticks sit in it, and the columns start after it. */
const GUTTER = "2.5rem";

/** The readout's width: placing it left of a column and keeping it inside the plot both subtract it. */
const TOOLTIP_WIDTH = "11rem";

/**
 * Monthly recurring revenue by paid tier, as stacked columns per month or week.
 * The Figma shades whole columns darker where taller; here each column is split
 * by tier in the User Tiers card's colors, with a legend and a money axis.
 */
export function SubscriptionRevenueCard({
  data,
  className,
}: {
  data: SubscriptionRevenue;
  className?: string;
}) {
  const [view, setView] = useState<RevenueView>("monthly");
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  // The column that holds the chart's one tab stop; the arrow keys move it.
  const [cursor, setCursor] = useState(0);
  const columns = useRef<(HTMLDivElement | null)[]>([]);

  const config = VIEWS.find((option) => option.value === view) ?? VIEWS[1];
  const points = data[view].slice(-config.periods);
  const { top, ticks } = niceScale(Math.max(0, ...points.map(totalOf)));
  const tabStop = Math.min(cursor, points.length - 1);
  const activeIndex = hovered ?? focused;
  const active = activeIndex === null ? undefined : points[activeIndex];

  // A hover readout covers the neighbouring columns, so Escape dismisses it
  // wherever focus is. A focused column's readout is closed by its own key handler.
  useEffect(() => {
    if (hovered === null) return;
    const dismiss = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setHovered(null);
    };
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, [hovered]);

  function moveFocus(event: KeyboardEvent<HTMLDivElement>, index: number) {
    if (event.key === "Escape") {
      setHovered(null);
      setFocused(null);
      return;
    }
    const last = points.length - 1;
    const next =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? Math.min(index + 1, last)
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? Math.max(index - 1, 0)
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    setCursor(next);
    columns.current[next]?.focus();
  }

  return (
    <DashboardCard
      className={cn("@container flex flex-col p-6 sm:p-8", HAIRLINE_CARD, RAMP_VARS, className)}
    >
      {/* One row only from 27rem: in a narrower card the toggle and legend
          squeeze the title onto two lines. */}
      <div className="flex flex-col gap-3 @[27rem]:flex-row @[27rem]:items-start @[27rem]:justify-between @[27rem]:gap-4">
        <div className="min-w-0">
          <DashboardCardTitle className="text-xl leading-7 font-bold">
            Subscription Revenue
          </DashboardCardTitle>
          <p className="max-w-56 text-sm leading-5 text-muted-foreground">
            Monthly recurring revenue (MRR) by tier.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 @[27rem]:items-end">
          <div role="group" aria-label="Revenue period" className="flex gap-2">
            {VIEWS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={option.value === view}
                onClick={() => setView(option.value)}
                className={cn(
                  // The offset keeps the ring apart from the selected pill's teal fill.
                  "h-6 rounded-full px-3.25 text-xs leading-none font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                  option.value === view
                    ? "bg-action text-white"
                    : "bg-container text-foreground hover:bg-muted-strong dark:bg-input/30 dark:inset-ring dark:inset-ring-input dark:hover:bg-input/50",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <ul aria-label="Tiers" className="flex gap-3 text-xs leading-4 text-muted-foreground">
            {TIERS.map((tier) => (
              <li key={tier.key} className="flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="size-2.5 rounded-[2px]"
                  style={{ backgroundColor: TIER_RAMP[tier.key] }}
                />
                {tier.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="@container mt-3 flex flex-1 flex-col">
        <div className="relative min-h-53 flex-1">
          {/* Gridlines and their money ticks. */}
          <div aria-hidden className="absolute inset-0">
            {ticks.map((tick) => (
              <div key={tick} className="absolute inset-x-0" style={{ bottom: percent(tick, top) }}>
                <span className="absolute left-0 w-8 translate-y-1/2 text-right text-[11px] leading-none text-outline tabular-nums dark:text-subtle-foreground">
                  {formatCompactMoney(tick)}
                </span>
                <span
                  className={cn(
                    "absolute right-0 h-px translate-y-1/2",
                    tick === 0 ? "bg-border" : "bg-border/40 dark:bg-border/70",
                  )}
                  style={{ left: GUTTER }}
                />
              </div>
            ))}
          </div>

          <div
            role="group"
            aria-label={`Monthly recurring revenue by tier, each ${config.noun}`}
            className="absolute inset-y-0 right-0 flex"
            style={{ left: GUTTER }}
          >
            {points.map((point, index) => {
              const total = totalOf(point);
              let below = 0;
              return (
                <div
                  key={point.label}
                  ref={(node) => {
                    columns.current[index] = node;
                  }}
                  role="img"
                  tabIndex={index === tabStop ? 0 : -1}
                  aria-label={`${point.period}: ${formatWholeMoney(total)} MRR. ${TIERS.map(
                    (tier) => `${tier.label} ${formatWholeMoney(point[tier.key])}`,
                  ).join(", ")}.`}
                  onPointerEnter={() => setHovered(index)}
                  // A tap also focuses the column, which keeps its readout until the next tap elsewhere.
                  onPointerLeave={() => setHovered(null)}
                  onFocus={() => {
                    setCursor(index);
                    setFocused(index);
                  }}
                  onBlur={() => setFocused(null)}
                  onKeyDown={(event) => moveFocus(event, index)}
                  className={cn(
                    "relative flex-1 rounded-md transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring",
                    activeIndex === index && "bg-muted/70 dark:bg-muted/50",
                  )}
                >
                  <div
                    className="absolute bottom-0 left-1/2 w-6 max-w-[70%] -translate-x-1/2"
                    style={{ height: percent(total, top) }}
                  >
                    {TIERS.map((tier, layer) => {
                      const value = point[tier.key];
                      const from = below;
                      below += value;
                      if (value <= 0) return null;
                      const isTop = TIERS.slice(layer + 1).every((next) => point[next.key] <= 0);
                      // Each segment above the first gives up 2px at its foot: the surface gap.
                      return (
                        <span
                          key={tier.key}
                          className={cn("absolute inset-x-0", isTop && "rounded-t-[4px]")}
                          style={{
                            bottom: from > 0 ? `calc(${percent(from, total)} + 2px)` : 0,
                            height:
                              from > 0
                                ? `calc(${percent(value, total)} - 2px)`
                                : percent(value, total),
                            backgroundColor: TIER_RAMP[tier.key],
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {active && activeIndex !== null ? (
            <RevenueTooltip
              point={active}
              center={(activeIndex + 0.5) / points.length}
              // The column's leave and the readout's enter land in one update, so moving
              // onto the readout keeps it open.
              onPointerEnter={() => setHovered(activeIndex)}
              onPointerLeave={() => setHovered(null)}
            />
          ) : null}
        </div>

        <div aria-hidden className="mt-4 flex" style={{ marginLeft: GUTTER }}>
          {points.map((point, index) => (
            <span
              key={point.label}
              className={cn(
                "min-w-0 flex-1 text-center text-xs leading-4 whitespace-nowrap text-outline dark:text-subtle-foreground",
                // Narrow cards keep every other week's label, counted back from the latest:
                // the tooltip and table carry the rest.
                view === "weekly" &&
                  (points.length - 1 - index) % 2 === 1 &&
                  "invisible @md:visible",
              )}
            >
              {point.label}
            </span>
          ))}
        </div>
      </div>

      <div className="sr-only">
        <table>
          <caption>Monthly recurring revenue by tier, each {config.noun}</caption>
          <thead>
            <tr>
              <th scope="col">{config.noun === "week" ? "Week" : "Month"}</th>
              {TIERS.map((tier) => (
                <th key={tier.key} scope="col">
                  {tier.label}
                </th>
              ))}
              <th scope="col">Total MRR</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.label}>
                <th scope="row">{point.period}</th>
                {TIERS.map((tier) => (
                  <td key={tier.key}>{formatWholeMoney(point[tier.key])}</td>
                ))}
                <td>{formatWholeMoney(totalOf(point))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
}

/**
 * The readout for the hovered or focused column: the period, its total MRR
 * (the value leads), then each tier keyed by a short stroke of its color.
 * It sits beside the column, on the side with more room, below the card's
 * header; in a narrow card the clamp can still pull it over the column it
 * describes. It takes the pointer, so it stays open while the pointer is on it.
 */
function RevenueTooltip({
  point,
  center,
  onPointerEnter,
  onPointerLeave,
}: {
  point: RevenuePoint;
  /** The column's center across the columns, from 0 to 1. */
  center: number;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}) {
  const x = `(${GUTTER} + (100% - ${GUTTER}) * ${center})`;
  const left =
    center < 0.5
      ? `calc(${x} + 1.25rem)` // right of the column: half its 24px width plus 8px
      : `calc(${x} - 1.25rem - ${TOOLTIP_WIDTH})`; // left of it, less the tooltip's width
  return (
    <div
      aria-hidden
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className="absolute top-0 z-10 rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl"
      // Kept inside the plot at either end.
      style={{
        width: TOOLTIP_WIDTH,
        left: `clamp(0px, ${left}, calc(100% - ${TOOLTIP_WIDTH}))`,
      }}
    >
      <p className="font-medium text-muted-foreground">{point.period}</p>
      <p className="mt-1">
        <span className="text-sm font-semibold text-foreground">
          {formatWholeMoney(totalOf(point))}
        </span>{" "}
        <span className="text-muted-foreground">MRR</span>
      </p>
      <div className="mt-1.5 grid grid-cols-[auto_auto_1fr] items-center gap-x-2 gap-y-1">
        {TIERS.map((tier) => (
          <div key={tier.key} className="contents">
            <span
              className="h-0.5 w-3 rounded-full"
              style={{ backgroundColor: TIER_RAMP[tier.key] }}
            />
            <span className="text-right font-semibold text-foreground tabular-nums">
              {formatWholeMoney(point[tier.key])}
            </span>
            <span className="text-muted-foreground">{tier.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
