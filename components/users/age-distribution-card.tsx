import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import type { AgeBand } from "@/types/users";

/** Share of users in each age band, as labelled bars. */
export function AgeDistributionCard({
  bands,
  className,
}: {
  bands: AgeBand[];
  className?: string;
}) {
  return (
    <DashboardCard className={className}>
      <DashboardCardTitle>Age Distribution</DashboardCardTitle>
      <ul className="mt-10 flex flex-col gap-2">
        {bands.map((band) => (
          <li key={band.label}>
            <div className="flex items-center justify-between gap-3 text-base font-semibold">
              <span>{band.label}</span>
              <span className="tabular-nums">{band.percent}%</span>
            </div>
            {/* The figure above says it; the bar only shows it. */}
            <div aria-hidden className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-chart-1"
                style={{ width: `${band.percent}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
