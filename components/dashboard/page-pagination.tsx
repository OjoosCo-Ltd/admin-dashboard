"use client";

import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { cn } from "cn";

const count = new Intl.NumberFormat("en-US");

/** First, last and the pages around the current one, with a gap wherever pages are skipped. */
function pageItems(page: number, pageCount: number): (number | "gap-start" | "gap-end")[] {
  if (pageCount <= 5) return Array.from({ length: pageCount }, (_, index) => index + 1);
  const start = Math.min(Math.max(page - 1, 1), pageCount - 2);
  const window = [start, start + 1, start + 2];
  return [
    ...(start > 1 ? [1] : []),
    ...(start > 2 ? ["gap-start" as const] : []),
    ...window,
    ...(start + 2 < pageCount - 1 ? ["gap-end" as const] : []),
    ...(start + 2 < pageCount ? [pageCount] : []),
  ];
}

const ARROW =
  "w-8 text-foreground hover:bg-muted-strong disabled:text-[#b2b5b7] disabled:hover:bg-transparent";

const BOXED_LABELS = { prev: "Previous", next: "Next" };

/**
 * Page numbers per Figma: the dashboard's 16px muted numbers on primary, the
 * conversations Figma's compact 13px foreground numbers on action teal,
 * well-being's boxed numbers between "Previous" and "Next" buttons, subscribers'
 * squares (the same boxes with ‹ › in boxes too), or one of
 * Community's: soft (members: the current page tinted), text (discussions:
 * "Prev 1 2 3 Next", small), mini (events: the same small boxes between
 * arrows), solid (reports: 16px numbers in 28px boxes) and arrows (groups: ‹ › only).
 */
const VARIANTS: Record<
  "default" | "compact" | "boxed" | "squares" | "soft" | "text" | "mini" | "solid" | "arrows",
  {
    nav: string;
    number: string;
    idle: string;
    current: string;
    edge: string;
    /** Words in place of the carets. */
    labels: { prev: string; next: string } | false;
    /** False hides the page numbers, leaving the arrows. */
    numbers?: false;
  }
> = {
  default: {
    nav: "gap-1.5",
    number: "font-semibold text-base",
    idle: "text-muted-foreground hover:bg-muted-strong hover:text-foreground",
    current: "bg-primary text-primary-foreground",
    edge: ARROW,
    labels: false,
  },
  compact: {
    nav: "gap-1",
    number: "font-semibold text-[13px]",
    idle: "text-foreground hover:bg-muted-strong",
    current: "bg-action text-white dark:bg-primary dark:text-primary-foreground",
    edge: ARROW,
    labels: false,
  },
  boxed: {
    nav: "gap-2",
    number: "border text-sm",
    idle: "border-muted-strong bg-background text-foreground hover:bg-muted dark:border-border",
    current:
      "border-action bg-action text-white dark:border-primary dark:bg-primary dark:text-primary-foreground",
    edge: "border border-muted-strong bg-background px-3.5 text-sm text-foreground hover:bg-muted disabled:text-[#9fa3a6] disabled:hover:bg-background dark:border-border",
    labels: BOXED_LABELS,
  },
  squares: {
    nav: "gap-1.5",
    number: "h-8 min-w-8 border text-base",
    idle: "border-border/60 bg-background text-foreground hover:bg-muted dark:border-border",
    current:
      "border-action bg-action text-white dark:border-primary dark:bg-primary dark:text-primary-foreground",
    edge: "h-8 w-8 border border-border/60 bg-background text-foreground hover:bg-muted disabled:text-[#b2b5b7] disabled:hover:bg-background dark:border-border",
    labels: false,
  },
  soft: {
    nav: "gap-1",
    number: "text-sm",
    idle: "text-muted-foreground hover:bg-muted-strong hover:text-foreground",
    current: "bg-action-soft text-action dark:bg-action/25 dark:text-primary",
    edge: ARROW,
    labels: false,
  },
  text: {
    nav: "gap-2.5",
    number: "h-6 min-w-6 rounded-sm px-1 text-xs font-medium",
    idle: "text-muted-foreground hover:bg-muted-strong hover:text-foreground",
    current: "bg-action-icon text-white dark:bg-primary dark:text-primary-foreground",
    edge: "h-6 px-1 text-xs font-medium text-muted-foreground hover:text-foreground disabled:text-[#b2b5b7]",
    labels: { prev: "Prev", next: "Next" },
  },
  mini: {
    nav: "gap-1",
    number: "h-6 min-w-6 rounded-sm px-1 text-[13px]",
    idle: "text-muted-foreground hover:bg-muted-strong hover:text-foreground",
    current: "bg-action-icon text-white dark:bg-primary dark:text-primary-foreground",
    edge: "h-6 w-6 text-foreground hover:bg-muted-strong disabled:text-[#b2b5b7] disabled:hover:bg-transparent [&_svg]:size-3.5",
    labels: false,
  },
  solid: {
    nav: "gap-1",
    number: "h-7 min-w-7 text-base",
    idle: "text-foreground hover:bg-muted-strong",
    current: "bg-action text-white dark:bg-primary dark:text-primary-foreground",
    edge: ARROW,
    labels: false,
  },
  arrows: {
    nav: "gap-1",
    number: "",
    idle: "",
    current: "",
    edge: ARROW,
    labels: false,
    numbers: false,
  },
};

/** A table footer's page links: ‹ 1 2 3 … N ›, the current page filled. */
export function PagePagination({
  page,
  pageCount,
  onPageChange,
  variant = "default",
  className,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  variant?: keyof typeof VARIANTS;
  className?: string;
}) {
  const look = VARIANTS[variant];
  const step =
    // h-8 only: page numbers grow past 32px for 3-4 digits (min-w-8 below); the arrows are w-8.
    "flex h-8 items-center justify-center rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50";
  return (
    <nav aria-label="Pagination" className={cn("flex items-center", look.nav, className)}>
      <button
        type="button"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className={cn(step, look.edge)}
      >
        {look.labels ? (
          look.labels.prev
        ) : (
          <CaretLeftIcon aria-hidden weight="bold" className="size-4.5" />
        )}
      </button>
      {look.numbers !== false &&
        pageItems(page, pageCount).map((item) =>
          typeof item === "number" ? (
            <button
              key={item}
              type="button"
              aria-label={`Page ${count.format(item)}`}
              aria-current={item === page ? "page" : undefined}
              onClick={() => onPageChange(item)}
              className={cn(
                step,
                "min-w-8 px-1.5 tabular-nums",
                look.number,
                item === page ? look.current : look.idle,
              )}
            >
              {item}
            </button>
          ) : (
            <span
              key={item}
              aria-hidden
              className="px-0.5 text-base font-semibold text-muted-foreground"
            >
              …
            </span>
          ),
        )}
      <button
        type="button"
        aria-label="Next page"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
        className={cn(step, look.edge)}
      >
        {look.labels ? (
          look.labels.next
        ) : (
          <CaretRightIcon aria-hidden weight="bold" className="size-4.5" />
        )}
      </button>
    </nav>
  );
}
