"use client";

import { cn } from "cn";
import { useState, type CSSProperties } from "react";

import {
  formatCompactCount,
  formatCount,
  formatPercent,
  HAIRLINE_CARD,
  RAMP_VARS,
  TIER_RAMP,
} from "@/components/analytics/analytics-format";
import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { formatWholeMoney } from "@/libs/money";
import type { SubscriptionTier, TierShare } from "@/types/analytics";

// The ring in CSS px: a 156px donut, 14px thick, drawn with dash arrays along
// the stroke's centerline, so lengths and offsets are px of arc.
const SIZE = 156;
const THICKNESS = 14;
const RADIUS = (SIZE - THICKNESS) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
// 2px of card between segments, split across both ends of each one.
const GAP = 2;
// Pointer target around each segment: wider than the 14px mark.
const HIT_WIDTH = 26;

/** Members by plan as a donut, with each plan's share of members and its MRR beside it. */
export function UserTiersCard({ tiers, className }: { tiers: TierShare[]; className?: string }) {
  // The plan under the pointer, on the ring or in the list. The rows take no
  // focus: they already carry every figure as text, and focus would only light the ring.
  const [active, setActive] = useState<SubscriptionTier | null>(null);

  const total = tiers.reduce((sum, tier) => sum + tier.users, 0);
  const shares = tiers.map((tier) => ({
    ...tier,
    share: total > 0 ? (tier.users / total) * 100 : 0,
  }));
  const focus = shares.find((tier) => tier.tier === active);

  // Clockwise from 12 o'clock, in the plans' order.
  const arcs: { tier: SubscriptionTier; offset: number; length: number }[] = [];
  let start = 0;
  for (const { tier, share } of shares) {
    const span = (share / 100) * CIRCUMFERENCE;
    arcs.push({ tier, offset: start + GAP / 2, length: Math.max(span - GAP, 0) });
    start += span;
  }

  const summary = shares.map((tier) => `${tier.label} ${formatPercent(tier.share)}`).join(", ");

  return (
    <DashboardCard
      className={cn("@container flex flex-col p-6 sm:p-8", HAIRLINE_CARD, RAMP_VARS, className)}
    >
      <DashboardCardTitle className="text-lg leading-7 font-bold">User Tiers</DashboardCardTitle>

      {/* The list moves beside the ring once the card itself has room, whatever the
          viewport, and the ring's column never gets narrower than the ring. */}
      <div
        className="mt-6.5 grid items-start gap-8 @xs:grid-cols-[minmax(var(--donut-size),1fr)_minmax(0,1fr)]"
        style={{ "--donut-size": `${SIZE}px` } as CSSProperties}
      >
        <div className="relative mx-auto size-(--donut-size)">
          <svg
            role="img"
            aria-label={`Members by plan, ${formatCount(total)} in total: ${summary}.`}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            fill="none"
            className="size-full -rotate-90 overflow-visible"
          >
            {arcs.map(({ tier, offset, length }) => (
              <circle
                key={tier}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                stroke={TIER_RAMP[tier]}
                strokeWidth={THICKNESS}
                strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                strokeDashoffset={-offset}
                className={cn(
                  "pointer-events-none transition-opacity",
                  active && active !== tier && "opacity-30",
                )}
              />
            ))}
            {/* Transparent, wider copies of the segments take the pointer. */}
            {arcs.map(({ tier, offset, length }) => (
              <circle
                key={`${tier}-hit`}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                stroke="transparent"
                strokeWidth={HIT_WIDTH}
                strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                strokeDashoffset={-offset}
                onPointerEnter={() => setActive(tier)}
                onPointerLeave={() => setActive(null)}
              />
            ))}
          </svg>
          <p
            aria-hidden
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
          >
            <span className="text-2xl leading-8 font-black">
              {focus ? formatPercent(focus.share) : formatCompactCount(total)}
            </span>
            <span className="text-[10px] leading-4 font-semibold text-subtle-foreground uppercase">
              {focus ? focus.label : "Total"}
            </span>
          </p>
        </div>

        <ul aria-label="Plans" className="flex flex-col gap-4.25 @xs:pt-5">
          {shares.map(({ tier, label, share, mrr }) => (
            <li
              key={tier}
              onPointerEnter={() => setActive(tier)}
              onPointerLeave={() => setActive(null)}
              className={cn(
                "-mx-2 -my-1 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 rounded-md px-2 py-1 transition-colors",
                active === tier && "bg-muted",
              )}
            >
              <span
                aria-hidden
                style={{ backgroundColor: TIER_RAMP[tier] }}
                className={cn(
                  "size-3 rounded-[3px] transition-opacity",
                  active && active !== tier && "opacity-30",
                )}
              />
              <span className="flex min-w-0 flex-col">
                <span className="text-xs leading-4 font-bold">{label}</span>
                <span className="text-[10px] leading-3.5 text-subtle-foreground tabular-nums">
                  {formatPercent(share)}
                  <span className="sr-only"> of members</span>
                </span>
              </span>
              <span className="self-end text-[11px] leading-3.5 font-bold tabular-nums">
                {formatWholeMoney(mrr)}
                <span className="sr-only"> monthly recurring revenue</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </DashboardCard>
  );
}
