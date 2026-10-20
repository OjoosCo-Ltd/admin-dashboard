import type { Metadata } from "next";

import { LanguageSettings } from "@/components/settings/language-settings";
import { SettingsSectionHeader } from "@/components/settings/settings-section";
import { SAMPLE_LANGUAGE } from "@/constants/settings-sample";

export const metadata: Metadata = { title: "Language & Region" };

export default function LanguageSettingsPage() {
  return (
    <>
      <SettingsSectionHeader
        title="Language & Region"
        description="Set your preferred language and regional formats."
      />
      <LanguageSettings initial={SAMPLE_LANGUAGE} />
    </>
  );
}
