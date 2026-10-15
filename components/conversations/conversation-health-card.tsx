import { cn } from "cn";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import type { ConversationHealthSummary, HealthSegment } from "@/types/conversations";

// One text color per segment: the ring strokes and the legend dots both paint
// with currentColor. The Figma's orange and gray have no token.
const TONE: Record<HealthSegment["id"], string> = {
  healthy: "text-action dark:text-primary",
  reported: "text-[#fb923c]",
  flagged: "text-destructive",
  inactive: "text-[#e0e3e6] dark:text-white/15",
};

// In a 36-unit box, a radius of 50/π makes the circumference 100, so dash
// lengths and offsets are percentages. With a 4-unit stroke the 128px ring is
// the Figma's: 14px thick, with a 99px hole.
const RADIUS = 50 / Math.PI;

const count = new Intl.NumberFormat("en-US");
const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 });

/** The AI's health score for active conversations, and how they split by state. */
export function ConversationHealthCard({
  data,
  className,
}: {
  data: ConversationHealthSummary;
  className?: string;
}) {
  return (
    <DashboardCard className={className}>
      <DashboardCardTitle className="text-xl/7 font-semibold">
        Conversation Health
      </DashboardCardTitle>
      {/* Side by side while the legend fits beside the ring; on narrower cards it wraps below. */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
        <div className="relative size-32 shrink-0">
          <HealthRing segments={data.segments} />
          <p className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl/7 font-semibold">{percent.format(data.score / 100)}</span>{" "}
            <span className="text-[11px]/3.5 font-medium text-muted-foreground">
              {data.verdict}
            </span>
          </p>
        </div>
        <ul className="flex max-w-60 grow flex-col text-[11px]/4.5">
          {data.segments.map((segment) => (
            <li key={segment.id} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1 font-medium">
                <span
                  aria-hidden
                  className={cn("size-2 shrink-0 rounded-full bg-current", TONE[segment.id])}
                />
                {segment.label}
              </span>
              <span className="font-bold">{count.format(segment.count)}</span>
            </li>
          ))}
        </ul>
      </div>
    </DashboardCard>
  );
}

/**
 * Drawn as the Figma draws it: clockwise from 3 o'clock, each segment a
 * round-capped stroke over the one before. The last segment is the full track
 * underneath, so the first one's rounded start sits on it and the rest of the
 * track shows as that last share.
 */
function HealthRing({ segments }: { segments: HealthSegment[] }) {
  const total = segments.reduce((sum, segment) => sum + segment.count, 0);
  const track = segments.at(-1);
  const arcs: { segment: HealthSegment; start: number; length: number }[] = [];
  let start = 0;
  for (const segment of segments.slice(0, -1)) {
    const length = total > 0 ? (segment.count / total) * 100 : 0;
    // A zero-length dash with round caps would still paint a dot.
    if (length > 0) arcs.push({ segment, start, length });
    start += length;
  }

  return (
    // Hidden from assistive tech: the legend carries every count.
    <svg aria-hidden viewBox="0 0 36 36" fill="none" strokeWidth={4} className="size-full">
      {track && (
        <circle cx={18} cy={18} r={RADIUS} stroke="currentColor" className={TONE[track.id]} />
      )}
      {arcs.map(({ segment, start, length }) => (
        <circle
          key={segment.id}
          cx={18}
          cy={18}
          r={RADIUS}
          stroke="currentColor"
          strokeLinecap="round"
          strokeDasharray={`${length} ${100 - length}`}
          strokeDashoffset={-start}
          className={TONE[segment.id]}
        />
      ))}
    </svg>
  );
}
