// ⚠️ PROVISIONAL: the backend has no settings routes yet, so these shapes
// follow the Settings Figma. Only the admin list and role change exist
// (GET /admin/users/admins, PATCH /admin/users/{id}/role).

export type AdminRole = "super-admin" | "admin" | "moderator" | "support";

export interface AdminProfile {
  fullName: string;
  email: string;
  phone: string;
  role: AdminRole;
  avatarUrl?: string;
  /** ISO date-times. */
  joinedAt: string;
  lastLoginAt: string;
  /** IANA zone the admin's own times are shown in. */
  timezone: string;
}

export interface SecuritySummary {
  /** ISO date-times. */
  passwordChangedAt: string;
  twoFactorEnabled: boolean;
  failedLoginAttempts: number;
  lastSuccessfulLoginAt: string;
}

export interface ActiveSession {
  id: string;
  device: string;
  kind: "laptop" | "phone" | "desktop";
  /** "macOS", "iOS", "Windows". */
  os: string;
  browser: string;
  /** Signed in through the admin web app or the mobile app. */
  client: "web" | "app";
  location: string;
  ip: string;
  /** ISO date-time. */
  createdAt: string;
  /** ISO date-time; null for the session making the request. */
  lastActiveAt: string | null;
}

export interface NotificationPreference {
  id: string;
  channel: "email" | "dashboard";
  title: string;
  description: string;
  enabled: boolean;
}

export type AdminStatus = "active" | "pending" | "suspended";

export interface AdminMember {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: AdminRole;
  status: AdminStatus;
  /** ISO date-time; null if they've never signed in. */
  lastActiveAt: string | null;
}

export interface RoleSummary {
  role: AdminRole;
  description: string;
  users: number;
}

export type PermissionAction = "view" | "create" | "edit" | "delete" | "export";

export type PermissionModule =
  | "dashboard"
  | "users"
  | "verification"
  | "matches"
  | "conversations"
  | "ai-center"
  | "reports"
  | "payments"
  | "settings";

export interface ModulePermissions {
  module: PermissionModule;
  granted: PermissionAction[];
  /** Actions only a Super Admin can grant; shown locked. */
  restricted: PermissionAction[];
}

export type AuditResult = "success" | "failed" | "warning";

export type AuditActionType = "moderation" | "settings" | "sync" | "export" | "sign-in";

export interface AuditLog {
  id: string;
  actor: {
    kind: "admin" | "system" | "anonymous";
    name: string;
    /** The admin's email, the service, or "Unauthenticated". */
    detail: string;
  };
  action: string;
  actionType: AuditActionType;
  module: string;
  /** ISO date-time. */
  at: string;
  ip: string;
  session: string;
  result: AuditResult;
}

export interface PlatformSettings {
  name: string;
  supportEmail: string;
  description: string;
  language: string;
  currency: string;
  timezone: string;
}

export interface PlatformStatus {
  status: "operational" | "degraded" | "outage";
  version: string;
  environment: "Production" | "Staging";
  /** ISO date-time. */
  updatedAt: string;
}

export interface MatchingSettings {
  matchingEnabled: boolean;
  aiEnabled: boolean;
  insightsEnabled: boolean;
  expirationHours: number;
  compatibilityThreshold: number;
  dailyMatchLimit: number;
}

export interface EngineStatus {
  modelVersion: string;
  /** 0–100. */
  load: number;
  /** ISO date-time. */
  lastSyncedAt: string;
}

export interface CommunitySettings {
  groupsEnabled: boolean;
  userEventsEnabled: boolean;
  autoModeration: boolean;
  groupApprovalRequired: boolean;
  maxGroupsPerUser: number;
  reportThreshold: number;
}

export type AssessmentFrequency = "daily" | "weekly" | "biweekly" | "monthly";

export interface WellbeingSettings {
  areaEnabled: boolean;
  dailyAssessment: boolean;
  mindfulnessLibrary: boolean;
  coachBooking: boolean;
  assessmentFrequency: AssessmentFrequency;
  /** Minutes. */
  coachSessionLength: number;
}

/** The admin's own display preferences. The theme itself lives in next-themes. */
export interface AppearancePreferences {
  density: "comfortable" | "compact";
  sidebar: "expanded" | "icons";
}

export type DateFormat = "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD" | "D MMM YYYY";

export interface LanguagePreferences {
  /** BCP 47: "en-US". */
  language: string;
  dateFormat: DateFormat;
  clock24: boolean;
  /** IANA zone. */
  timezone: string;
}
