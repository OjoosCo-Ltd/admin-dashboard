"use client";

import {
  CaretLeftIcon,
  CaretRightIcon,
  DotsThreeVerticalIcon,
  FunnelSimpleIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react";
import { cn } from "cn";
import Link from "next/link";
import { toast } from "sonner";

import { formatDayAndTime } from "@/components/settings/settings-format";
import { ADMIN_STATUS, initials, ROLE_LABELS } from "@/components/settings/settings-labels";
import { SettingsCard } from "@/components/settings/settings-section";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FEATURES } from "@/constants/features";
import type { AdminMember, AdminRole, RoleSummary } from "@/types/settings";

const ROLE_PILLS: Record<AdminRole, string> = {
  "super-admin": "border-transparent bg-action-icon text-white",
  admin: "border-[#dbe1e5] bg-muted text-foreground dark:border-border",
  moderator: "border-[#dbe1e5] bg-muted text-foreground dark:border-border",
  support: "border-[#e6e8eb] bg-muted/60 text-outline dark:border-border",
};

const head = "py-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase";

const notYet = (what: string) => () => toast(`${what} isn't available yet`);

/** The admin team with each person's role and status, beside what each role can do. */
export function TeamSettings({
  admins,
  total,
  roles,
}: {
  admins: AdminMember[];
  /** Admins on every page, for "Showing 4 of 24". */
  total: number;
  roles: RoleSummary[];
}) {
  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_12.75rem]">
      <SettingsCard className="overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-6 py-6">
          <h3 id="administrators" className="text-xl leading-7 font-semibold">
            Administrators
          </h3>
          <button
            type="button"
            aria-label="Filter administrators"
            onClick={notYet("Filtering administrators")}
            className="flex size-8 items-center justify-center rounded-md border border-[#dbe1e5] text-muted-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 dark:border-border"
          >
            <FunnelSimpleIcon aria-hidden weight="bold" className="size-4.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table aria-labelledby="administrators" className="w-full min-w-150 text-left">
            <thead className="bg-muted dark:bg-muted/40">
              <tr>
                <th scope="col" className={cn(head, "w-[38%] pl-6")}>
                  Administrator
                </th>
                <th scope="col" className={cn(head, "w-[17%]")}>
                  Role
                </th>
                <th scope="col" className={cn(head, "w-[17%]")}>
                  Status
                </th>
                <th scope="col" className={cn(head, "w-[18%] leading-4")}>
                  Last Active
                </th>
                <th scope="col" className={cn(head, "pr-3 text-right")}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 dark:divide-border">
              {admins.map((admin) => {
                const status = ADMIN_STATUS[admin.status];
                const suspended = admin.status === "suspended";
                return (
                  <tr key={admin.id}>
                    <td className="py-3.5 pl-4">
                      <span className="flex items-center gap-3">
                        <Avatar className="size-10">
                          {admin.avatarUrl && <AvatarImage src={admin.avatarUrl} alt="" />}
                          <AvatarFallback className="bg-container text-sm font-semibold text-muted-foreground dark:bg-muted">
                            {initials(admin.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className={cn("min-w-0", suspended && "opacity-60")}>
                          <span className="block text-sm leading-5 font-semibold">
                            {admin.name}
                          </span>
                          <span className="block truncate text-[13px] text-muted-foreground">
                            {admin.email}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span
                        className={cn(
                          "inline-flex h-6 items-center rounded border px-2 text-xs whitespace-nowrap",
                          ROLE_PILLS[admin.role],
                        )}
                      >
                        {ROLE_LABELS[admin.role]}
                      </span>
                    </td>
                    <td className={cn("py-3.5 text-sm", status.className)}>
                      <span className="flex items-center gap-2">
                        <span aria-hidden className="size-1.5 rounded-full bg-current" />
                        {status.label}
                      </span>
                    </td>
                    <td
                      className={cn(
                        "py-3.5 text-sm whitespace-nowrap",
                        suspended && "text-outline",
                      )}
                    >
                      {admin.lastActiveAt ? formatDayAndTime(admin.lastActiveAt) : "Never"}
                    </td>
                    <td className="py-3.5 pr-3 text-right">
                      <AdminActions admin={admin} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-border/40 px-5 py-5 text-sm dark:border-border">
          <p>
            Showing {admins.length} of {total} administrators
          </p>
          {/* UI only: the sample has a single page. */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous page"
              disabled
              className="flex size-7 items-center justify-center rounded-md text-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-40"
            >
              <CaretLeftIcon aria-hidden weight="bold" className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Next page"
              onClick={notYet("Paging through administrators")}
              className="flex size-7 items-center justify-center rounded-md text-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <CaretRightIcon aria-hidden weight="bold" className="size-4" />
            </button>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        aria-labelledby="role-summary"
        className="bg-surface px-4 pt-6 pb-5 dark:bg-card"
      >
        <h3
          id="role-summary"
          className="flex items-start gap-2 text-xl leading-7 font-semibold max-xl:items-center"
        >
          <ShieldCheckIcon
            aria-hidden
            weight="bold"
            className="mt-1 size-5 shrink-0 text-action max-xl:mt-0 dark:text-primary"
          />
          Role Summary
        </h3>
        <dl className="mt-4 grid divide-y divide-border/40 max-xl:sm:grid-cols-2 max-xl:sm:gap-x-6 max-xl:sm:divide-y-0 dark:divide-border">
          {roles.map((role) => (
            <div
              key={role.role}
              className={cn("py-3.5 first:pt-0", !FEATURES.rolePermissions && "last:pb-0")}
            >
              <dt className="flex items-baseline justify-between gap-2">
                <span className="text-[13px] font-semibold tracking-wide">
                  {ROLE_LABELS[role.role]}
                </span>
                <span className="text-[11px] tracking-wide text-[#a9aeb2]">{role.users} users</span>
              </dt>
              <dd className="mt-1 text-[13px] leading-[21px] text-muted-foreground">
                {role.description}
              </dd>
            </div>
          ))}
        </dl>
        {FEATURES.rolePermissions && (
          <Link
            href="/settings/permissions"
            className="mt-3 flex min-h-14 items-center justify-center rounded-lg border border-[#dbe1e5] px-4 py-2 text-center text-[13px] font-semibold tracking-wide outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 dark:border-border"
          >
            Manage Custom Roles
          </Link>
        )}
      </SettingsCard>
    </div>
  );
}

/** A row's ⋮ menu. UI only: none of these have endpoints wired yet. */
function AdminActions({ admin }: { admin: AdminMember }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Actions for ${admin.name}`}
        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <DotsThreeVerticalIcon aria-hidden weight="bold" className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onSelect={notYet("Changing roles")}>Change role</DropdownMenuItem>
        {FEATURES.adminInvites && admin.status === "pending" && (
          <DropdownMenuItem onSelect={notYet("Resending invitations")}>
            Resend invitation
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {admin.status === "suspended" ? (
          <DropdownMenuItem onSelect={notYet("Reactivating admins")}>Reactivate</DropdownMenuItem>
        ) : (
          <DropdownMenuItem variant="destructive" onSelect={notYet("Suspending admins")}>
            Suspend
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
