import type { Metadata } from "next";
import { Suspense } from "react";

import {
  NotificationCenter,
  NotificationCenterFallback,
} from "@/components/notifications/notification-center";
import { SAMPLE_NOTIFICATION_COUNTS, SAMPLE_NOTIFICATIONS } from "@/constants/notifications-sample";

export const metadata: Metadata = { title: "Notifications" };

// UI only: the feed is the Figma's sample. The backend's /notifications serves
// members, and there's no admin feed yet.
export default function NotificationsPage() {
  const feed = { notifications: SAMPLE_NOTIFICATIONS, counts: SAMPLE_NOTIFICATION_COUNTS };
  return (
    // The tab, filters and open notification live in the URL.
    <Suspense fallback={<NotificationCenterFallback {...feed} />}>
      <NotificationCenter {...feed} />
    </Suspense>
  );
}
