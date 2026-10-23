import type { ComponentType, SVGProps } from "react";

import {
  BubbleChatIcon,
  CalendarLoveIcon,
  DashboardIcon,
  FavoriteIcon,
  GavelIcon,
  GroupIcon,
  LeaderboardIcon,
  PaymentsIcon,
  PsychologyIcon,
  SyncIcon,
  UserMultipleIcon,
  VerifiedUserIcon,
  WellbeingIcon,
} from "@/components/icons/app-icons";
import { enabled, type Feature } from "@/constants/features";

export interface NavItem {
  title: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Hidden while this feature is off. */
  feature?: Feature;
}

export interface NavSection {
  /** Shown above the items; the first section has none. */
  label?: string;
  items: NavItem[];
}

/** Every sidebar section, in the dashboard Figma's order, hidden ones included. */
const ALL_SECTIONS: NavSection[] = [
  { items: [{ title: "Dashboard", href: "/dashboard", icon: DashboardIcon }] },
  {
    label: "Users & Engagement",
    items: [
      { title: "Users", href: "/users", icon: GroupIcon },
      { title: "Verification", href: "/verification", icon: VerifiedUserIcon },
      { title: "Matches", href: "/matches", icon: FavoriteIcon },
      { title: "Conversations", href: "/conversations", icon: BubbleChatIcon },
      { title: "Virtual Dates", href: "/virtual-dates", icon: CalendarLoveIcon },
      { title: "Community", href: "/community", icon: UserMultipleIcon },
      { title: "Well-being", href: "/well-being", icon: WellbeingIcon, feature: "wellbeing" },
      { title: "AI Center", href: "/ai-center", icon: PsychologyIcon, feature: "aiMetrics" },
      { title: "Reports & Safety", href: "/reports", icon: GavelIcon },
    ],
  },
  {
    label: "Business",
    items: [
      { title: "Subscriptions", href: "/subscriptions", icon: SyncIcon, feature: "subscriptions" },
      { title: "Payments", href: "/payments", icon: PaymentsIcon, feature: "payments" },
    ],
  },
  {
    label: "Management",
    items: [{ title: "Analytics", href: "/analytics", icon: LeaderboardIcon }],
  },
];

/** The sidebar: sections whose items are all hidden drop out with their label. */
export const NAV_SECTIONS: NavSection[] = ALL_SECTIONS.map((section) => ({
  ...section,
  items: enabled(section.items),
})).filter((section) => section.items.length > 0);
