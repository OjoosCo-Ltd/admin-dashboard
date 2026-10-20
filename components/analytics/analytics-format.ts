import type { FunnelStageId, SubscriptionTier } from "@/types/analytics";

const count = new Intl.NumberFormat("en-US");

/** "185,420". */
export const formatCount = (value: number) => count.format(value);

const COMPACT_UNITS = [
  { divisor: 1_000_000, suffix: "M" },
  { divisor: 1_000, suffix: "K" },
  { divisor: 1, suffix: "" },
] as const;

/**
 * "185K", "1.2M", "12.5K", "840". Spelled out by hand, like libs/money.ts:
 * Node's and the browser's Intl compact notation disagree on the case of
 * "k", which breaks hydration.
 */
export function formatCompactCount(value: number) {
  const size = Math.abs(value);
  const round = (index: number) => {
    const { divisor, suffix } = COMPACT_UNITS[index];
    const scaled = size / divisor;
    return Number(scaled.toFixed(suffix && scaled < 100 ? 1 : 0));
  };
  let index = COMPACT_UNITS.findIndex(({ divisor }) => size >= divisor);
  if (index === -1) index = COMPACT_UNITS.length - 1;
  let rounded = round(index);
  // Rounding can carry into the next unit: 999,950 reads "1M", not "1000K".
  if (rounded >= 1000 && index > 0) {
    index -= 1;
    rounded = round(index);
  }
  // Signed after rounding, so -0.3 reads "0", not "-0".
  const sign = value < 0 && rounded > 0 ? "-" : "";
  return `${sign}${rounded}${COMPACT_UNITS[index].suffix}`;
}

/** "42%", "4.8%", "0.42%": up to `digits` decimals, trailing zeros dropped. */
export const formatPercent = (value: number, digits = 1) => `${Number(value.toFixed(digits))}%`;

/** "12m 44s". */
export function formatDuration(seconds: number) {
  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return minutes > 0 ? `${minutes}m ${rest}s` : `${rest}s`;
}

// Formatted in UTC so the server's render and the browser's agree.
const clock = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: "UTC",
});
const day = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const DAY_MS = 86_400_000;

/** "Today, 08:42 AM", "Yesterday, 11:30 PM", or "Oct 14, 09:00 AM", relative to `now`. */
export function formatEventTime(iso: string, now: string) {
  const date = new Date(iso);
  const days = Math.floor(Date.parse(now) / DAY_MS) - Math.floor(date.getTime() / DAY_MS);
  const label = days === 0 ? "Today" : days === 1 ? "Yesterday" : day.format(date);
  return `${label}, ${clock.format(date)}`;
}

/** The smallest clean step (1, 2, 2.5 or 5 × 10ⁿ) at least `raw` wide, for axis ticks. */
export function niceStep(raw: number) {
  if (!(raw > 0)) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((step) => step >= raw) ?? magnitude * 10;
}

/**
 * Every card except the KPI row draws the Figma's light hairline (#EBEFF0 on
 * the light canvas). Dark mode keeps the full border, which is already faint.
 */
export const HAIRLINE_CARD = "border-border/30 dark:border-border";

/**
 * The page's one teal ramp, step 1 = most: a single hue whose lightness rises
 * evenly, at least 0.06 OKLCH L between neighbours, so ordered things (plans,
 * funnel stages) read in order. The lightest step stays at least 2:1 against
 * the card (#78aac0 on white, #117a9b on the dark card); marks that carry no
 * printed value need 3:1, so on white they stop at step 4. Dark mode flips
 * the anchor, so more is brighter there. Put RAMP_VARS on a chart's root,
 * then paint marks with var(--ramp-N) (bg-(--ramp-N) in Tailwind,
 * fill="var(--ramp-N)" in SVG).
 */
export const RAMP_VARS =
  "[--ramp-1:#005069] [--ramp-2:#006481] [--ramp-3:#317b98] [--ramp-4:#5593ac] [--ramp-5:#78aac0] dark:[--ramp-1:#92defa] dark:[--ramp-2:#63c6e9] dark:[--ramp-3:#3aadd4] dark:[--ramp-4:#2193b9] dark:[--ramp-5:#117a9b]";

export const ramp = (step: 1 | 2 | 3 | 4 | 5) => `var(--ramp-${step})`;

/** The plans in order, most to least: User Tiers and Subscription Revenue share these. */
export const TIER_RAMP: Record<SubscriptionTier, string> = {
  elite: ramp(1),
  premium: ramp(2),
  basic: ramp(4),
  free: ramp(5),
};

/** The funnel's stages, darkest first: an ordinal ramp, as stages are ordered. */
export const FUNNEL_RAMP: Record<FunnelStageId, string> = {
  generated: ramp(1),
  viewed: ramp(2),
  accepted: ramp(3),
  conversation: ramp(4),
  "virtual-date": ramp(5),
};

/**
 * User Growth's context line (Active Users): a quiet grey that recedes behind
 * the teal registrations in both themes, yet stays 3:1 on its plot panel.
 */
export const CONTEXT_LINE_VARS = "[--context-line:#7c93a8] dark:[--context-line:#5f7384]";
