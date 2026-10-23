import { enabled, type Feature } from "@/constants/features";

export interface SettingsNavSection {
  label: string;
  /** An item is hidden while its feature is off. */
  items: { title: string; href: string; feature?: Feature }[];
}

/** Every settings section, in the Figma's order, hidden ones included. */
const ALL_SETTINGS: SettingsNavSection[] = [
  {
    label: "Account",
    items: [
      { title: "Profile", href: "/settings/profile" },
      { title: "Security", href: "/settings/security" },
      {
        title: "Notifications",
        href: "/settings/notifications",
        feature: "notificationPreferences",
      },
      { title: "Appearance", href: "/settings/appearance" },
      { title: "Language & Region", href: "/settings/language", feature: "adminPreferences" },
    ],
  },
  {
    label: "Administration",
    items: [
      { title: "Team & Roles", href: "/settings/team" },
      { title: "Permissions", href: "/settings/permissions", feature: "rolePermissions" },
      { title: "Audit Logs", href: "/settings/audit-logs", feature: "auditLog" },
    ],
  },
  {
    label: "Platform",
    items: [
      { title: "General", href: "/settings/general" },
      { title: "Matching", href: "/settings/matching" },
      { title: "Community", href: "/settings/community", feature: "communitySettings" },
      { title: "Well-being", href: "/settings/well-being", feature: "wellbeing" },
    ],
  },
];

/** The settings menu: sections whose items are all hidden drop out with their label. */
export const SETTINGS_NAV: SettingsNavSection[] = ALL_SETTINGS.map((section) => ({
  ...section,
  items: enabled(section.items),
})).filter((section) => section.items.length > 0);
