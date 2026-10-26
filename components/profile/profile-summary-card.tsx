import { CameraIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { initials, ROLE_LABELS } from "@/components/settings/settings-labels";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FEATURES } from "@/constants/features";
import type { AdminProfile } from "@/types/settings";

// "July 2026", in UTC so the server's render and the browser's agree.
const monthAndYear = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const row =
  "flex items-center justify-between gap-4 border-t border-border/20 py-2.75 dark:border-border";

/**
 * The signed-in admin's photo, name, role and email, then their status and
 * join date. The camera badge leads to Settings › Profile, where the photo is
 * changed.
 */
export function ProfileSummaryCard({ profile }: { profile: AdminProfile }) {
  return (
    <DashboardCard className="border-border/30 bg-linear-to-br from-[#f8fafb] to-card px-6 pt-7 text-center shadow-[0_1px_3px_rgb(24_28_30/0.05)] dark:border-border dark:from-muted/40">
      <div className="relative mx-auto size-30">
        <Avatar className="size-30 after:border-border/40">
          {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt="" />}
          <AvatarFallback className="text-3xl font-semibold">
            {initials(profile.fullName)}
          </AvatarFallback>
        </Avatar>
        {/* Settings › Profile can change the photo only once the backend stores one. */}
        {FEATURES.adminProfileExtras && (
          <Link
            href="/settings/profile"
            aria-label="Change profile photo"
            title="Change profile photo"
            className="absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full border-2 border-card bg-surface text-muted-foreground shadow-[0_1px_3px_rgb(24_28_30/0.12)] outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-muted"
          >
            <CameraIcon aria-hidden weight="bold" className="size-4.5" />
          </Link>
        )}
      </div>

      <h2 className="mt-5 text-xl leading-7 font-semibold">{profile.fullName}</h2>
      <p className="mt-1 flex justify-center">
        <span className="inline-flex h-5 items-center rounded-full border border-action/25 bg-action-soft px-2.25 text-[11px] font-medium text-action dark:border-primary/30 dark:bg-primary/15 dark:text-primary">
          {ROLE_LABELS[profile.role]}
        </span>
      </p>
      <p className="mt-2.75 text-[13px] leading-5 wrap-anywhere text-muted-foreground">
        {profile.email}
      </p>

      <dl className="mt-5.75 text-left text-[13px] leading-5">
        <div className={row}>
          <dt className="text-muted-foreground">Status</dt>
          <dd className="flex items-center gap-1.5">
            <span aria-hidden className="size-2 rounded-full bg-[#10b981]" />
            Active
          </dd>
        </div>
        <div className={row}>
          <dt className="text-muted-foreground">Member Since</dt>
          <dd>
            <time dateTime={profile.joinedAt}>
              {monthAndYear.format(new Date(profile.joinedAt))}
            </time>
          </dd>
        </div>
      </dl>
    </DashboardCard>
  );
}
