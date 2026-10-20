"use client";

import { cn } from "cn";
import { useState } from "react";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import type { ReportDistribution, ReportShare } from "@/types/reports";

// The Figma's red, slate, brown and teal, run through the dataviz validator: its
// slate sat too close to the brown, so "Other" is a step lighter, and dark mode
// has its own steps. The ring keeps the Figma's order, which never puts red
// beside brown, the one pair that can't be told apart reliably.
const TONES: Record<ReportShare["category"], string> = {
  harassment: "text-[#ba191a] dark:text-[#e5534b]",
  other: "text-[#7c93a8] dark:text-[#6f8fb0]",
  spam: "text-[#84500e] dark:text-[#b9803a]",
  "fake-profile": "text-action dark:text-[#2f9ec4]",
};
const RING_ORDER: ReportShare["category"][] = ["harassment", "other", "spam", "fake-profile"];

// In a 36-unit box, a radius of 50/π makes the circumference 100, so dash
// lengths and offsets are percentages.
const RADIUS = 50 / Math.PI;
// A hairline of card between segments.
const GAP = 0.7;

const count = new Intl.NumberFormat("en-US");

/** How the open reports split by violation type, as a ring with the total inside. */
export function ReportDistributionCard({
  data,
  className,
}: {
  data: ReportDistribution;
  className?: string;
}) {
  const [active, setActive] = useState<ReportShare["category"] | null>(null);
  const focus = data.shares.find((share) => share.category === active);
  const ring = RING_ORDER.flatMap((category) => data.shares.filter((s) => s.category === category));

  const arcs: { share: ReportShare; start: number; length: number }[] = [];
  let start = 0;
  for (const share of ring) {
    arcs.push({ share, start, length: Math.max(share.share - GAP, 0) });
    start += share.share;
  }

  return (
    <DashboardCard className={cn("flex flex-col px-6 pt-8 pb-6 sm:px-8", className)}>
      <DashboardCardTitle className="text-xl leading-7 font-semibold">
        Report Distribution
      </DashboardCardTitle>
      <p className="mt-1 text-sm text-muted-foreground">Breakdown by violation type.</p>

      <div className="relative mx-auto mt-10 size-47">
        {/* Hidden from assistive tech: the legend carries every share. */}
        <svg
          aria-hidden
          viewBox="0 0 36 36"
          fill="none"
          strokeWidth={3.6}
          className="size-full -rotate-[150deg]"
        >
          {arcs.map(({ share, start: offset, length }) => (
            <circle
              key={share.category}
              cx={18}
              cy={18}
              r={RADIUS}
              stroke="currentColor"
              strokeDasharray={`${length} ${100 - length}`}
              strokeDashoffset={-offset}
              onMouseEnter={() => setActive(share.category)}
              onMouseLeave={() => setActive(null)}
              className={cn(
                "transition-opacity",
                TONES[share.category],
                active && active !== share.category && "opacity-35",
              )}
            />
          ))}
        </svg>
        <p
          aria-hidden
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
        >
          <span className="text-[28px] leading-9 font-bold tabular-nums">
            {focus ? `${focus.share}%` : count.format(data.total)}
          </span>
          <span className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
            {focus ? focus.label : "Total"}
          </span>
        </p>
      </div>
      <p className="sr-only">{count.format(data.total)} reports in total.</p>

      <ul className="mt-auto flex flex-col gap-3 pt-10">
        {data.shares.map((share) => (
          <li
            key={share.category}
            onMouseEnter={() => setActive(share.category)}
            onMouseLeave={() => setActive(null)}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex items-center gap-3">
              <span
                aria-hidden
                className={cn("size-2.5 shrink-0 rounded-full bg-current", TONES[share.category])}
              />
              {share.label}
            </span>
            <span className="font-semibold tabular-nums">{share.share}%</span>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
