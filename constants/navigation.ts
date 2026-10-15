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

export interface NavItem {
  title: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export interface NavSection {
  /** Shown above the items; the first section has none. */
  label?: string;
  items: NavItem[];
}

/** The sidebar, in the dashboard Figma's order. */
export const NAV_SECTIONS: NavSection[] = [
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
      { title: "Well-being", href: "/well-being", icon: WellbeingIcon },
      { title: "AI Center", href: "/ai-center", icon: PsychologyIcon },
      { title: "Reports & Safety", href: "/reports", icon: GavelIcon },
    ],
  },
  {
    label: "Business",
    items: [
      { title: "Subscriptions", href: "/subscriptions", icon: SyncIcon },
      { title: "Payments", href: "/payments", icon: PaymentsIcon },
    ],
  },
  {
    label: "Management",
    items: [{ title: "Analytics", href: "/analytics", icon: LeaderboardIcon }],
  },
];
