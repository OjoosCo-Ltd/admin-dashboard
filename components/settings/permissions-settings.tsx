"use client";

import { FloppyDiskIcon, GearSixIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { type ComponentType, type SVGProps, useId, useState } from "react";
import { toast } from "sonner";

import {
  BubbleChatIcon,
  DashboardIcon,
  FavoriteIcon,
  GavelIcon,
  GroupIcon,
  PaymentsIcon,
  PsychologyIcon,
  VerifiedUserIcon,
} from "@/components/icons/app-icons";
import { ROLE_LABELS } from "@/components/settings/settings-labels";
import { SettingsCard, SettingsSectionHeader } from "@/components/settings/settings-section";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  AdminRole,
  ModulePermissions,
  PermissionAction,
  PermissionModule,
} from "@/types/settings";

const ACTIONS: PermissionAction[] = ["view", "create", "edit", "delete", "export"];

// The sidebar's glyphs, so each module looks as it does in the navigation.
const MODULES: Record<
  PermissionModule,
  { label: string; icon: ComponentType<SVGProps<SVGSVGElement>> }
> = {
  dashboard: { label: "Dashboard", icon: DashboardIcon },
  users: { label: "Users", icon: GroupIcon },
  verification: { label: "Verification", icon: VerifiedUserIcon },
  matches: { label: "Matches", icon: FavoriteIcon },
  conversations: { label: "Conversations", icon: BubbleChatIcon },
  "ai-center": { label: "AI Center", icon: PsychologyIcon },
  reports: { label: "Reports & Safety", icon: GavelIcon },
  payments: { label: "Payments", icon: PaymentsIcon },
  settings: { label: "Settings", icon: GearSixIcon },
};

/** What each admin role may do in each module, edited one role at a time. */
export function PermissionsSettings({
  initial,
  defaultRole,
  moduleTotal,
}: {
  initial: Record<AdminRole, ModulePermissions[]>;
  defaultRole: AdminRole;
  /** Modules in all, for "Showing 9 of 16". */
  moduleTotal: number;
}) {
  const roleId = useId();
  const [role, setRole] = useState(defaultRole);
  const [grants, setGrants] = useState(initial);
  const rows = grants[role];

  const toggle = (module: PermissionModule, action: PermissionAction, on: boolean) =>
    setGrants((current) => ({
      ...current,
      [role]: current[role].map((row) =>
        row.module !== module
          ? row
          : {
              ...row,
              granted: on
                ? [...row.granted, action]
                : row.granted.filter((granted) => granted !== action),
            },
      ),
    }));

  return (
    <>
      <SettingsSectionHeader
        title="Role Permissions"
        description="Configure access levels and capabilities for different administrative roles across the platform modules."
        descriptionClassName="max-w-88 text-sm leading-5"
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <span
              id={roleId}
              className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase"
            >
              Current Role
            </span>
            <Select value={role} onValueChange={(value) => setRole(value as AdminRole)}>
              <SelectTrigger
                aria-labelledby={roleId}
                className="h-9.5 w-48 rounded-lg border-[#dbe1e5] bg-background px-4 text-base data-[size=default]:h-9.5 dark:border-border [&_svg:not([class*='size-'])]:size-5"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value} className="text-sm">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <button
            type="button"
            onClick={() => setGrants((current) => ({ ...current, [role]: initial[role] }))}
            className="h-14 w-26 rounded-xl border border-[#dbe1e5] bg-background px-3 text-[13px] leading-4 font-semibold tracking-wide outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60 dark:border-border"
          >
            Discard Changes
          </button>
          <button
            type="button"
            // UI only: role permissions aren't stored by the backend yet.
            onClick={() => toast("Saving role permissions isn't available yet")}
            className="flex h-14 items-center gap-2.5 rounded-xl bg-action px-5 text-left text-[13px] leading-4 font-semibold tracking-wide text-white outline-none hover:bg-action/90 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <FloppyDiskIcon aria-hidden weight="bold" className="size-5 shrink-0" />
            <span className="max-w-21 text-center">Save Configuration</span>
          </button>
        </div>
      </SettingsSectionHeader>

      <SettingsCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-170 text-left">
            <caption className="sr-only">{ROLE_LABELS[role]} permissions by module</caption>
            <thead className="bg-container dark:bg-muted">
              <tr className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                <th scope="col" className="w-[33%] py-4.5 pl-6 font-semibold">
                  System Module
                </th>
                {ACTIONS.map((action) => (
                  <th key={action} scope="col" className="py-4.5 text-center font-semibold">
                    {action}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 dark:divide-border">
              {rows.map((row) => {
                const meta = MODULES[row.module];
                return (
                  <tr key={row.module} className="hover:bg-muted/40">
                    <th scope="row" className="py-3.5 pl-6 text-sm font-normal">
                      <span className="flex items-center gap-3">
                        <meta.icon aria-hidden className="size-4.5 shrink-0 text-outline" />
                        {meta.label}
                      </span>
                    </th>
                    {ACTIONS.map((action) => {
                      const restricted = row.restricted.includes(action);
                      return (
                        <td key={action} className="py-3.5 text-center">
                          <span className="inline-flex flex-col items-center gap-1.5">
                            <Checkbox
                              checked={!restricted && row.granted.includes(action)}
                              disabled={restricted}
                              onCheckedChange={(checked) =>
                                toggle(row.module, action, checked === true)
                              }
                              aria-label={`${meta.label}: ${action}${restricted ? " (restricted)" : ""}`}
                              className={cn(
                                "size-4.5 rounded-[3px] bg-background disabled:cursor-not-allowed disabled:opacity-100 data-checked:border-[#2563eb] data-checked:bg-[#2563eb] dark:data-checked:bg-[#2563eb]",
                                restricted ? "border-destructive" : "border-[#79747e]/70",
                              )}
                            />
                            {restricted && (
                              <span className="rounded bg-[#ffdad6]/80 px-2.5 py-1 text-[11px] leading-none font-semibold tracking-wider text-destructive uppercase dark:bg-destructive/20">
                                Restricted
                              </span>
                            )}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 px-6 py-5 text-sm text-muted-foreground dark:border-border">
          <p>
            Showing {rows.length} of {moduleTotal} modules
          </p>
          <p className="flex items-center gap-2">
            <span aria-hidden className="size-2 rounded-full bg-destructive" />
            Restricted actions require Super Admin escalation
          </p>
        </div>
      </SettingsCard>
    </>
  );
}
