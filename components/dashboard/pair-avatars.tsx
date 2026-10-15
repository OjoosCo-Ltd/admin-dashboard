import { cn } from "cn";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/** Anyone shown as an avatar: a name for the initials, and a photo when there is one. */
export interface AvatarPerson {
  name: string;
  avatarUrl?: string;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

// Pastel fallbacks from the Figma's placeholder circles, for pairs without photos.
const FALLBACK_TINTS = [
  "bg-[#85d0f3] text-[#0b4f6c]",
  "bg-[#afcbda] text-[#2b4a5a]",
  "bg-[#ffdad6] text-[#93000a]",
  "bg-[#ffdcbf] text-[#6a3b00]",
];

const PAIR_SIZES = {
  sm: { avatar: "size-7", overlap: "-ml-2", text: "text-[10px]" },
  md: { avatar: "size-9", overlap: "-ml-2.5", text: "text-xs" },
  lg: { avatar: "size-16", overlap: "", text: "text-lg" },
};

/** One participant's photo, or initials on a pastel disc. */
export function ParticipantAvatar({
  user,
  size = "md",
  tint = 0,
  className,
}: {
  user: AvatarPerson;
  size?: keyof typeof PAIR_SIZES;
  tint?: number;
  className?: string;
}) {
  const sizes = PAIR_SIZES[size];
  return (
    <Avatar className={cn(sizes.avatar, "ring-2 ring-card", className)}>
      {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
      <AvatarFallback
        className={cn("font-semibold", sizes.text, FALLBACK_TINTS[tint % FALLBACK_TINTS.length])}
      >
        {initials(user.name)}
      </AvatarFallback>
    </Avatar>
  );
}

/** The two participants side by side, the second overlapping the first. */
export function PairAvatars({
  users,
  size = "md",
}: {
  users: [AvatarPerson, AvatarPerson];
  size?: "sm" | "md";
}) {
  return (
    <span aria-hidden className="flex shrink-0">
      <ParticipantAvatar user={users[0]} size={size} tint={0} />
      <ParticipantAvatar
        user={users[1]}
        size={size}
        tint={1}
        className={PAIR_SIZES[size].overlap}
      />
    </span>
  );
}
