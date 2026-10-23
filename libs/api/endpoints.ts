/**
 * Backend routes the admin uses, relative to API_URL. Taken from
 * https://staging.xparience.com/docs-json (re-checked 2026-10-23: 163 paths, 59
 * admin operations, 57 under /admin plus two under /verification/admin), plus
 * the member routes some admin screens need. Pass them to apiClient as-is; it
 * prefixes the /api/backend proxy.
 *
 * The spec documents request DTOs and query params (types/api-dtos.ts, generated)
 * but no response bodies, so type each response from a live sample.
 */
export const ENDPOINTS = {
  // Called server-side by app/api/auth/*, never through the proxy.
  auth: {
    login: "/auth/login",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    /** Public: emails a 6-digit code. */
    passwordResetRequest: "/auth/password-reset/request",
    passwordResetVerifyOtp: "/auth/password-reset/verify-otp",
    passwordReset: "/auth/password-reset/reset",
  },
  system: {
    health: "/health",
    /** ?fileName: signs a storage path into a URL. */
    image: "/images",
    /** The caller's own member profile. */
    profileMe: "/profile/me",
  },
  dashboard: {
    overview: "/admin/dashboard/overview",
    /** ?period=day|week|month (default week) &from &to */
    userGrowth: "/admin/dashboard/user-growth",
    /** ?period=day|week|month (default day) &from &to &days (default 30) */
    engagement: "/admin/dashboard/engagement",
  },
  users: {
    /** ?page &limit(≤100) &search &role &status &onboardingStatus &sortBy &sortOrder */
    list: "/admin/users",
    admins: "/admin/users/admins",
    createAdmin: "/admin/users/create-admin",
    /** GET detail, DELETE (body `{ reason, confirm: true }`) */
    detail: (userId: string) => `/admin/users/${userId}`,
    role: (userId: string) => `/admin/users/${userId}/role`,
    suspend: (userId: string) => `/admin/users/${userId}/suspend`,
    unsuspend: (userId: string) => `/admin/users/${userId}/unsuspend`,
    activity: (userId: string) => `/admin/users/${userId}/activity`,
  },
  profiles: {
    list: "/admin/profiles",
    /** GET detail, PATCH admin override */
    detail: (userId: string) => `/admin/profiles/${userId}`,
    status: (userId: string) => `/admin/profiles/${userId}/status`,
    reOnboard: (userId: string) => `/admin/profiles/${userId}/re-onboard`,
    image: (userId: string, imageId: string) => `/admin/profiles/${userId}/images/${imageId}`,
  },
  verification: {
    // These two live under /verification/admin, not /admin/verification.
    list: "/verification/admin/all",
    review: (userId: string) => `/verification/admin/${userId}/review`,
    stats: "/admin/verification/stats",
    /** Includes OCR and face-match data. */
    detail: (userId: string) => `/admin/verification/${userId}`,
    retryAuto: (userId: string) => `/admin/verification/${userId}/retry-auto`,
    autoStatus: (userId: string) => `/admin/verification/${userId}/auto-status`,
    bulkReview: "/admin/verification/bulk-review",
    /** Which images a document type needs (member route). */
    requirements: (documentType: string) => `/verification/requirements/${documentType}`,
  },
  matching: {
    stats: "/admin/matching/stats",
    list: "/admin/matching",
    detail: (matchId: string) => `/admin/matching/${matchId}/detail`,
    invalidate: (matchId: string) => `/admin/matching/${matchId}/invalidate`,
    generate: (userId: string) => `/admin/matching/generate/${userId}`,
    resetPenalties: (userId: string) => `/admin/matching/reset-penalties/${userId}`,
    /** GET, PATCH (weights must sum to 1) */
    weights: "/admin/matching/weights",
  },
  chat: {
    stats: "/admin/chat/stats",
    conversations: "/admin/chat/conversations",
    messages: (conversationId: string) => `/admin/chat/conversations/${conversationId}/messages`,
    close: (conversationId: string) => `/admin/chat/conversations/${conversationId}/close`,
    reports: "/admin/chat/reports",
    report: (reportId: string) => `/admin/chat/reports/${reportId}`,
    /** DELETE redacts the message (body `{ reason }`) */
    message: (messageId: string) => `/admin/chat/messages/${messageId}`,
    /** Signs chat media paths in a batch (member route). */
    signMedia: "/chat/media/signed-urls",
  },
  community: {
    stats: "/admin/community/stats",
    posts: "/admin/community/posts",
    post: (postId: string) => `/admin/community/posts/${postId}`,
    /** POST feature, DELETE unfeature */
    feature: (postId: string) => `/admin/community/posts/${postId}/feature`,
    /** POST pin, DELETE unpin */
    pin: (postId: string) => `/admin/community/posts/${postId}/pin`,
    reports: "/admin/community/reports",
    report: (reportId: string) => `/admin/community/reports/${reportId}`,
    groups: "/admin/community/groups",
    /** PATCH update, DELETE (body `{ reason }`) */
    group: (groupId: string) => `/admin/community/groups/${groupId}`,
    removeUser: (groupId: string, userId: string) =>
      `/admin/community/groups/${groupId}/remove-user/${userId}`,
    banUser: (groupId: string, userId: string) =>
      `/admin/community/groups/${groupId}/ban-user/${userId}`,
    unbanUser: (groupId: string, userId: string) =>
      `/admin/community/groups/${groupId}/unban-user/${userId}`,
    // Member routes: there's no admin GET for groups or events.
    memberGroups: "/community/groups",
    memberGroup: (groupId: string) => `/community/groups/${groupId}`,
    /** GET lists a group's events; POST creates one (admin only). */
    groupEvents: (groupId: string) => `/community/groups/${groupId}/events`,
    /** ?groupId &type &timeframe &priceFilter &cursor */
    events: "/community/events",
    /** GET, PATCH and DELETE (the writes are admin only). */
    event: (eventId: string) => `/community/events/${eventId}`,
    eventTickets: (eventId: string) => `/community/events/${eventId}/tickets`,
    memberPost: (postId: string) => `/community/posts/${postId}`,
    postReplies: (postId: string) => `/community/posts/${postId}/replies`,
    /** Post reports, admin and moderator only, cursor-paged. */
    postReports: "/community/myposts/reports",
    signMedia: "/community/media/signed-urls",
  },
  virtualDates: {
    list: "/admin/virtual-dates",
    stats: "/admin/virtual-dates/stats",
    detail: (invitationId: string) => `/admin/virtual-dates/${invitationId}`,
    cancel: (invitationId: string) => `/admin/virtual-dates/${invitationId}/cancel`,
  },
} as const;
