import { DesktopIcon, DeviceMobileIcon, LaptopIcon } from "@phosphor-icons/react/ssr";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { formatDayAndTime } from "@/components/settings/settings-format";
import { ROLE_TITLES } from "@/components/settings/settings-labels";
import { FEATURES } from "@/constants/features";
import type { ActiveSession, AdminProfile } from "@/types/settings";

const DEVICE_ICONS: Record<ActiveSession["kind"], typeof LaptopIcon> = {
  laptop: LaptopIcon,
  phone: DeviceMobileIcon,
  desktop: DesktopIcon,
};

const label = "text-[11px] leading-3.5 text-muted-foreground";
const value = "mt-1 text-sm leading-5";

/** The admin's role, when they last signed in, and on what (the current session). */
export function AccountDetailsCard({
  profile,
  session,
}: {
  profile: AdminProfile;
  session: ActiveSession;
}) {
  const DeviceIcon = DEVICE_ICONS[session.kind];
  return (
    <DashboardCard className="border-border/30 shadow-[0_1px_3px_rgb(24_28_30/0.05)] dark:border-border">
      <h2 className="text-xs leading-4 font-semibold tracking-wider uppercase">Account Details</h2>
      <dl className="mt-4 flex flex-col gap-3.75">
        <div>
          <dt className={label}>System Role</dt>
          <dd className="mt-1">
            <span className="inline-flex min-h-8.5 items-center rounded-[4px] border border-[#e8ebef] bg-muted px-3 py-1.5 text-sm leading-5 dark:border-border">
              {ROLE_TITLES[profile.role]}
            </span>
          </dd>
        </div>
        <div>
          <dt className={label}>Last Login</dt>
          <dd className={value}>
            <time dateTime={profile.lastLoginAt}>{formatDayAndTime(profile.lastLoginAt)}</time>
          </dd>
        </div>
        {FEATURES.adminSessions && (
          <div>
            <dt className={label}>Last Login Device</dt>
            <dd className={`${value} flex items-center gap-2`}>
              <DeviceIcon
                aria-hidden
                weight="bold"
                className="size-4 shrink-0 text-[#bfc8ce] dark:text-muted-foreground/70"
              />
              <span>
                {session.os}
                <span aria-hidden> • </span>
                <span className="sr-only">, </span>
                {session.browser}
              </span>
            </dd>
          </div>
        )}
      </dl>
    </DashboardCard>
  );
}
