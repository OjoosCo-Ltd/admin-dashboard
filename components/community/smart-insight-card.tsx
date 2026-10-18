import { LightbulbIcon } from "@phosphor-icons/react/ssr";
import { cn } from "cn";
import Link from "next/link";

import type { CommunityInsight } from "@/types/community";

/** The Groups tab's teal callout: one AI observation and a link to the group it's about. */
export function SmartInsightCard({
  insight,
  className,
}: {
  insight: CommunityInsight;
  className?: string;
}) {
  return (
    <section
      aria-labelledby="smart-insight-title"
      className={cn(
        // The Figma's glow, low on the right.
        "relative overflow-hidden rounded-xl bg-action-icon bg-[radial-gradient(circle_at_92%_88%,rgb(255_255_255/0.16),transparent_38%)] p-6 text-white shadow-[0_10px_24px_rgb(0_80_105/0.18)] dark:bg-action",
        className,
      )}
    >
      <h2
        id="smart-insight-title"
        className="flex items-center gap-2 text-[13px]/4 font-semibold tracking-wider text-[#ffdcbf] uppercase"
      >
        <LightbulbIcon aria-hidden weight="bold" className="size-4.5" />
        Smart Insight
      </h2>
      <p className="mt-4 max-w-62 text-xl/7 font-semibold">{insight.text}</p>
      <Link
        href={`/community/groups/${insight.groupId}`}
        className="mt-4 inline-block rounded-xs border-b border-white/60 pb-1 text-xs/4 font-semibold tracking-wider transition-colors outline-none hover:border-white focus-visible:ring-3 focus-visible:ring-white/60"
      >
        View Group Details
      </Link>
    </section>
  );
}
