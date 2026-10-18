import type { Metadata } from "next";

import { GeneralSettings } from "@/components/settings/general-settings";
import { SAMPLE_PLATFORM_SETTINGS, SAMPLE_PLATFORM_STATUS } from "@/constants/settings-sample";

export const metadata: Metadata = { title: "General" };

// The Figma opens this section straight on its first card, with no section heading.
export default function GeneralSettingsPage() {
  return <GeneralSettings initial={SAMPLE_PLATFORM_SETTINGS} status={SAMPLE_PLATFORM_STATUS} />;
}
