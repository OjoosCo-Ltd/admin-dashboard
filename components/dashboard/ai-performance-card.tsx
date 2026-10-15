import { StarFourIcon } from "@phosphor-icons/react/ssr";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import type { AiPerformance } from "@/types/dashboard";

const percent = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const change = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});
const seconds = new Intl.NumberFormat("en-US", {
  style: "unit",
  unit: "second",
  unitDisplay: "narrow",
  maximumFractionDigits: 1,
});
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

/** The headline AI figures on a primary card: match accuracy and two service stats. */
export function AiPerformanceCard({ data }: { data: AiPerformance }) {
  const stats = [
    { label: "Avg Response", value: seconds.format(data.avgResponseSeconds) },
    // The Figma writes thousands as "12.4k".
    { label: "Suggestions", value: compact.format(data.suggestions).replace(/K$/, "k") },
  ];

  return (
    <DashboardCard className="@container border-0 bg-primary text-primary-foreground">
      <div className="flex items-start justify-between gap-4">
        <DashboardCardTitle>AI Performance</DashboardCardTitle>
        <SparklesIcon />
      </div>

      <p className="mt-6 text-[11px] leading-3.5 text-primary-foreground/70">
        Compatibility Accuracy
      </p>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-xl font-bold">{percent.format(data.accuracy / 100)}</span>
        <span className="rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs">
          {change.format(data.change / 100)}
        </span>
      </p>

      <dl className="mx-auto mt-6 grid w-full max-w-63.5 gap-3 @min-[15rem]:grid-cols-2">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-primary-foreground/10 p-3">
            <dt className="text-[11px] leading-3.5 text-primary-foreground/60">{stat.label}</dt>
            <dd className="text-base font-bold">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </DashboardCard>
  );
}

/**
 * The Figma's sparkle cluster: a large star with a hollow center and two small
 * solid ones. Phosphor has no such glyph, so it's built from its four-point star;
 * the center is punched out in the card's own color.
 */
function SparklesIcon() {
  return (
    <span aria-hidden className="relative size-6 shrink-0">
      <span className="absolute top-0.75 left-px grid size-4.5 place-items-center *:col-start-1 *:row-start-1">
        <StarFourIcon weight="fill" className="size-full" />
        <StarFourIcon weight="fill" className="size-1.75 text-primary" />
      </span>
      <StarFourIcon weight="fill" className="absolute top-px right-0 size-2.25" />
      <StarFourIcon weight="fill" className="absolute right-0 bottom-px size-2.25" />
    </span>
  );
}
