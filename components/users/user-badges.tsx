import { cn } from "cn";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { SubscriptionPlan } from "@/types/dashboard";
import type { UserSummary } from "@/types/users";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const AVATAR_SIZES = {
  md: { avatar: "size-10", fallback: "text-base", dot: "size-3 border-2" },
  lg: { avatar: "size-24", fallback: "text-2xl", dot: "right-1 bottom-1 size-5 border-[3px]" },
};

/** Photo (or initials) with the presence dot; a suspended account shows neither presence nor color. */
export function UserAvatar({
  user,
  size = "md",
  className,
}: {
  user: Pick<UserSummary, "name" | "avatarUrl" | "online" | "suspended">;
  size?: keyof typeof AVATAR_SIZES;
  className?: string;
}) {
  const sizes = AVATAR_SIZES[size];
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <Avatar className={sizes.avatar}>
        {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
        <AvatarFallback
          className={cn(
            "font-semibold",
            sizes.fallback,
            user.suspended ? "bg-muted-strong text-muted-foreground" : "bg-accent text-primary",
          )}
        >
          {initials(user.name)}
        </AvatarFallback>
      </Avatar>
      {/* The status column says online or offline in words. */}
      {!user.suspended && (
        <span
          aria-hidden
          className={cn(
            "absolute right-0 bottom-0 rounded-full border-background",
            sizes.dot,
            user.online ? "bg-online" : "bg-gray-300 dark:bg-outline",
          )}
        />
      )}
    </span>
  );
}

const STATUS_STYLES = {
  verified: {
    label: "Verified",
    className: "bg-green-100 text-green-700 dark:bg-success/15 dark:text-success",
  },
  pending: {
    label: "Pending",
    className: "bg-caution-soft text-caution dark:bg-caution/30 dark:text-[#e9b97c]",
  },
  unverified: {
    label: "Unverified",
    className: "bg-muted-strong text-muted-foreground dark:bg-muted",
  },
  suspended: {
    label: "Suspended",
    className: "bg-[#f8e8e8] text-destructive dark:bg-destructive/15",
  },
  online: {
    label: "Online",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  },
  offline: {
    label: "Offline",
    className: "bg-gray-100 text-gray-600 dark:bg-muted dark:text-muted-foreground",
  },
};

export type UserStatus = keyof typeof STATUS_STYLES;

/** A small uppercase status pill: verification, suspension or presence. */
export function StatusBadge({ status, className }: { status: UserStatus; className?: string }) {
  const { label, className: tone } = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex h-4.5 w-fit items-center rounded-full px-2 text-[11px] font-bold tracking-wide uppercase",
        tone,
        className,
      )}
    >
      {label}
    </span>
  );
}

const PLAN_STYLES: Record<SubscriptionPlan, string> = {
  elite: "bg-elite text-white dark:ring-1 dark:ring-white/15",
  premium: "bg-accent text-primary",
  free: "bg-muted-strong text-muted-foreground dark:bg-muted",
};

/** The subscription tier: a block in the table, a small pill in the profile preview. */
export function PlanBadge({
  plan,
  size = "md",
  className,
}: {
  plan: SubscriptionPlan;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center font-bold uppercase",
        size === "md"
          ? "h-8 rounded-md px-3 text-[17px]"
          : "h-4.5 rounded-full px-2 text-[10px] tracking-wide",
        PLAN_STYLES[plan],
        className,
      )}
    >
      {plan}
    </span>
  );
}
