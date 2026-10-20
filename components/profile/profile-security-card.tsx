import { ArrowRightIcon, CheckCircleIcon, WarningCircleIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { formatTimeAgo } from "@/components/settings/settings-format";
import type { ActiveSession, SecuritySummary } from "@/types/settings";

const label = "text-[11px] leading-3.5 text-muted-foreground";
const value = "mt-0.5 text-sm leading-5";

/** Two-factor, password age and session count, with a way into Settings › Security. */
export function ProfileSecurityCard({
  security,
  sessions,
}: {
  security: SecuritySummary;
  sessions: ActiveSession[];
}) {
  const count = sessions.length;
  return (
    <DashboardCard className="relative isolate overflow-hidden border-border/30 shadow-[0_1px_3px_rgb(24_28_30/0.05)] dark:border-border">
      {/* The Figma's faint teal glow in the bottom corner. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -bottom-24 -z-10 size-45 rounded-full bg-action/5 blur-md dark:bg-primary/10"
      />
      <h2 className="text-xs leading-4 font-semibold tracking-wider uppercase">Security</h2>
      <dl className="mt-4 flex flex-col gap-3.75">
        <div>
          <dt className={label}>Two-Factor Auth</dt>
          <dd className={`${value} flex items-center gap-1`}>
            {security.twoFactorEnabled ? (
              <>
                <CheckCircleIcon
                  aria-hidden
                  weight="bold"
                  className="-ml-0.5 size-4.5 shrink-0 text-[#10b981]"
                />
                Enabled
              </>
            ) : (
              <>
                <WarningCircleIcon
                  aria-hidden
                  weight="bold"
                  className="-ml-0.5 size-4.5 shrink-0 text-destructive"
                />
                Disabled
              </>
            )}
          </dd>
        </div>
        <div>
          <dt className={label}>Password</dt>
          <dd className={value}>
            Last changed{" "}
            <time dateTime={security.passwordChangedAt}>
              {formatTimeAgo(security.passwordChangedAt)}
            </time>
          </dd>
        </div>
        <div>
          <dt className={label}>Active Sessions</dt>
          <dd className={value}>
            {count} {count === 1 ? "session" : "sessions"} running
          </dd>
        </div>
      </dl>
      <Link
        href="/settings/security"
        className="mt-3.5 flex w-fit items-center gap-0.5 rounded-sm text-[13px] leading-5 font-semibold tracking-[0.01em] text-action underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 dark:text-primary"
      >
        Go to Security Settings
        <ArrowRightIcon aria-hidden weight="bold" className="size-4" />
      </Link>
    </DashboardCard>
  );
}
