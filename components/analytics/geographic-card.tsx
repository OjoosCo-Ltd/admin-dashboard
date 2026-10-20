import { cn } from "cn";

import {
  formatPercent,
  HAIRLINE_CARD,
  ramp,
  RAMP_VARS,
} from "@/components/analytics/analytics-format";
import {
  WORLD_COLUMNS,
  WORLD_LAND,
  WORLD_PINS,
  WORLD_ROWS,
} from "@/components/analytics/world-dots";
import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { ToastButton } from "@/components/dashboard/toast-button";
import type { CountryShare } from "@/types/analytics";

/** Every land dot as one path: a zero-length segment with round caps draws a dot. */
const LAND_PATH = WORLD_LAND.flatMap((row, y) =>
  [...row].flatMap((cell, x) => (cell === "#" ? [`M${x + 0.5} ${y + 0.5}h0`] : [])),
).join("");

/** The biggest share's marker diameter in px; the others scale by area. */
const PIN_MAX = 14;

/** Where members live: a map for the gist, and each country's share as a bar. */
export function GeographicCard({
  countries,
  className,
}: {
  countries: CountryShare[];
  className?: string;
}) {
  const summary = countries
    .map((country) => `${country.label} ${formatPercent(country.share)}`)
    .join(", ");
  const largest = Math.max(...countries.map((country) => country.share), 1);
  const pins = countries.flatMap((country) => {
    const at = WORLD_PINS[country.id];
    return at ? [{ ...country, x: at[0], y: at[1] }] : [];
  });

  return (
    <DashboardCard className={cn("flex flex-col", HAIRLINE_CARD, RAMP_VARS, className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <DashboardCardTitle className="text-lg leading-7 font-bold">
          Geographic Distribution
        </DashboardCardTitle>
        {/* The padding keeps the focus ring off the text; the matching negative margin keeps
            the text aligned with the card's edge. */}
        <ToastButton
          message="The detailed country list isn't available yet"
          className="-m-1 rounded-sm p-1 text-xs font-semibold text-action outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring dark:text-primary"
        >
          View Detailed List
        </ToastButton>
      </div>
      {/* Side by side only from lg: at md the sidebar leaves the card too narrow for both. */}
      <div className="mt-6 grid flex-1 gap-8 lg:grid-cols-[minmax(0,1fr)_12rem]">
        {/* Beside Trust & Safety (xl), the panel fills the row's height and the map stops
            growing, so neither card ends in an empty band at any width. */}
        <div className="flex aspect-460/257 items-center justify-center rounded-xl bg-muted px-3 xl:aspect-auto xl:min-h-48">
          <div
            className="relative w-full xl:max-w-120"
            style={{ aspectRatio: `${WORLD_COLUMNS} / ${WORLD_ROWS}` }}
          >
            <svg
              role="img"
              aria-label={`World map of where members live: ${summary}`}
              viewBox={`0 0 ${WORLD_COLUMNS} ${WORLD_ROWS}`}
              className="absolute inset-0 size-full text-border dark:text-white/15"
            >
              <path
                d={LAND_PATH}
                fill="none"
                stroke="currentColor"
                strokeWidth={0.62}
                strokeLinecap="round"
              />
            </svg>
            {/* Decorative: the svg's label and the list beside the map carry every share,
                and markers this close together would make poor hover or focus targets. */}
            {pins.map((pin) => {
              const size = Math.max(PIN_MAX * Math.sqrt(pin.share / largest), 6);
              return (
                <span
                  key={pin.id}
                  aria-hidden
                  className="absolute -translate-1/2 rounded-full ring-2 ring-muted"
                  style={{
                    left: `${(pin.x / WORLD_COLUMNS) * 100}%`,
                    top: `${(pin.y / WORLD_ROWS) * 100}%`,
                    width: size,
                    height: size,
                    backgroundColor: ramp(2),
                  }}
                />
              );
            })}
          </div>
        </div>
        <dl className="flex flex-col gap-4">
          {countries.map((country) => (
            <div
              key={country.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 text-xs/4 font-semibold"
            >
              <dt>{country.label}</dt>
              <dd className="tabular-nums">{formatPercent(country.share)}</dd>
              <dd
                aria-hidden
                className="col-span-2 mt-1 h-1.5 rounded-full bg-[#e5eff2] dark:bg-white/10"
              >
                <div
                  className="h-full rounded-r-full"
                  style={{ width: `${country.share}%`, backgroundColor: ramp(2) }}
                />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </DashboardCard>
  );
}
