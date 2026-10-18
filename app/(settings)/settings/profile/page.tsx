import type { Metadata } from "next";

import { ProfileSettings } from "@/components/settings/profile-settings";
import { SettingsSectionHeader } from "@/components/settings/settings-section";
import { SAMPLE_ADMIN_PROFILE } from "@/constants/settings-sample";

export const metadata: Metadata = { title: "Profile" };

// UI only: the backend has no route that returns or updates the signed-in admin.
export default function ProfileSettingsPage() {
  return (
    <>
      <SettingsSectionHeader
        title="Administrator Profile"
        description="Manage your personal administrator identity and contact information."
      />
      <ProfileSettings profile={SAMPLE_ADMIN_PROFILE} />
    </>
  );
}
