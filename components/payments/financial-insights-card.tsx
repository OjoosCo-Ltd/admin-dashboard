import { LightbulbIcon } from "@phosphor-icons/react/ssr";
import { cn } from "cn";

import type { FinancialInsight } from "@/types/payments";

// The dot's color, and the word a screen reader hears in its place.
const TONES: Record<FinancialInsight["tone"], { label: string; dot: string }> = {
  info: { label: "Insight", dot: "bg-action-icon dark:bg-[#5fa9c6]" },
  success: { label: "Good news", dot: "bg-online dark:bg-success" },
  risk: { label: "Risk", dot: "bg-destructive" },
};

/** Short findings about the money, each dotted by tone: an observation, good news or a risk. */
export function FinancialInsightsCard({
  insights,
  className,
}: {
  insights: FinancialInsight[];
  className?: string;
}) {
  return (
    <section
      aria-labelledby="financial-insights-title"
      className={cn(
        // The grey bar is a clipped strip, not border-l-4, whose inner edge would curve
        // into the corners.
        "relative overflow-hidden rounded-xl border border-l-0 border-[#d0d2d6] bg-surface py-6 pr-6 pl-7 before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-[#d0d2d6] dark:border-border dark:before:bg-border",
        className,
      )}
    >
      <h2 id="financial-insights-title" className="flex items-center gap-1 text-xl/7 font-semibold">
        {/* Pulled in by its side bearing, so the bulb lines up with the cards as in the Figma. */}
        <LightbulbIcon
          aria-hidden
          className="-ml-1 size-6 shrink-0 text-caution-accent dark:text-[#e9b97c]"
        />
        Financial Insights
      </h2>
      {/*
        The Figma clips the third card at the panel's foot. All three show here, so the row
        grows and Revenue Overview stretches to match.
      */}
      <ul className="mt-6 flex flex-col gap-4">
        {insights.map((insight) => {
          const tone = TONES[insight.tone];
          // Whole words only: "Risk Flag" already says it, "Riskier plans" doesn't.
          const toneInTitle = `${insight.title} `
            .toLowerCase()
            .startsWith(`${tone.label.toLowerCase()} `);
          return (
            <li
              key={insight.id}
              className="rounded-md border border-border/50 bg-card px-4 pt-3.5 pb-4 dark:border-border"
            >
              {/* The dot sits on the first line, so a title that wraps keeps it in place. */}
              <h3 className="flex items-start gap-2 text-[13px]/[18px] font-medium tracking-[0.01em]">
                <span
                  aria-hidden
                  className={cn("mt-1.25 size-2 shrink-0 rounded-full", tone.dot)}
                />
                {/* Skipped when the title already says it, so "Risk Flag" isn't read as "Risk: Risk Flag". */}
                {!toneInTitle && <span className="sr-only">{tone.label}: </span>}
                {insight.title}
              </h3>
              {/*
                The Figma's text box stops well short of the card's edge: 216px at 1440. The cap
                grows with the card, so wider screens don't get a narrow column. The Figma sets
                the Risk Flag's body in regular weight and the other two in bold; all three are
                bold here.
              */}
              <p className="mt-1 text-[13px]/[18px] font-bold text-muted-foreground xl:max-w-[max(13.5rem,80%)]">
                {insight.body}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
