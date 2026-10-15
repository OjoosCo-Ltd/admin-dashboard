import { BrainIcon } from "@phosphor-icons/react/ssr";
import { cn } from "cn";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import type { DateInsight } from "@/types/virtual-dates";

/** What the AI noticed about virtual dates, each as a headline and a suggestion. */
export function DateInsightsCard({
  insights,
  className,
}: {
  insights: DateInsight[];
  className?: string;
}) {
  return (
    <DashboardCard className={cn("relative overflow-hidden", className)}>
      {/* The Figma's soft glow in the corner. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-12 -right-12 size-40 rounded-full bg-[#dbe9ee] opacity-70 blur-3xl dark:opacity-10"
      />
      <h2 className="relative flex items-center gap-2 text-xl leading-7 tracking-[0.2em] text-action uppercase dark:text-primary">
        <span
          aria-hidden
          className="flex size-6 items-center justify-center rounded-full bg-action text-white dark:bg-primary dark:text-primary-foreground"
        >
          <BrainIcon weight="fill" className="size-4" />
        </span>
        AI Smart Insights
      </h2>
      <ul className="relative mt-4 flex flex-col gap-3.5">
        {insights.map((insight) => (
          <li
            key={insight.id}
            className="rounded-lg border border-[#e4eef3] bg-card px-7 py-4 dark:border-border"
          >
            <p className="text-lg leading-6 font-bold">{insight.title}</p>
            <p className="mt-1 max-w-xl text-[15px] leading-5 text-muted-foreground">
              {insight.body}
            </p>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
