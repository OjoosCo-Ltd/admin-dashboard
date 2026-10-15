import { ShieldIcon } from "@phosphor-icons/react/ssr";
import { cn } from "cn";
import { useId } from "react";

// The shield's "i" is punched out in the tile's color, so the tile stays
// opaque in both themes.
const TILE = "bg-[#d8eaf3] dark:bg-[#123440]";

/** Why message content stays hidden: shown above the conversation figures. */
export function PrivacyNotice() {
  const titleId = useId();

  return (
    <aside
      aria-labelledby={titleId}
      className="flex items-start gap-6 rounded-lg border border-[#b1d2e0] bg-[#ecf6fd] p-6 dark:border-action/50 dark:bg-action/15"
    >
      {/* The Figma's tile is taller than it is wide, with the glyph near its top. */}
      <span
        aria-hidden
        className={cn(
          "flex h-12.5 w-10 shrink-0 justify-center rounded-md pt-2.25 text-action dark:text-primary",
          TILE,
        )}
      >
        <ShieldInfoIcon />
      </span>
      <div className="min-w-0">
        <h2
          id={titleId}
          className="text-xs/4 font-semibold tracking-wider text-action dark:text-primary"
        >
          Privacy Policy Implementation
        </h2>
        {/* max-w-200 breaks the lines where the Figma does at 1440px. */}
        <p className="mt-1 max-w-200 text-[13px]/4.5 text-muted-foreground">
          Conversation content is hidden by default to protect user privacy. Messages can only be
          reviewed when a conversation has been reported, flagged by automated safety systems, or
          requires moderation.
        </p>
      </div>
    </aside>
  );
}

/**
 * The Figma's privacy glyph: a solid shield with an "i" cut out of it.
 * Phosphor has no such icon, so the "i" is drawn over its shield in the
 * tile's color.
 */
function ShieldInfoIcon() {
  return (
    <span className="relative size-6">
      <ShieldIcon weight="fill" className="size-full" />
      <span className={cn("absolute top-2 left-2.75 size-0.5 rounded-full", TILE)} />
      <span className={cn("absolute top-3 left-2.75 h-1.5 w-0.5", TILE)} />
    </span>
  );
}
