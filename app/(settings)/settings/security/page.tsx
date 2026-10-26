import type { Metadata } from "next";

import { SecuritySettings } from "@/components/settings/security-settings";
import { SettingsSectionHeader } from "@/components/settings/settings-section";
import { FEATURES } from "@/constants/features";
import { SAMPLE_SECURITY, SAMPLE_SESSIONS } from "@/constants/settings-sample";

export const metadata: Metadata = { title: "Security" };

// Names only the parts of the section that are shown.
const TOPICS = [
  "your password",
  FEATURES.mfa && "two-factor authentication",
  FEATURES.adminSessions && "active sessions",
].filter((topic) => typeof topic === "string");

export default function SecuritySettingsPage() {
  return (
    <>
      <SettingsSectionHeader
        title="Security & Access"
        description={`Manage ${new Intl.ListFormat("en-US").format(TOPICS)}.`}
      />
      <SecuritySettings security={SAMPLE_SECURITY} sessions={SAMPLE_SESSIONS} />
    </>
  );
}
