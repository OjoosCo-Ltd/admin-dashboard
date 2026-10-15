import { cn } from "cn";

import type { AiAssist, SafetyStatus } from "@/types/conversations";

const TEAL_PILL =
  "border-[#d8f2ff] bg-[#f2fbff] text-action dark:border-action/40 dark:bg-action/20 dark:text-primary";

/** The Figma draws High and Medium alike. It has no Low, so Low keeps the outline and drops the fill. */
const AI_ASSIST_STYLES: Record<AiAssist, { label: string; className: string }> = {
  high: { label: "High", className: TEAL_PILL },
  medium: { label: "Medium", className: TEAL_PILL },
  low: {
    label: "Low",
    className: "border-[#d8f2ff] text-action-icon dark:border-action/40 dark:text-primary/80",
  },
  none: {
    label: "None",
    className: "border-border bg-[#e0e3e6] text-muted-foreground dark:bg-muted",
  },
};

// Tailwind v3's green, orange and red (100 fill, 700 text, 500 dot), as the
// Figma has them. v4's palette is a shade off, so they're spelled out.
export const SAFETY_STYLES: Record<SafetyStatus, { label: string; pill: string; dot: string }> = {
  healthy: {
    label: "Healthy",
    pill: "bg-[#dcfce7] text-[#15803d] dark:bg-[#22c55e]/15 dark:text-[#4ade80]",
    dot: "bg-[#22c55e]",
  },
  "under-review": {
    label: "Under Review",
    pill: "bg-[#ffedd5] text-[#c2410c] dark:bg-[#f97316]/15 dark:text-[#fb923c]",
    dot: "bg-[#f97316]",
  },
  reported: {
    label: "Reported",
    pill: "bg-[#fee2e2] text-[#b91c1c] dark:bg-attention-border/15 dark:text-[#f87171]",
    dot: "bg-attention-border",
  },
};

/** How much a conversation leaned on the AI features: High, Medium, Low or None. */
export function AiAssistBadge({ level, className }: { level: AiAssist; className?: string }) {
  const style = AI_ASSIST_STYLES[level];
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded border px-1 text-[11px] font-medium",
        style.className,
        className,
      )}
    >
      {style.label}
    </span>
  );
}

/** The conversation's safety status: a dot and the label on a tinted capsule. */
export function SafetyStatusBadge({
  status,
  className,
}: {
  status: SafetyStatus;
  className?: string;
}) {
  const style = SAFETY_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs/4 font-bold tracking-wider",
        style.pill,
        className,
      )}
    >
      <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", style.dot)} />
      {/* The Figma's capsule holds 60px of text, so "Under Review" takes two lines. */}
      <span className="max-w-15 whitespace-normal">{style.label}</span>
    </span>
  );
}
