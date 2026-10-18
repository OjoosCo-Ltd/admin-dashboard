import type { Metadata } from "next";

import { MatchingSettings } from "@/components/settings/matching-settings";
import { SettingsSectionHeader } from "@/components/settings/settings-section";
import { SAMPLE_ENGINE_STATUS, SAMPLE_MATCHING_SETTINGS } from "@/constants/settings-sample";

export const metadata: Metadata = { title: "Matching" };

export default function MatchingSettingsPage() {
  return (
    <>
      <SettingsSectionHeader
        title="Matching Settings"
        description="Configure the core AI matchmaking engine and discovery parameters."
      />
      <MatchingSettings initial={SAMPLE_MATCHING_SETTINGS} engine={SAMPLE_ENGINE_STATUS} />
    </>
  );
}
