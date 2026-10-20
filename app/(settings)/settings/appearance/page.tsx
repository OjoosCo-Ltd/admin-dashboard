import type { Metadata } from "next";

import { AppearanceSettings } from "@/components/settings/appearance-settings";
import { SettingsSectionHeader } from "@/components/settings/settings-section";
import { SAMPLE_APPEARANCE } from "@/constants/settings-sample";

export const metadata: Metadata = { title: "Appearance" };

export default function AppearanceSettingsPage() {
  return (
    <>
      <SettingsSectionHeader
        title="Appearance Settings"
        description="Customise your dashboard workspace experience."
      />
      <AppearanceSettings initial={SAMPLE_APPEARANCE} />
    </>
  );
}
