import { SAMPLE_NOW } from "@/constants/settings-sample";

// Formatted in UTC so the server's render and the browser's agree.
const utc = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" });

const clock = utc({ hour: "2-digit", minute: "2-digit", hour12: true });
const day = utc({ month: "short", day: "2-digit", year: "numeric" });
const clock24 = utc({ hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const stamp = utc({
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

const DAY_MS = 86_400_000;
const dayNumber = (date: Date) => Math.floor(date.getTime() / DAY_MS);

/** "Oct 02, 2026". */
export const formatDay = (iso: string) => day.format(new Date(iso));

/** "Oct 18, 2026 09:41 UTC". */
export const formatUtc = (iso: string) =>
  `${day.format(new Date(iso))} ${clock24.format(new Date(iso))} UTC`;

/** "Oct 18, 14:32:01", as audit logs show it. */
export const formatStamp = (iso: string) => stamp.format(new Date(iso));

/** "Today, 09:41 AM", "Yesterday, 02:20 PM", or the date for anything older. */
export function formatDayAndTime(iso: string, now = SAMPLE_NOW) {
  const date = new Date(iso);
  const days = dayNumber(new Date(now)) - dayNumber(date);
  if (days === 0) return `Today, ${clock.format(date)}`;
  if (days === 1) return `Yesterday, ${clock.format(date)}`;
  return day.format(date);
}

/** "2 mins ago", "2 hours ago", "Yesterday", "3 months ago". */
export function formatTimeAgo(iso: string, now = SAMPLE_NOW) {
  const date = new Date(iso);
  const minutes = Math.max(0, Math.round((new Date(now).getTime() - date.getTime()) / 60_000));
  const days = dayNumber(new Date(now)) - dayNumber(date);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "min" : "mins"} ago`;
  if (days === 0) {
    const hours = Math.round(minutes / 60);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  return months < 12 ? `${months} ${months === 1 ? "month" : "months"} ago` : day.format(date);
}
