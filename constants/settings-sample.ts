import { SAMPLE_ADMIN_AVATAR_URL } from "@/constants/dashboard-sample";
import { portrait } from "@/constants/sample-portraits";
import type {
  ActiveSession,
  AdminMember,
  AdminProfile,
  AdminRole,
  AppearancePreferences,
  AuditLog,
  CommunitySettings,
  EngineStatus,
  LanguagePreferences,
  MatchingSettings,
  ModulePermissions,
  NotificationPreference,
  PlatformSettings,
  PlatformStatus,
  RoleSummary,
  SecuritySummary,
  WellbeingSettings,
} from "@/types/settings";

/**
 * The moment the sample data is "now", so relative times ("2 hours ago",
 * "Yesterday") read the same on the server and in every browser. Use the
 * real clock once these come from the API.
 */
export const SAMPLE_NOW = "2026-10-18T15:00:00Z";

export const SAMPLE_ADMIN_PROFILE: AdminProfile = {
  fullName: "Alex Rivera",
  email: "alex.rivera@xparience.com",
  phone: "+44 7700 900000",
  role: "super-admin",
  avatarUrl: SAMPLE_ADMIN_AVATAR_URL,
  joinedAt: "2026-07-02T09:00:00Z",
  lastLoginAt: "2026-10-18T09:41:00Z",
  timezone: "Europe/London",
};

export const SAMPLE_SECURITY: SecuritySummary = {
  passwordChangedAt: "2026-07-14T10:00:00Z",
  twoFactorEnabled: true,
  failedLoginAttempts: 0,
  lastSuccessfulLoginAt: "2026-10-18T09:41:00Z",
};

export const SAMPLE_SESSIONS: ActiveSession[] = [
  {
    id: "session-mac",
    device: "MacBook Pro",
    kind: "laptop",
    os: "macOS",
    browser: "Chrome",
    client: "web",
    location: "London, UK",
    ip: "82.14.221.9",
    createdAt: "2026-05-11T08:20:00Z",
    lastActiveAt: null,
  },
  {
    id: "session-iphone",
    device: "iPhone 13",
    kind: "phone",
    os: "iOS",
    browser: "Safari",
    client: "app",
    location: "London, UK",
    ip: "82.14.208.41",
    createdAt: "2026-10-16T19:05:00Z",
    lastActiveAt: "2026-10-18T13:00:00Z",
  },
  {
    id: "session-windows",
    device: "Windows PC",
    kind: "desktop",
    os: "Windows",
    browser: "Edge",
    client: "web",
    location: "Manchester, UK",
    ip: "86.150.77.12",
    createdAt: "2026-09-29T07:45:00Z",
    lastActiveAt: "2026-10-17T16:20:00Z",
  },
];

export const SAMPLE_NOTIFICATION_PREFERENCES: NotificationPreference[] = [
  {
    id: "report-assigned",
    channel: "email",
    title: "New Report Assigned",
    description:
      "Receive an email when a new administrative report is directly assigned to your queue.",
    enabled: true,
  },
  {
    id: "safety-alert",
    channel: "email",
    title: "High-Priority Safety Alert",
    description: "Immediate email alerts for critical system safety issues or security breaches.",
    enabled: true,
  },
  {
    id: "payment-failure",
    channel: "email",
    title: "Payment Failure Alert",
    description: "Notifications for failed transactions related to subscriptions or billing.",
    enabled: false,
  },
  {
    id: "system-alert",
    channel: "email",
    title: "System Alert",
    description: "Routine notices regarding scheduled maintenance, updates, and expected downtime.",
    enabled: true,
  },
  {
    id: "verification-cases",
    channel: "dashboard",
    title: "New Verification Cases",
    description:
      "In-app alerts when new user identity or compliance verifications are pending review.",
    enabled: true,
  },
  {
    id: "moderation-alerts",
    channel: "dashboard",
    title: "Community Moderation Alerts",
    description:
      "Notifications for flagged user-generated content requiring immediate administrator intervention.",
    enabled: false,
  },
  {
    id: "system-warnings",
    channel: "dashboard",
    title: "System Warnings",
    description:
      "Alerts regarding approaching API rate limits, storage capacity caps, or performance degradation.",
    enabled: true,
  },
];

export const SAMPLE_ADMIN_TOTAL = 24;

export const SAMPLE_ADMINS: AdminMember[] = [
  {
    id: "admin-sarah",
    name: "Sarah Jenkins",
    email: "sarah.j@xparience.com",
    avatarUrl: portrait("women/32"),
    role: "super-admin",
    status: "active",
    lastActiveAt: "2026-10-18T09:41:00Z",
  },
  {
    id: "admin-michael",
    name: "Michael Chen",
    email: "m.chen@xparience.com",
    avatarUrl: portrait("men/22"),
    role: "admin",
    status: "active",
    lastActiveAt: "2026-10-17T14:20:00Z",
  },
  {
    id: "admin-elena",
    name: "Elena Rodriguez",
    email: "elena.r@xparience.com",
    role: "moderator",
    status: "pending",
    lastActiveAt: null,
  },
  {
    id: "admin-david",
    name: "David Kim",
    email: "d.kim@xparience.com",
    avatarUrl: portrait("men/52"),
    role: "support",
    status: "suspended",
    lastActiveAt: "2026-10-12T11:05:00Z",
  },
];

export const SAMPLE_ROLE_SUMMARIES: RoleSummary[] = [
  {
    role: "super-admin",
    description: "Full access to all system settings, billing, and user management.",
    users: 2,
  },
  {
    role: "admin",
    description: "Can manage content, view analytics, and edit standard settings.",
    users: 8,
  },
  {
    role: "moderator",
    description: "Access to user generated content, approvals, and basic reporting.",
    users: 5,
  },
  {
    role: "support",
    description: "Read-only access to user profiles and activity logs for assistance.",
    users: 9,
  },
];

const ALL = ["view", "create", "edit", "delete", "export"] as const;

/** Each role's grants. Admin's are the Figma's; the others are ⚠️ PROVISIONAL. */
export const SAMPLE_PERMISSIONS: Record<AdminRole, ModulePermissions[]> = {
  "super-admin": [
    "dashboard",
    "users",
    "verification",
    "matches",
    "conversations",
    "ai-center",
    "reports",
    "payments",
    "settings",
  ].map((module) => ({
    module: module as ModulePermissions["module"],
    granted: [...ALL],
    restricted: [],
  })),
  admin: [
    { module: "dashboard", granted: ["view", "export"], restricted: [] },
    { module: "users", granted: ["view", "create", "edit"], restricted: ["delete"] },
    { module: "verification", granted: ["view", "edit"], restricted: [] },
    { module: "matches", granted: ["view", "export"], restricted: [] },
    { module: "conversations", granted: ["view"], restricted: [] },
    { module: "ai-center", granted: ["view", "create", "edit"], restricted: [] },
    { module: "reports", granted: ["view", "create", "edit", "export"], restricted: [] },
    { module: "payments", granted: ["view", "export"], restricted: ["create", "edit", "delete"] },
    { module: "settings", granted: ["view"], restricted: [] },
  ],
  moderator: [
    { module: "dashboard", granted: ["view"], restricted: [] },
    { module: "users", granted: ["view"], restricted: ["delete"] },
    { module: "verification", granted: ["view", "edit"], restricted: [] },
    { module: "matches", granted: ["view"], restricted: [] },
    { module: "conversations", granted: ["view", "edit"], restricted: [] },
    { module: "ai-center", granted: [], restricted: [] },
    { module: "reports", granted: ["view", "create", "edit"], restricted: [] },
    { module: "payments", granted: [], restricted: ["create", "edit", "delete"] },
    { module: "settings", granted: [], restricted: ["edit", "delete"] },
  ],
  support: [
    { module: "dashboard", granted: ["view"], restricted: [] },
    { module: "users", granted: ["view"], restricted: ["delete"] },
    { module: "verification", granted: ["view"], restricted: [] },
    { module: "matches", granted: ["view"], restricted: [] },
    { module: "conversations", granted: ["view"], restricted: [] },
    { module: "ai-center", granted: [], restricted: [] },
    { module: "reports", granted: ["view"], restricted: [] },
    { module: "payments", granted: [], restricted: ["create", "edit", "delete"] },
    { module: "settings", granted: [], restricted: ["edit", "delete"] },
  ],
};

/** The Figma's module count; the sample covers the first nine. */
export const SAMPLE_PERMISSION_MODULE_TOTAL = 16;

export const SAMPLE_AUDIT_LOG_TOTAL = 12492;

export const SAMPLE_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-1",
    actor: { kind: "admin", name: "Sarah Jenkins", detail: "s.jenkins@xparience.com" },
    action: "Moderator resolved user report #8492",
    actionType: "moderation",
    module: "User Management",
    at: "2026-10-18T14:32:01Z",
    ip: "192.168.1.45",
    session: "sid_99x82",
    result: "success",
  },
  {
    id: "log-2",
    actor: { kind: "admin", name: "Mike Ross", detail: "m.ross@xparience.com" },
    action: "Modified global security policy settings",
    actionType: "settings",
    module: "System Settings",
    at: "2026-10-18T13:15:44Z",
    ip: "10.0.0.22",
    session: "sid_77a12",
    result: "success",
  },
  {
    id: "log-3",
    actor: { kind: "system", name: "System Service", detail: "API Gateway" },
    action: "Failed data sync with external CRM API",
    actionType: "sync",
    module: "Integration",
    at: "2026-10-18T12:00:05Z",
    ip: "Internal",
    session: "srv_job_42",
    result: "failed",
  },
  {
    id: "log-4",
    actor: { kind: "admin", name: "Sarah Jenkins", detail: "s.jenkins@xparience.com" },
    action: "Exported monthly usage report (PDF)",
    actionType: "export",
    module: "Reporting",
    at: "2026-10-18T10:45:12Z",
    ip: "192.168.1.45",
    session: "sid_99x82",
    result: "success",
  },
  {
    id: "log-5",
    actor: { kind: "anonymous", name: "Unknown User", detail: "Unauthenticated" },
    action: "Multiple failed login attempts (5)",
    actionType: "sign-in",
    module: "Authentication",
    at: "2026-10-18T09:12:33Z",
    ip: "203.0.113.4",
    session: "None",
    result: "warning",
  },
];

export const SAMPLE_PLATFORM_SETTINGS: PlatformSettings = {
  name: "Xparience",
  supportEmail: "support@xparience.com",
  description: "A dating platform for intentional connections, with well-being built in.",
  language: "en-US",
  currency: "USD",
  timezone: "UTC",
};

export const SAMPLE_PLATFORM_STATUS: PlatformStatus = {
  status: "operational",
  version: "v2.4.1 (Stable)",
  environment: "Production",
  updatedAt: "2026-10-14T14:30:00Z",
};

export const SAMPLE_MATCHING_SETTINGS: MatchingSettings = {
  matchingEnabled: true,
  aiEnabled: true,
  insightsEnabled: false,
  expirationHours: 24,
  compatibilityThreshold: 75,
  dailyMatchLimit: 3,
};

export const SAMPLE_ENGINE_STATUS: EngineStatus = {
  modelVersion: "v4.2.1-stable",
  load: 35,
  lastSyncedAt: "2026-10-18T14:58:00Z",
};

export const SAMPLE_COMMUNITY_SETTINGS: CommunitySettings = {
  groupsEnabled: true,
  userEventsEnabled: true,
  autoModeration: false,
  groupApprovalRequired: true,
  maxGroupsPerUser: 5,
  reportThreshold: 3,
};

export const SAMPLE_WELLBEING_SETTINGS: WellbeingSettings = {
  areaEnabled: true,
  dailyAssessment: true,
  mindfulnessLibrary: false,
  coachBooking: true,
  assessmentFrequency: "daily",
  coachSessionLength: 45,
};

export const SAMPLE_APPEARANCE: AppearancePreferences = {
  density: "comfortable",
  sidebar: "expanded",
};

export const SAMPLE_LANGUAGE: LanguagePreferences = {
  language: "en-US",
  dateFormat: "DD/MM/YYYY",
  clock24: true,
  timezone: SAMPLE_ADMIN_PROFILE.timezone,
};
