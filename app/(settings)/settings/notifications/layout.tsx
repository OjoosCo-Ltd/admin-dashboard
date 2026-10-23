import { requireFeature } from "@/libs/feature-gate";

/** Notification preferences have no route yet. The route 404s until FEATURES.notificationPreferences is on. */
export default function NotificationSettingsLayout({ children }: LayoutProps<"/settings/notifications">) {
  requireFeature("notificationPreferences");
  return children;
}
