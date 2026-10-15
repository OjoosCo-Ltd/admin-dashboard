"use client";

import {
  BellIcon,
  CaretRightIcon,
  GearSixIcon,
  ShieldIcon,
  SignOutIcon,
  UserIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useRef, useState } from "react";

import { SignOutDialog } from "@/components/account/sign-out-dialog";
import { initials, ROLE_LABELS } from "@/components/settings/settings-labels";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SAMPLE_ADMIN_AVATAR_URL } from "@/constants/dashboard-sample";
import { SAMPLE_ADMIN_PROFILE } from "@/constants/settings-sample";
import { useAuthStore } from "@/store/use-auth-store";

const ACCOUNT_LINKS = [
  { label: "My Profile", href: "/profile", icon: UserIcon },
  { label: "Account Settings", href: "/settings", icon: GearSixIcon },
  { label: "Security", href: "/settings/security", icon: ShieldIcon },
  { label: "Notification Preferences", href: "/settings/notifications", icon: BellIcon },
] as const;

/**
 * The signed-in admin in the header: avatar, name and role. Opens the account popover
 * (profile, settings, security, notifications) and the Sign Out confirmation.
 */
export function UserMenu() {
  const user = useAuthStore((state) => state.user);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // The store is empty until it rehydrates after mount; the sample admin stands in until then.
  const name = user ? (user.fullName ?? user.email) : SAMPLE_ADMIN_PROFILE.fullName;
  const email = user ? user.email : SAMPLE_ADMIN_PROFILE.email;
  // ⚠️ PROVISIONAL: the backend exposes no role for the signed-in admin; the sample profile's
  // role stands in.
  const role = ROLE_LABELS[SAMPLE_ADMIN_PROFILE.role];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          ref={triggerRef}
          className="-mr-1 flex min-w-0 items-center gap-4 rounded-lg p-1 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Avatar className="size-8.5 ring-2 ring-action-icon ring-offset-1 ring-offset-background">
            <AvatarImage src={SAMPLE_ADMIN_AVATAR_URL} alt="" />
            <AvatarFallback className="bg-accent text-xs font-semibold text-primary">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
          {/* Visually hidden on phones, where only the avatar shows, so the button keeps its name. */}
          <span className="grid min-w-0 max-sm:sr-only">
            <span className="max-w-44 truncate text-[13px]/4 font-semibold text-foreground">
              {name}
            </span>
            <span className="text-xs/4 text-muted-foreground">{role}</span>
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={22}
          collisionPadding={16}
          // Sign Out opens a dialog, which takes focus: the menu mustn't hand it back first.
          onCloseAutoFocus={(event) => {
            if (signOutOpen) event.preventDefault();
          }}
          className="w-80 rounded-2xl border bg-popover p-0 shadow-[0_12px_32px_-8px_rgb(0_0_0/0.18)] ring-0"
        >
          <DropdownMenuLabel className="flex flex-col items-center bg-surface/50 px-6 py-6 text-center font-normal">
            <Avatar className="mt-1 size-14 shadow-[0_6px_14px_rgb(0_0_0/0.06)] ring-4 ring-container dark:ring-muted">
              <AvatarImage src={SAMPLE_ADMIN_AVATAR_URL} alt="" />
              <AvatarFallback className="bg-accent text-lg font-semibold text-primary">
                {initials(name)}
              </AvatarFallback>
            </Avatar>
            <span className="mt-3.5 max-w-full truncate text-lg/6 font-bold text-foreground">
              {name}
            </span>
            <span className="mt-0.5 flex h-[21px] items-center rounded-full bg-action-icon px-[11px] text-[11px] font-semibold tracking-wider text-white uppercase">
              {role}
            </span>
            {email !== name && (
              <span className="mt-2 max-w-full text-sm/5 wrap-anywhere text-muted-foreground">
                {email}
              </span>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="m-0" />
          <DropdownMenuGroup className="px-2 pt-2 pb-3">
            {ACCOUNT_LINKS.map(({ label, href, icon: Icon }) => (
              <DropdownMenuItem
                key={href}
                asChild
                className="h-11.5 gap-2.5 rounded-lg pr-3.25 pl-3.5 text-sm text-foreground"
              >
                <Link href={href}>
                  <Icon aria-hidden weight="bold" className="size-5.5 text-foreground" />
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                  <CaretRightIcon
                    aria-hidden
                    weight="bold"
                    className="size-3 text-subtle-foreground/50"
                  />
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="m-0" />
          <DropdownMenuGroup className="p-2">
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setSignOutOpen(true)}
              className="h-12.75 justify-center gap-1.5 rounded-lg text-sm font-semibold"
            >
              <SignOutIcon aria-hidden className="size-5" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <SignOutDialog
        open={signOutOpen}
        onOpenChange={setSignOutOpen}
        onCloseAutoFocus={(event) => {
          // Opened from the menu, so there's no trigger to return to: go back to the avatar.
          event.preventDefault();
          triggerRef.current?.focus();
        }}
      />
    </>
  );
}
