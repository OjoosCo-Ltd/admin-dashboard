import type { Metadata } from "next";

import { NotificationSettings } from "@/components/settings/notification-settings";
import { SettingsSectionHeader } from "@/components/settings/settings-section";
import { SAMPLE_NOTIFICATION_PREFERENCES } from "@/constants/settings-sample";

export const metadata: Metadata = { title: "Notifications" };

export default function NotificationSettingsPage() {
  return (
    <>
      <SettingsSectionHeader
        title="Notification Preferences"
        description="Configure how you receive administrative alerts and system updates."
      />
      <NotificationSettings initial={SAMPLE_NOTIFICATION_PREFERENCES} />
    </>
  );
}
