import { StarFourIcon } from "@phosphor-icons/react/ssr";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import type { AiEngagementFeature } from "@/types/conversations";

const percentFormat = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 0,
});

/** How many conversations used each AI feature, as a figure and a bar per feature. */
export function AiEngagementCard({
  features,
  className,
}: {
  features: AiEngagementFeature[];
  className?: string;
}) {
  return (
    <DashboardCard className={className}>
      <div className="flex items-center gap-1">
        <SparklesIcon />
        <DashboardCardTitle className="text-xl/7 font-semibold">AI Engagement</DashboardCardTitle>
      </div>
      {features.length > 0 ? (
        <dl className="mt-6 flex flex-col gap-6">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 text-xs/4"
            >
              <dt className="font-semibold tracking-wider text-muted-foreground">
                {feature.label}
              </dt>
              {/* CSS tracks the last glyph too; the negative margin takes that back
                  so the figure ends on the content edge, as in the Figma. */}
              <dd className="me-[-0.075em] font-bold tracking-[0.075em]">
                {percentFormat.format(feature.value / 100)}
              </dd>
              {/* The figure above carries the value. */}
              <dd aria-hidden className="col-span-2 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-action dark:bg-primary"
                  style={{ width: `${Math.min(100, Math.max(0, feature.value))}%` }}
                />
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">No AI features used in this range yet.</p>
      )}
    </DashboardCard>
  );
}

/**
 * The Figma's sparkle cluster: a large four-point star with two small ones
 * stacked at its right. Phosphor has no such glyph, so it's built from its
 * four-point star (the AI Performance card's is the outlined variant).
 */
function SparklesIcon() {
  return (
    <span aria-hidden className="relative h-6 w-5.5 shrink-0 text-action dark:text-primary">
      {/* Phosphor's star leaves 1/16 of its box empty on each side; the overhang
          lines the big star's tip up with the card's content edge. */}
      <StarFourIcon weight="fill" className="absolute top-0.75 -left-px size-4.5" />
      <StarFourIcon weight="fill" className="absolute top-0 right-0 size-2.25" />
      <StarFourIcon weight="fill" className="absolute right-0 bottom-px size-2.25" />
    </span>
  );
}
