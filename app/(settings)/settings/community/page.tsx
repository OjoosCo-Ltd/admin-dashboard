import type { Metadata } from "next";

import { CommunitySettings } from "@/components/settings/community-settings";
import { SettingsSectionHeader } from "@/components/settings/settings-section";
import { SAMPLE_COMMUNITY_SETTINGS } from "@/constants/settings-sample";

export const metadata: Metadata = { title: "Community" };

export default function CommunitySettingsPage() {
  return (
    <>
      <SettingsSectionHeader
        title="Community Settings"
        description="Manage global community behaviors, group permissions, and moderation rules."
      />
      <CommunitySettings initial={SAMPLE_COMMUNITY_SETTINGS} />
    </>
  );
}
