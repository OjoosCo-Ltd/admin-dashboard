import {
  CalendarDotsIcon,
  CaretRightIcon,
  ChatTextIcon,
  LightbulbIcon,
  StarIcon,
  TargetIcon,
  ThumbsUpIcon,
} from "@phosphor-icons/react/ssr";
import { cn } from "cn";
import Link from "next/link";
import type { ReactNode } from "react";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import type { WellbeingActivity, WellbeingInsight, WellbeingKpi } from "@/types/well-being";

const KPI_LOOKS: Record<WellbeingKpi["id"], { icon: ReactNode; tile: string }> = {
  resources: {
    icon: <TargetIcon weight="bold" />,
    tile: "bg-action-soft text-action dark:bg-action/25 dark:text-primary",
  },
  views: {
    icon: <ChatTextIcon weight="bold" />,
    tile: "bg-success-soft text-success dark:bg-success/15",
  },
  completions: {
    icon: <CalendarDotsIcon weight="bold" />,
    tile: "bg-[#eff8fd] text-review dark:bg-review/30 dark:text-subtle-foreground",
  },
  "completion-rate": {
    icon: <ThumbsUpIcon weight="bold" />,
    tile: "bg-action-soft text-action dark:bg-action/25 dark:text-primary",
  },
  "coach-sessions": {
    icon: <StarIcon weight="bold" />,
    tile: "bg-premium-soft text-premium dark:bg-premium/25 dark:text-chart-3",
  },
};

/** The overview's five figures: an icon tile, a two-line label, the value and a note or a bar. */
export function WellbeingKpiGrid({ kpis }: { kpis: WellbeingKpi[] }) {
  return (
    <section
      aria-label="Key metrics"
      className="grid gap-6 min-[30rem]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
    >
      {kpis.map((kpi) => {
        const look = KPI_LOOKS[kpi.id];
        return (
          <DashboardCard key={kpi.id} className="flex flex-col">
            <span
              aria-hidden
              className={cn(
                "flex size-10 items-center justify-center rounded-md [&>svg]:size-5.5",
                look.tile,
              )}
            >
              {look.icon}
            </span>
            {/* The Figma breaks every label onto two lines. */}
            <DashboardCardTitle className="mt-4 max-w-28 text-base leading-5.5 font-semibold tracking-wide">
              {kpi.label}
            </DashboardCardTitle>
            <p className="mt-2 text-[32px] leading-10 font-bold tabular-nums">{kpi.value}</p>
            {kpi.note && (
              <p className="mt-0.5 max-w-40 text-[17px] leading-6 text-outline">{kpi.note}</p>
            )}
            {kpi.progress !== undefined && (
              <div
                role="meter"
                aria-label={kpi.label}
                aria-valuenow={kpi.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                className="mt-3 h-2 rounded-full bg-container dark:bg-muted"
              >
                <div
                  className="h-full rounded-full bg-action dark:bg-primary"
                  style={{ width: `${kpi.progress}%` }}
                />
              </div>
            )}
          </DashboardCard>
        );
      })}
    </section>
  );
}

/** A teal card that calls out one trend, with a link to the full report. */
export function WellbeingInsightCard({
  insight,
  className,
}: {
  insight: WellbeingInsight;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl bg-action p-6 text-white shadow-[0_8px_24px_-12px_rgb(0_100_129/0.5)] dark:bg-action/60",
        className,
      )}
    >
      {/* The Figma's lighter glow in the top corner. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-white/10 blur-3xl"
      />
      <h2 className="relative flex items-center gap-2 text-[13px] font-semibold tracking-[0.12em] text-[#bee9ff] uppercase">
        <LightbulbIcon aria-hidden weight="bold" className="size-5" />
        Well-being insights
      </h2>
      <p className="relative mt-4 text-[28px] leading-[1.35] font-semibold">
        {insight.lead} <span className="text-[#bee9ff]">{insight.highlight}</span> {insight.tail}
      </p>
      <p className="relative mt-8 text-base leading-6 text-[#98cee6]">{insight.detail}</p>
      <Link
        href="/analytics"
        className="relative mt-4 flex h-11 items-center justify-center rounded-md bg-white text-base font-semibold tracking-wide text-action outline-none hover:bg-white/90 focus-visible:ring-3 focus-visible:ring-white/60"
      >
        View Detailed Report
      </Link>
    </section>
  );
}

/** The three most-used resources, ranked, each linking through to the library. */
export function TopResourcesCard({
  resources,
  className,
}: {
  resources: { id: string; title: string; kind: string; reach: string }[];
  className?: string;
}) {
  return (
    <DashboardCard className={cn("p-0", className)}>
      <div className="flex items-center justify-between gap-4 px-6 pt-7">
        <DashboardCardTitle className="text-[22px] leading-7 font-semibold">
          Most Engaged Resources
        </DashboardCardTitle>
        <Link
          href="/well-being/resources"
          className="rounded-sm text-base font-semibold tracking-wide text-action outline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring dark:text-primary"
        >
          View All
        </Link>
      </div>
      <ol className="mt-4 flex flex-col pb-4">
        {resources.map((resource, index) => (
          <li key={resource.id}>
            <Link
              href="/well-being/resources"
              className="flex items-center gap-6 px-6 py-4.5 outline-none hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
            >
              <span
                aria-hidden
                className={cn(
                  "ml-3 flex size-10 shrink-0 items-center justify-center rounded-md text-base font-semibold",
                  index === 0
                    ? "bg-[#ebf8ff] text-action-icon dark:bg-action/25 dark:text-primary"
                    : "bg-container text-foreground dark:bg-muted",
                )}
              >
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="sr-only">Rank {index + 1}: </span>
                <span className="block text-lg leading-6 font-semibold">{resource.title}</span>
                <span className="block text-sm text-outline">
                  {resource.kind} • {resource.reach}
                </span>
              </span>
              <CaretRightIcon aria-hidden weight="bold" className="size-5 shrink-0 text-border" />
            </Link>
          </li>
        ))}
      </ol>
    </DashboardCard>
  );
}

const moment = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
});

/** What changed in the section lately, newest first, on a rail. */
export function WellbeingActivityCard({
  items,
  className,
}: {
  items: WellbeingActivity[];
  className?: string;
}) {
  const last = items.length - 1;
  return (
    <DashboardCard className={className}>
      <DashboardCardTitle className="text-[22px] leading-7 font-semibold">
        Well-being Activity
      </DashboardCardTitle>
      <ol className="mt-6">
        {items.map((item, index) => (
          <li key={item.id} className="relative flex gap-3 pb-7 last:pb-0">
            {index < last && (
              <span aria-hidden className="absolute top-5 bottom-0 left-[6.5px] w-px bg-border" />
            )}
            <span
              aria-hidden
              className={cn(
                "mt-1 size-3.5 shrink-0 rounded-full",
                index === 0 ? "bg-action dark:bg-primary" : "bg-container dark:bg-muted",
              )}
            />
            <div className="min-w-0">
              <time dateTime={item.at} className="block text-sm text-outline">
                {moment.format(new Date(item.at))}
              </time>
              <p className="mt-1 text-lg leading-6">{item.title}</p>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">{item.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </DashboardCard>
  );
}
