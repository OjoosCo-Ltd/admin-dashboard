import {
  ClockCounterClockwiseIcon,
  DesktopIcon,
  DeviceMobileIcon,
  DevicesIcon,
  KeyIcon,
  LaptopIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { SignOutSessionsDialog } from "@/components/account/sign-out-sessions-dialog";
import { ToastButton } from "@/components/dashboard/toast-button";
import { formatDayAndTime, formatTimeAgo } from "@/components/settings/settings-format";
import { SettingsCard } from "@/components/settings/settings-section";
import type { ActiveSession, SecuritySummary } from "@/types/settings";

const DEVICE_ICONS: Record<ActiveSession["kind"], Icon> = {
  laptop: LaptopIcon,
  phone: DeviceMobileIcon,
  desktop: DesktopIcon,
};

const outlineButton =
  "mt-6 flex h-9.5 w-full items-center justify-center rounded-lg border border-[#dbe1e5] bg-background text-[15px] outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 dark:border-border";

function IconTitle({
  icon,
  title,
  badge,
  children,
}: {
  icon: ReactNode;
  title: string;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <span
        aria-hidden
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#eef6fa] text-action dark:bg-action/25 dark:text-primary [&_svg]:size-6"
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl leading-7 font-bold">{title}</h3>
          {badge}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}

/** Password, two-factor and sign-in history beside the devices signed in now. */
export function SecuritySettings({
  security,
  sessions,
}: {
  security: SecuritySummary;
  sessions: ActiveSession[];
}) {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <div className="flex flex-col gap-6">
        <SettingsCard className="p-6">
          <IconTitle icon={<KeyIcon weight="bold" />} title="Password">
            Last changed: {formatTimeAgo(security.passwordChangedAt)}
          </IconTitle>
          {/* UI only: no password change flow for signed-in admins yet. */}
          <ToastButton
            message="Changing your password isn't available yet"
            className={outlineButton}
          >
            Change Password
          </ToastButton>
        </SettingsCard>

        <SettingsCard className="p-6">
          <IconTitle
            icon={<ShieldCheckIcon weight="bold" />}
            title="Two-Factor Authentication"
            badge={
              <span className="mt-0.5 shrink-0 rounded-full bg-[#e6f4ea] px-2.5 py-0.5 text-xs text-[#137333] dark:bg-success/15 dark:text-success">
                {security.twoFactorEnabled ? "Enabled" : "Off"}
              </span>
            }
          >
            Adds an extra layer of security.
          </IconTitle>
          <ToastButton
            message="Managing two-factor authentication isn't available yet"
            className={outlineButton}
          >
            Manage 2FA
          </ToastButton>
        </SettingsCard>

        <SettingsCard className="px-6 pt-6 pb-4">
          <h3 className="flex items-center gap-2.5 text-base font-bold">
            <ClockCounterClockwiseIcon aria-hidden weight="bold" className="size-5" />
            Login History
          </h3>
          <dl className="mt-3 divide-y divide-border/40 text-sm dark:divide-border">
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-muted-foreground">Failed Login Attempts</dt>
              <dd className="font-bold tabular-nums">{security.failedLoginAttempts}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-muted-foreground">Last Successful Login</dt>
              <dd>{formatDayAndTime(security.lastSuccessfulLoginAt)}</dd>
            </div>
          </dl>
        </SettingsCard>
      </div>

      <SettingsCard className="flex flex-col overflow-hidden lg:min-h-full">
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-6">
          <div>
            <h3 id="active-sessions" className="text-xl leading-7 font-bold">
              Active Sessions
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Devices currently logged into your account.
            </p>
          </div>
          <DevicesIcon aria-hidden className="size-7 shrink-0 text-action dark:text-primary" />
        </div>
        <div className="overflow-x-auto">
          <table aria-labelledby="active-sessions" className="w-full min-w-120 text-left">
            <thead className="bg-[#f7f8fa] text-[13px] font-semibold tracking-wide dark:bg-muted/40">
              <tr>
                <th scope="col" className="w-[34%] py-3.5 pl-4 font-semibold">
                  Device
                </th>
                <th scope="col" className="w-[24%] py-3.5 font-semibold">
                  Location
                </th>
                <th scope="col" className="py-3.5 font-semibold">
                  Status
                </th>
                <th scope="col" className="py-3.5 pr-4 text-right font-semibold">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 dark:divide-border">
              {sessions.map((session) => {
                const Glyph = DEVICE_ICONS[session.kind];
                const current = session.lastActiveAt === null;
                return (
                  <tr key={session.id}>
                    <td className="py-4 pl-4">
                      <span className="flex items-center gap-3">
                        <Glyph aria-hidden className="size-6 shrink-0 text-muted-foreground" />
                        <span>
                          <span className="block text-sm leading-5">{session.device}</span>
                          <span className="block text-xs text-outline">{session.browser}</span>
                        </span>
                      </span>
                    </td>
                    <td className="py-4 pr-3 text-sm leading-5">{session.location}</td>
                    <td className="py-4 text-sm">
                      {session.lastActiveAt === null ? (
                        <span className="flex items-center gap-1.5 text-action dark:text-primary">
                          <span aria-hidden className="size-1.5 rounded-full bg-current" />
                          Current Session
                        </span>
                      ) : (
                        <span className="text-outline">{formatTimeAgo(session.lastActiveAt)}</span>
                      )}
                    </td>
                    <td className="py-4 pr-4 text-right text-sm">
                      {current ? (
                        <span className="text-outline">Active</span>
                      ) : (
                        <ToastButton
                          message="Signing out a single session isn't available yet"
                          aria-label={`Sign out ${session.device}`}
                          className="rounded-sm text-muted-foreground outline-none hover:text-destructive hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          Sign Out
                        </ToastButton>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-auto flex justify-end border-t border-border/40 px-6 py-6 dark:border-border">
          {/* The short confirm: the sessions are already listed above. */}
          <SignOutSessionsDialog
            trigger={
              <button
                type="button"
                className="h-10.5 rounded-lg border border-[#f2b8b5] px-6 text-base text-destructive outline-none hover:bg-destructive/5 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Sign Out All Other Sessions
              </button>
            }
          />
        </div>
      </SettingsCard>
    </div>
  );
}
