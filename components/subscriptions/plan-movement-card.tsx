import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from "@phosphor-icons/react/ssr";
import { cn } from "cn";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { PLAN_NAMES } from "@/components/subscriptions/subscription-format";
import type { PlanId, PlanMove } from "@/types/subscriptions";

/** How the Figma sets each plan's name in a move: Free faint, Premium teal, Elite bold. */
const NAME_STYLES: Record<PlanId, string> = {
  free: "text-muted-foreground/80",
  basic: "text-foreground",
  premium: "text-action dark:text-primary",
  elite: "font-semibold text-foreground",
};

const count = new Intl.NumberFormat("en-GB");

/** Members who moved up and down between plans this period. */
export function PlanMovementCard({
  moves,
  className,
}: {
  moves: { upgrades: PlanMove[]; downgrades: PlanMove[] };
  className?: string;
}) {
  const groups = [
    {
      id: "upgrades",
      label: "Upgrades",
      icon: ArrowUpIcon,
      moves: moves.upgrades,
      tone: "text-action dark:text-primary",
      sign: "+",
    },
    {
      id: "downgrades",
      label: "Downgrades",
      icon: ArrowDownIcon,
      moves: moves.downgrades,
      tone: "text-destructive",
      sign: "−",
    },
  ];
  return (
    <DashboardCard className={cn("flex flex-col px-8 py-8 max-sm:px-5", className)}>
      <DashboardCardTitle className="text-xl/7 font-semibold">Plan Movement</DashboardCardTitle>
      {groups.map((group) => (
        <section
          key={group.id}
          aria-labelledby={`moves-${group.id}`}
          className="mt-7 first-of-type:mt-6"
        >
          <h3
            id={`moves-${group.id}`}
            className={cn(
              "flex items-center gap-1 text-[13px]/4 font-medium tracking-wide uppercase",
              group.tone,
            )}
          >
            <group.icon aria-hidden weight="bold" className="size-3.5" />
            {group.label}
          </h3>
          <ul className="mt-2 flex flex-col gap-3">
            {group.moves.map((move) => (
              <li
                key={`${move.from}-${move.to}`}
                className="flex h-12 items-center gap-2 rounded-md bg-muted px-3 text-[15px] dark:bg-muted/50"
              >
                <span className={NAME_STYLES[move.from]}>{PLAN_NAMES[move.from]}</span>
                <ArrowRightIcon
                  aria-label="to"
                  weight="bold"
                  className="size-3.5 text-muted-foreground/60"
                />
                <span className={NAME_STYLES[move.to]}>{PLAN_NAMES[move.to]}</span>
                <span className={cn("ml-auto text-base tabular-nums", group.tone)}>
                  {group.sign}
                  {count.format(move.count)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </DashboardCard>
  );
}
