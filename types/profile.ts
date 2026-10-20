/** One line of the admin's own recent activity on My Profile. ⚠️ PROVISIONAL: no audit endpoint is wired. */
export interface ProfileActivity {
  id: string;
  /** ISO date-time. */
  at: string;
  /** "Updated subscription settings for". */
  action: string;
  /** What was acted on, linked where the admin can open it. */
  target?: { label: string; href?: string };
}
