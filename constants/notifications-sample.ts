import { portrait } from "@/constants/sample-portraits";
import type { AdminNotification, NotificationCounts } from "@/types/notifications";

// UI only: the notifications Figma's figures and feed, until an admin
// notifications feed exists. Replace with API data.

export const SAMPLE_NOTIFICATION_COUNTS: NotificationCounts = {
  all: 128,
  unread: 12,
  highPriority: 4,
  resolved: 76,
};

export const SAMPLE_NOTIFICATIONS: AdminNotification[] = [
  {
    id: "ntf-10482",
    type: "verification",
    category: "Identity Auth",
    priority: "high",
    title: "New verification requires review",
    summary: "User submitted identity docs.",
    description:
      "A user has submitted required identity verification documents (Government ID and Selfie) that failed automated OCR checks. Manual review is required to verify the authenticity and match before lifting account restrictions.",
    day: "today",
    ago: "12m ago",
    date: "Aug 11, 2026, 1:52 PM",
    refId: "VER-10482",
    unread: true,
    resolved: false,
    user: { name: "Alex Mercer", id: "U-9932", avatarUrl: portrait("men/41") },
    action: { label: "Review Verification", href: "/verification" },
  },
  {
    id: "ntf-20311",
    type: "safety",
    category: "Moderation",
    priority: "high",
    title: "New safety report submitted",
    summary:
      "Community report regarding user behavior in ‘Future Tech’ community requires moderation review.",
    description:
      "A member reported repeated hostile replies from another member in the Future Tech community. The thread has three earlier reports this week, so it's been raised for a moderator to review before the automated limits apply.",
    day: "today",
    ago: "25m ago",
    date: "Aug 11, 2026, 1:39 PM",
    refId: "REP-20311",
    unread: true,
    resolved: false,
    user: { name: "Jordan Blake", id: "U-4471", avatarUrl: portrait("men/64") },
    action: { label: "Review Report", href: "/community/moderation" },
  },
  {
    id: "ntf-9821",
    type: "payments",
    category: "Billing",
    priority: "medium",
    title: "Payment failed",
    summary: "Premium subscription payment failed for invoice #INV-9821. User: Sarah Jenkins.",
    description:
      "The renewal charge for Sarah Jenkins's Premium plan was declined by the card issuer. The payment will be retried automatically in 24 hours, and the member keeps Premium features during the grace period.",
    day: "today",
    ago: "42m ago",
    date: "Aug 11, 2026, 1:22 PM",
    refId: "INV-9821",
    unread: false,
    resolved: false,
    user: { name: "Sarah Jenkins", id: "U-2208", avatarUrl: portrait("women/44") },
    action: { label: "View Payment", href: "/payments" },
  },
  {
    id: "ntf-sub-5530",
    type: "subscriptions",
    category: "Membership",
    priority: "low",
    // The Figma titles this one "Payment failed" too, over a new subscription.
    title: "New Elite subscription",
    summary: "User Marko Polo successfully subscribed to the Elite tier (Monthly).",
    description:
      "Marko Polo upgraded from Premium to the Elite tier on a monthly plan. The first charge succeeded and Elite features are already active on the account.",
    day: "today",
    ago: "1h ago",
    date: "Aug 11, 2026, 1:04 PM",
    refId: "SUB-5530",
    unread: false,
    resolved: true,
    user: { name: "Marko Polo", id: "U-7715", avatarUrl: portrait("men/86") },
    action: { label: "View Subscription", href: "/subscriptions" },
  },
  {
    id: "ntf-usr-milestone",
    type: "users",
    category: "Growth",
    priority: "low",
    title: "1,000 new sign-ups this week",
    summary: "New member registrations crossed 1,000 for the week, up 14% on last week.",
    description:
      "Registrations passed 1,000 for the week on Sunday evening, the highest weekly total this quarter. Most sign-ups came through the iOS app after the referral campaign started.",
    day: "yesterday",
    ago: "Yesterday",
    date: "Aug 10, 2026, 8:15 PM",
    refId: "USR-WK32",
    unread: false,
    resolved: true,
    action: { label: "View Users", href: "/users" },
  },
  {
    id: "ntf-grp-urban",
    type: "community",
    category: "Groups",
    priority: "low",
    title: "New community group created",
    summary: "“Urban Gardeners” was created by Admin Sarah and is now public.",
    description:
      "Admin Sarah created the public group “Urban Gardeners” in the Lifestyle category. It has 18 members so far and no reports.",
    day: "yesterday",
    ago: "Yesterday",
    date: "Aug 10, 2026, 3:40 PM",
    refId: "GRP-0412",
    unread: false,
    resolved: true,
    action: { label: "View Community", href: "/community" },
  },
];
