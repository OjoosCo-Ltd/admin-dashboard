import { InfoIcon, ShieldIcon, SparkleIcon, UsersThreeIcon } from "@phosphor-icons/react/ssr";
import { cn } from "cn";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { ToastButton } from "@/components/dashboard/toast-button";
import { PsychologyIcon } from "@/components/icons/app-icons";
import { reportInitials } from "@/components/reports/report-styles";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FEATURES } from "@/constants/features";
import type { Moderator, ResolutionSource, SafetyIntelligence } from "@/types/reports";

const count = new Intl.NumberFormat("en-US");

const SOURCE_BARS: Record<ResolutionSource["id"], string> = {
  ai: "bg-action dark:bg-primary",
  moderator: "bg-review dark:bg-subtle-foreground",
  admin: "bg-caution dark:bg-[#e9b97c]",
};

const PRESENCE: Record<Moderator["presence"], { label: string; dot: string }> = {
  online: { label: "Online", dot: "bg-[#22c55d]" },
  away: { label: "Away", dot: "bg-[#e9b306]" },
  offline: { label: "Offline", dot: "bg-outline" },
};

const sectionTitle = "text-xl leading-7 font-semibold";

/** What the AI caught, how reports get closed, and how the moderators are doing. */
export function SafetyOverview({
  intelligence,
  sources,
  insights,
  moderators,
  activeMods,
}: {
  intelligence: SafetyIntelligence;
  sources: ResolutionSource[];
  insights: string[];
  moderators: Moderator[];
  activeMods: { active: number; total: number };
}) {
  const showIntelligence = FEATURES.aiMetrics;
  const showPerformance = FEATURES.reportAnalytics || FEATURES.insights;
  const columns = 1 + Number(showIntelligence) + Number(showPerformance);

  return (
    <div
      className={cn(
        "grid items-start gap-8",
        columns === 3 && "lg:grid-cols-2 xl:grid-cols-3",
        columns === 2 && "lg:grid-cols-2",
      )}
    >
      {showIntelligence && (
        <section aria-labelledby="ai-safety-intelligence" className="flex flex-col gap-6">
          <h2 id="ai-safety-intelligence" className={sectionTitle}>
            AI Safety Intelligence
          </h2>
          <div className="relative overflow-hidden rounded-2xl bg-sidebar px-6 pt-7 pb-8 text-white shadow-[0_8px_24px_rgb(0_31_41/0.25)]">
            <PsychologyIcon
              aria-hidden
              className="pointer-events-none absolute -top-3 -right-4 h-24 w-auto text-white/10"
            />
            <p className="relative text-[11px] font-semibold tracking-widest text-info-soft uppercase">
              Threat Detection
            </p>
            <p className="relative mt-4 text-2xl leading-8 font-bold tabular-nums">
              {count.format(intelligence.threats.count)}
            </p>
            <p className="relative mt-3 max-w-80 text-sm leading-[21px] text-info-soft/90">
              {intelligence.threats.description}
            </p>
            <div
              role="meter"
              aria-label="Detection coverage"
              aria-valuenow={intelligence.threats.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              className="relative mt-6 h-1.5 rounded-full bg-[#1a363f]"
            >
              <div
                className="h-full rounded-full bg-[#85d0f3]"
                style={{ width: `${intelligence.threats.progress}%` }}
              />
            </div>
          </div>
          <DashboardCard className="rounded-2xl px-6 py-6">
            <div className="flex items-center gap-4">
              <span
                aria-hidden
                className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#f3ede7] text-caution dark:bg-caution/30 dark:text-[#e9b97c]"
              >
                <ShieldIcon weight="fill" className="size-6" />
              </span>
              <div>
                <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Automated Filters
                </h3>
                <p className="text-sm font-bold">{intelligence.filters.successRate} Success Rate</p>
              </div>
            </div>
            <p className="mt-5 text-[13px] leading-5 text-muted-foreground">
              {intelligence.filters.description}
            </p>
          </DashboardCard>
        </section>
      )}

      {showPerformance && (
        <section aria-labelledby="performance-insights" className="flex flex-col gap-6">
          <h2 id="performance-insights" className={sectionTitle}>
            Performance &amp; Insights
          </h2>
          {FEATURES.reportAnalytics && (
            <DashboardCard className="rounded-2xl px-6 pt-7 pb-6">
              <div className="flex items-center justify-between gap-3">
                <h3
                  id="resolution-by-source"
                  className="text-[11px] font-semibold tracking-widest text-review uppercase dark:text-subtle-foreground"
                >
                  Resolution by Source
                </h3>
                <Tooltip>
                  <TooltipTrigger
                    aria-label="About resolution by source"
                    className="rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <InfoIcon aria-hidden className="size-5" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-56">
                    Who closed this month&apos;s reports: the AI on its own, first-line moderators,
                    or admins after escalation.
                  </TooltipContent>
                </Tooltip>
              </div>
              <dl aria-labelledby="resolution-by-source" className="mt-5 flex flex-col gap-4">
                {sources.map((source) => (
                  <div key={source.id}>
                    <div className="flex items-center justify-between gap-3 text-[13px] font-semibold">
                      <dt>{source.label}</dt>
                      <dd className="tabular-nums">{source.share}%</dd>
                    </div>
                    <div aria-hidden className="mt-2 h-2 rounded-full bg-container dark:bg-muted">
                      <div
                        className={cn("h-full rounded-full", SOURCE_BARS[source.id])}
                        style={{ width: `${source.share}%` }}
                      />
                    </div>
                  </div>
                ))}
              </dl>
            </DashboardCard>
          )}
          {FEATURES.insights && (
            <section
              aria-labelledby="smart-safety-insights"
              className="rounded-2xl border border-[#dbe5ea] bg-[#ebf2f6] px-6 py-7 dark:border-border dark:bg-action/15"
            >
              <h3
                id="smart-safety-insights"
                className="flex items-center gap-2 text-xs font-bold tracking-widest text-action uppercase dark:text-primary"
              >
                <SparkleIcon aria-hidden weight="fill" className="size-4.5" />
                Smart Safety Insights
              </h3>
              <ul className="mt-4 flex flex-col gap-3 text-[13px] leading-5 text-muted-foreground">
                {insights.map((insight) => (
                  <li key={insight} className="flex gap-3">
                    <span
                      aria-hidden
                      className="mt-1.5 size-1.5 shrink-0 rounded-full bg-action dark:bg-primary"
                    />
                    {insight}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </section>
      )}

      <DashboardCard
        className={cn(
          "flex h-full flex-col rounded-2xl px-6 pt-7 pb-6",
          columns === 3 && "lg:col-span-2 xl:col-span-1",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          {/* In its narrow column the Figma wraps the title and View All onto two lines. */}
          <DashboardCardTitle
            className={cn("text-xl leading-7 font-semibold", columns > 1 && "max-w-40")}
          >
            Mod Team Performance
          </DashboardCardTitle>
          <ToastButton
            message="The moderator roster isn't available yet"
            className={cn(
              "mt-1 rounded-sm text-center text-xs leading-4 font-semibold text-action outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 dark:text-primary",
              columns > 1 && "max-w-12",
            )}
          >
            View All
          </ToastButton>
        </div>
        {/* On its own the card runs the page's width, so the moderators sit side by side. */}
        <ol
          className={cn(
            "mt-8 flex flex-col gap-6",
            columns === 1 && "sm:grid sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-3",
          )}
        >
          {moderators.map((moderator, index) => {
            const presence = PRESENCE[moderator.presence];
            return (
              <li key={moderator.id} className="flex items-center gap-3">
                <span className="relative shrink-0">
                  <Avatar className="size-10">
                    {moderator.avatarUrl && <AvatarImage src={moderator.avatarUrl} alt="" />}
                    <AvatarFallback className="bg-container text-xs font-semibold">
                      {reportInitials(moderator.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={cn(
                      "absolute -right-0.5 -bottom-0.5 size-3 rounded-full ring-2 ring-card",
                      presence.dot,
                    )}
                  >
                    <span className="sr-only">{presence.label}</span>
                  </span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{moderator.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {moderator.resolved} Resolved &bull; {moderator.accuracy}% Accuracy
                  </p>
                </div>
                <span className="text-[13px] font-bold">
                  <span className="sr-only">Rank </span>#{index + 1}
                </span>
              </li>
            );
          })}
        </ol>
        <div className="mt-auto border-t border-border/40 pt-8 dark:border-border">
          <div className="flex items-center justify-between gap-4 rounded-xl bg-muted px-5 py-4.5 dark:bg-muted/50">
            <div>
              <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
                Active Mods
              </p>
              <p className="text-xl leading-7 font-bold tabular-nums">
                {activeMods.active} / {activeMods.total}
              </p>
            </div>
            <UsersThreeIcon
              aria-hidden
              weight="fill"
              className="size-7 text-action dark:text-primary"
            />
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}
