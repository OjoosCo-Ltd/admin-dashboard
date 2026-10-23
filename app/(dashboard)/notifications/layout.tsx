import { requireFeature } from "@/libs/feature-gate";

/** There's no admin notification feed yet. The route 404s until FEATURES.adminNotifications is on. */
export default function NotificationsLayout({ children }: LayoutProps<"/notifications">) {
  requireFeature("adminNotifications");
  return children;
}
