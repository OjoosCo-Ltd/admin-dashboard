import { PencilSimpleIcon } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { AccountDetailsCard } from "@/components/profile/account-details-card";
import { PersonalInfoCard } from "@/components/profile/personal-info-card";
import { ProfileActions } from "@/components/profile/profile-actions";
import { ProfilePreferencesCard } from "@/components/profile/profile-preferences-card";
import { ProfileSecurityCard } from "@/components/profile/profile-security-card";
import { ProfileSummaryCard } from "@/components/profile/profile-summary-card";
import { RecentActivityCard } from "@/components/profile/recent-activity-card";
import { SAMPLE_PROFILE_ACTIVITY } from "@/constants/profile-sample";
import {
  SAMPLE_ADMIN_PROFILE,
  SAMPLE_SECURITY,
  SAMPLE_SESSIONS,
} from "@/constants/settings-sample";

export const metadata: Metadata = { title: "My Profile" };

// The signed-in admin at a glance. Editing happens in Settings, so each form
// lives in one place: Edit Profile opens Settings › Profile, and the
// preference rows open their Settings sections. UI only: sample data.
//
// The two columns start at xl. Both columns are size containers, so the cards
// inside them (the field grid, Account Details beside Security, the summary
// beside Preferences) follow the room they actually get, sidebar or not.
export default function ProfilePage() {
  const currentSession =
    SAMPLE_SESSIONS.find((session) => session.lastActiveAt === null) ?? SAMPLE_SESSIONS[0];
  return (
    <>
      <PageHeader
        title="My Profile"
        description="Manage your administrator profile and account information."
      >
        <Link
          href="/settings/profile"
          className="inline-flex h-11.5 items-center gap-2 rounded-lg border border-border px-6 text-sm text-subtle-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <PencilSimpleIcon aria-hidden weight="bold" className="size-4.5 text-foreground" />
          Edit Profile
        </Link>
      </PageHeader>
      <div className="mt-2 grid items-start gap-6 xl:grid-cols-[21.5rem_minmax(0,1fr)]">
        <div className="@container">
          <div className="grid items-start gap-6 @2xl:grid-cols-2">
            <ProfileSummaryCard profile={SAMPLE_ADMIN_PROFILE} />
            <ProfilePreferencesCard />
          </div>
        </div>
        <div className="@container flex min-w-0 flex-col gap-6">
          <PersonalInfoCard profile={SAMPLE_ADMIN_PROFILE} />
          <div className="grid gap-6 @lg:grid-cols-2">
            <AccountDetailsCard profile={SAMPLE_ADMIN_PROFILE} session={currentSession} />
            <ProfileSecurityCard security={SAMPLE_SECURITY} sessions={SAMPLE_SESSIONS} />
          </div>
          <RecentActivityCard activity={SAMPLE_PROFILE_ACTIVITY} />
        </div>
      </div>
      <ProfileActions sessions={SAMPLE_SESSIONS} />
    </>
  );
}
