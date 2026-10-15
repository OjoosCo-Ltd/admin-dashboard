import { InfoIcon } from "@phosphor-icons/react/ssr";
import { cn } from "cn";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import type { DateTheme, ThemeShare } from "@/types/virtual-dates";

const COLORS: Record<DateTheme, string> = {
  movie: "bg-action dark:bg-primary",
  game: "bg-review",
  meal: "bg-caution",
  shop: "bg-[#001f2a] dark:bg-foreground",
};

/** Each date theme's share of booked sessions. */
export function DateThemesCard({
  themes,
  className,
}: {
  themes: ThemeShare[];
  className?: string;
}) {
  return (
    <DashboardCard className={className}>
      <div className="flex items-center justify-between gap-4">
        <DashboardCardTitle className="text-xl leading-7">Date Themes</DashboardCardTitle>
        <span
          title="Share of booked sessions by theme, this period"
          className="text-muted-foreground"
        >
          <InfoIcon aria-hidden weight="bold" className="size-6" />
          <span className="sr-only">Share of booked sessions by theme, this period</span>
        </span>
      </div>
      <ul className="mt-5.5 flex flex-col gap-6">
        {themes.map((theme) => (
          <li key={theme.id}>
            <div className="flex items-center justify-between gap-3 text-[17px] leading-6">
              <span>{theme.label}</span>
              <span className="font-bold tabular-nums">{theme.percent}%</span>
            </div>
            {/* The figure above says it; the bar only shows it. */}
            <div
              aria-hidden
              className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted-strong dark:bg-muted"
            >
              <div
                className={cn("h-full rounded-full", COLORS[theme.id])}
                style={{ width: `${theme.percent}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
