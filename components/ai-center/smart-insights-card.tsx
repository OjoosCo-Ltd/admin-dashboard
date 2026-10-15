import { BrainIcon, LightbulbIcon, SparkleIcon, TrendUpIcon } from "@phosphor-icons/react/ssr";
import { cn } from "cn";
import type { ReactNode } from "react";

import { DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import type { AiInsight } from "@/types/ai-center";

const ICONS: Record<AiInsight["kind"], ReactNode> = {
  trend: <TrendUpIcon weight="bold" className="text-online" />,
  behavior: <BrainIcon weight="bold" className="text-action dark:text-primary" />,
  idea: <LightbulbIcon weight="bold" className="text-[#f59e0c]" />,
};

/** What the AI noticed lately, a few short findings with their key figures picked out. */
export function SmartInsightsCard({
  insights,
  className,
}: {
  insights: AiInsight[];
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-[#cfe1e7] bg-[#ebf2f6] p-6 dark:border-border dark:bg-muted/40",
        className,
      )}
    >
      <DashboardCardTitle className="flex items-center gap-2.5 text-xl leading-7 font-semibold">
        <SparkleIcon aria-hidden weight="fill" className="size-6 text-action-icon" />
        Smart Insights
      </DashboardCardTitle>
      <ul className="mt-5 flex flex-col gap-4">
        {insights.map((insight) => (
          <li
            key={insight.id}
            className="flex gap-3.5 rounded-xl bg-card p-4 text-sm leading-5 shadow-[0_1px_3px_rgb(24_28_30/0.06)]"
          >
            <span aria-hidden className="shrink-0 [&_svg]:size-6">
              {ICONS[insight.kind]}
            </span>
            <p>
              {insight.parts.map((part, index) =>
                part.highlight ? (
                  <strong key={index} className="font-normal text-action dark:text-primary">
                    {part.text}
                  </strong>
                ) : (
                  <span key={index}>{part.text}</span>
                ),
              )}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
