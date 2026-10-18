import type { Metadata } from "next";

import { SecuritySettings } from "@/components/settings/security-settings";
import { SettingsSectionHeader } from "@/components/settings/settings-section";
import { SAMPLE_SECURITY, SAMPLE_SESSIONS } from "@/constants/settings-sample";

export const metadata: Metadata = { title: "Security" };

export default function SecuritySettingsPage() {
  return (
    <>
      <SettingsSectionHeader
        title="Security & Access"
        description="Manage your password, two-factor authentication, and active sessions."
      />
      <SecuritySettings security={SAMPLE_SECURITY} sessions={SAMPLE_SESSIONS} />
    </>
  );
}
