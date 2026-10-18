import type { CoachSessionStatus, CoachStatus, Weekday } from "@/types/well-being";

// The Dating Coach Figma's pills: a pale sky for open slots, grey for busy or done.
const SKY = "bg-[#e5f3fb] text-[#001f2a] dark:bg-action/25 dark:text-primary";
const GREY = "bg-[#e0e3e6] text-muted-foreground dark:bg-muted";

export const COACH_STATUS: Record<CoachStatus, { label: string; className: string }> = {
  available: { label: "Available", className: SKY },
  "in-session": { label: "In Session", className: GREY },
  away: { label: "Away", className: GREY },
};

export const SESSION_STATUS: Record<CoachSessionStatus, { label: string; className: string }> = {
  scheduled: { label: "Scheduled", className: SKY },
  completed: { label: "Completed", className: GREY },
  cancelled: {
    label: "Cancelled",
    className: "bg-destructive-container text-destructive dark:bg-destructive/20",
  },
};

export const SESSION_LENGTHS = [30, 45, 60, 90];

export const sessionLengthLabel = (minutes: number) => `${minutes} Minutes`;

export const COACH_SPECIALIZATIONS = [
  "Relationship Coaching",
  "Confidence Building",
  "Communication Skills",
  "Dating Anxiety",
  "Profile Review",
  "First Date Prep",
];

export const COACH_TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (EST)" },
  { value: "America/Chicago", label: "Central Time (CST)" },
  { value: "America/Denver", label: "Mountain Time (MST)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PST)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Central European (CET)" },
  { value: "Africa/Lagos", label: "West Africa (WAT)" },
];

export const WEEKDAYS: { day: Weekday; short: string; long: string }[] = [
  { day: "mon", short: "Mon", long: "Monday" },
  { day: "tue", short: "Tue", long: "Tuesday" },
  { day: "wed", short: "Wed", long: "Wednesday" },
  { day: "thu", short: "Thu", long: "Thursday" },
  { day: "fri", short: "Fri", long: "Friday" },
  { day: "sat", short: "Sat", long: "Saturday" },
  { day: "sun", short: "Sun", long: "Sunday" },
];
