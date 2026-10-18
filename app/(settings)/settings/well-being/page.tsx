import type { Metadata } from "next";

import { SettingsSectionHeader } from "@/components/settings/settings-section";
import { WellbeingSettings } from "@/components/settings/wellbeing-settings";
import { SAMPLE_WELLBEING_SETTINGS } from "@/constants/settings-sample";

export const metadata: Metadata = { title: "Well-being" };

export default function WellbeingSettingsPage() {
  return (
    <>
      <SettingsSectionHeader
        title="Well-being Settings"
        description="Configure the well-being ecosystem, including assessments and coaching services."
      />
      <WellbeingSettings initial={SAMPLE_WELLBEING_SETTINGS} />
    </>
  );
}
