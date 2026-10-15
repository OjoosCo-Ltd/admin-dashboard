import { GlobeHemisphereWestIcon } from "@phosphor-icons/react/ssr";
import { cn } from "cn";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";

/**
 * The Figma's map is placeholder art, a globe and a few dots with no legend or
 * labels, so it's drawn as such until there's a map design and regional data.
 * Positions are percentages of the square, sizes in px.
 */
const DOTS = [
  { left: 36.6, top: 28.1, className: "size-3.5 bg-action dark:bg-primary" },
  { left: 50, top: 50, className: "size-5 bg-border" },
  { left: 71.3, top: 36.9, className: "size-3.5 bg-action dark:bg-primary" },
  { left: 69, top: 51.6, className: "h-2 w-2.5 bg-action dark:bg-primary" },
];

export function GlobalReachCard({ className }: { className?: string }) {
  return (
    <DashboardCard className={cn("border-border/30 dark:border-border", className)}>
      <DashboardCardTitle className="text-xl/7 font-semibold">Global Reach</DashboardCardTitle>
      <div
        role="img"
        aria-label="Map of where verification submissions come from (placeholder)"
        className="relative mt-4 aspect-square overflow-hidden rounded-xl bg-muted"
      >
        <GlobeHemisphereWestIcon
          weight="fill"
          className="absolute top-[40%] left-[40%] size-8 -translate-1/2 text-border"
        />
        {DOTS.map((dot) => (
          <span
            key={`${dot.left}-${dot.top}`}
            className={cn("absolute -translate-1/2 rounded-full", dot.className)}
            style={{ left: `${dot.left}%`, top: `${dot.top}%` }}
          />
        ))}
      </div>
    </DashboardCard>
  );
}
