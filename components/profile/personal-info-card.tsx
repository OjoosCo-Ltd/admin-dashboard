import { UserIcon } from "@phosphor-icons/react/ssr";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { enabled, type Feature } from "@/constants/features";
import { timezoneFor } from "@/constants/regional";
import type { AdminProfile } from "@/types/settings";

/**
 * The admin's name, email, phone and timezone, read only. They're changed in
 * Settings (Edit Profile in the page header), so the filled boxes carry no
 * input affordances: no caret, no hover, no select chevron. The backend keeps
 * no phone or timezone for an admin yet, so those two wait on their flag.
 */
export function PersonalInfoCard({ profile }: { profile: AdminProfile }) {
  const fields = enabled<{ label: string; value: string; feature?: Feature }>([
    { label: "Full Name", value: profile.fullName },
    { label: "Email Address", value: profile.email },
    { label: "Phone Number", value: profile.phone, feature: "adminProfileExtras" },
    {
      label: "Timezone",
      value: timezoneFor(profile.timezone).label,
      feature: "adminProfileExtras",
    },
  ]);
  return (
    <DashboardCard className="border-border/30 shadow-[0_1px_3px_rgb(24_28_30/0.05)] dark:border-border">
      <h2 className="flex items-center gap-1.25 border-b border-border/20 pb-4 text-xl leading-7 font-semibold dark:border-border">
        <UserIcon
          aria-hidden
          weight="bold"
          className="-ml-0.5 size-5 shrink-0 text-action dark:text-primary"
        />
        Personal Information
      </h2>
      <dl className="mt-6 grid gap-x-6 gap-y-5.75 @xl:grid-cols-2">
        {fields.map(({ label, value }) => (
          // An odd field out spans the row, so two columns leave no gap.
          <div key={label} className="min-w-0 @xl:last:odd:col-span-2">
            <dt className="text-[11px] leading-3.5 text-muted-foreground">{label}</dt>
            <dd className="mt-1.5 min-h-9.5 rounded-md border border-[#e6eaef] bg-surface px-3 py-2 text-sm leading-5 wrap-anywhere dark:border-border dark:bg-muted/40">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </DashboardCard>
  );
}
