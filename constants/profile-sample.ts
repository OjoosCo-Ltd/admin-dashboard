import { FEATURES } from "@/constants/features";
import type { ProfileActivity } from "@/types/profile";

/**
 * The signed-in admin's latest actions, newest first. The Figma's copy is
 * enterprise software's ("Enterprise Client A", "Q3 Strategy Planning");
 * these are the same actions in this admin's terms, against SAMPLE_NOW.
 */
export const SAMPLE_PROFILE_ACTIVITY: ProfileActivity[] = [
  {
    id: "activity-plans",
    at: "2026-10-18T10:15:00Z",
    action: "Updated subscription settings for",
    target: {
      label: "the Elite plan",
      href: FEATURES.subscriptions ? "/subscriptions" : undefined,
    },
  },
  {
    id: "activity-event",
    at: "2026-10-17T14:30:00Z",
    action: "Published community event:",
    target: { label: "“Tech Founders Mixer”", href: "/community/events" },
  },
  {
    id: "activity-verifications",
    at: "2026-10-12T09:00:00Z",
    action: "Approved 5 verification requests",
  },
];
