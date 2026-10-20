export interface SettingsNavSection {
  label: string;
  items: { title: string; href: string }[];
}

/** The settings menu, in the Figma's order. */
export const SETTINGS_NAV: SettingsNavSection[] = [
  {
    label: "Account",
    items: [
      { title: "Profile", href: "/settings/profile" },
      { title: "Security", href: "/settings/security" },
      { title: "Notifications", href: "/settings/notifications" },
      { title: "Appearance", href: "/settings/appearance" },
      { title: "Language & Region", href: "/settings/language" },
    ],
  },
  {
    label: "Administration",
    items: [
      { title: "Team & Roles", href: "/settings/team" },
      { title: "Permissions", href: "/settings/permissions" },
      { title: "Audit Logs", href: "/settings/audit-logs" },
    ],
  },
  {
    label: "Platform",
    items: [
      { title: "General", href: "/settings/general" },
      { title: "Matching", href: "/settings/matching" },
      { title: "Community", href: "/settings/community" },
      { title: "Well-being", href: "/settings/well-being" },
    ],
  },
];
