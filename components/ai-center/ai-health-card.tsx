import { cn } from "cn";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import type { AiHealthReading } from "@/types/ai-center";

const TONES: Record<AiHealthReading["tone"], { value: string; dot?: string }> = {
  healthy: { value: "text-foreground", dot: "bg-online" },
  fast: { value: "text-foreground", dot: "bg-action dark:bg-primary" },
  critical: { value: "text-destructive" },
  plain: { value: "text-foreground" },
};

/** The AI platform's vital signs in one strip: each a label over its state or figure. */
export function AiHealthCard({
  readings,
  className,
}: {
  readings: AiHealthReading[];
  className?: string;
}) {
  return (
    <DashboardCard className={className}>
      <DashboardCardTitle className="text-xl leading-7 font-semibold">
        AI Health Dashboard
      </DashboardCardTitle>
      {/* Inset like the Figma's, which starts the readings well in from the title. */}
      <dl className="mt-10 mb-1 grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-3 xl:grid-cols-6 xl:pl-20">
        {readings.map((reading) => {
          const tone = TONES[reading.tone];
          return (
            <div key={reading.id}>
              <dt className="text-base leading-6 tracking-wide text-muted-foreground uppercase">
                {reading.label}
              </dt>
              <dd
                className={cn(
                  "mt-1.5 flex items-center gap-2.5 text-lg leading-6 font-semibold",
                  tone.value,
                )}
              >
                {tone.dot && (
                  <span aria-hidden className={cn("size-2 shrink-0 rounded-full", tone.dot)} />
                )}
                {reading.value}
              </dd>
            </div>
          );
        })}
      </dl>
    </DashboardCard>
  );
}
