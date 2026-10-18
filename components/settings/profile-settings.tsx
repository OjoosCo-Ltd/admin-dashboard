"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LockSimpleIcon, ShieldCheckIcon } from "@phosphor-icons/react";
import { useEffect, useId, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { SaveButton, SecondaryButton } from "@/components/settings/save-button";
import { formatDay, formatUtc } from "@/components/settings/settings-format";
import { initials, ROLE_LABELS } from "@/components/settings/settings-labels";
import { SettingsCard } from "@/components/settings/settings-section";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { AdminProfile } from "@/types/settings";

const PHOTO_TYPES = ["image/png", "image/jpeg", "image/webp"];
const PHOTO_MAX_BYTES = 5 * 1024 * 1024;

const schema = z.object({
  fullName: z.string().trim().min(1, "Enter your full name").max(80, "Keep it under 80 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]{7,20}$/, "Enter a phone number like +44 7700 900000"),
});

type ProfileValues = z.infer<typeof schema>;

const label = "text-[13px] font-semibold tracking-wide";
const field =
  "h-9.5 rounded-lg border-[#e3e7eb] bg-background px-3.5 text-sm md:text-sm dark:border-border dark:bg-muted/40";

/** The signed-in admin's photo, name and phone, with the details only IT can change. */
export function ProfileSettings({ profile }: { profile: AdminProfile }) {
  const formId = useId();
  const form = useForm<ProfileValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: profile.fullName, phone: profile.phone },
  });
  // Cancel resets the photo along with the fields; null means it was removed.
  const [photo, setPhoto] = useState<{ url: string; local: boolean } | null>(
    profile.avatarUrl ? { url: profile.avatarUrl, local: false } : null,
  );

  // UI only: there's no admin profile endpoint yet.
  const onSubmit = form.handleSubmit(() => toast("Saving your profile isn't available yet"));

  return (
    <SettingsCard className="overflow-hidden">
      <h3 className="border-b border-border/40 px-6 py-4 text-xl leading-7 font-semibold max-sm:px-4 dark:border-border">
        Administrator Profile
      </h3>
      <form
        id={formId}
        method="post"
        onSubmit={onSubmit}
        onReset={(event) => {
          event.preventDefault();
          form.reset();
          setPhoto(profile.avatarUrl ? { url: profile.avatarUrl, local: false } : null);
        }}
        noValidate
        className="divide-y divide-border/40 px-10 max-sm:px-4 dark:divide-border"
      >
        <PhotoField name={profile.fullName} photo={photo} onChange={setPhoto} />

        <div className="grid gap-x-8 gap-y-6 py-14 sm:grid-cols-2">
          <Controller
            name="fullName"
            control={form.control}
            render={({ field: name, fieldState }) => (
              <div className="flex flex-col gap-2">
                <label htmlFor={`${formId}-name`} className={label}>
                  Full Name
                </label>
                <Input
                  {...name}
                  id={`${formId}-name`}
                  autoComplete="name"
                  aria-invalid={fieldState.invalid}
                  className={field}
                />
                <FieldError errors={[fieldState.error]} />
              </div>
            )}
          />
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor={`${formId}-email`} className={label}>
                Admin Email
              </label>
              <span className="rounded bg-container px-1.5 py-0.5 text-[11px] font-semibold tracking-wider text-outline uppercase dark:bg-muted">
                Primary
              </span>
            </div>
            <div className="relative">
              <LockSimpleIcon
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-[#a9aeb2]"
              />
              <Input
                id={`${formId}-email`}
                value={profile.email}
                readOnly
                aria-describedby={`${formId}-email-hint`}
                className={`${field} bg-muted pl-10 text-muted-foreground dark:bg-muted`}
              />
            </div>
            <p id={`${formId}-email-hint`} className="max-w-56 text-xs text-outline">
              Contact IT support to change your primary admin email.
            </p>
          </div>
          <Controller
            name="phone"
            control={form.control}
            render={({ field: phone, fieldState }) => (
              <div className="flex flex-col gap-2">
                <label htmlFor={`${formId}-phone`} className={label}>
                  Phone Number
                </label>
                <Input
                  {...phone}
                  id={`${formId}-phone`}
                  type="tel"
                  autoComplete="tel"
                  aria-invalid={fieldState.invalid}
                  className={field}
                />
                <FieldError errors={[fieldState.error]} />
              </div>
            )}
          />
          <div className="flex flex-col gap-2">
            <span className={label}>Assigned Role</span>
            <span className="flex w-fit items-center gap-1.5 rounded bg-info-soft px-2 py-1 text-xs font-semibold text-[#00546e] dark:bg-action/30 dark:text-primary">
              <ShieldCheckIcon aria-hidden weight="bold" className="size-4" />
              {ROLE_LABELS[profile.role]}
            </span>
          </div>
        </div>

        <div className="pt-16 pb-10">
          <dl className="flex flex-wrap gap-x-11 gap-y-4 rounded-lg bg-[#f7f8fa] px-4 py-3.5 dark:bg-muted/40">
            <div>
              <dt className="text-[11px] tracking-wide text-[#a9aeb2] uppercase">Date Joined</dt>
              <dd className="mt-1 text-sm">{formatDay(profile.joinedAt)}</dd>
            </div>
            <div>
              <dt className="text-[11px] tracking-wide text-[#a9aeb2] uppercase">Last Login</dt>
              <dd className="mt-1 text-sm">{formatUtc(profile.lastLoginAt)}</dd>
            </div>
          </dl>
        </div>
      </form>
      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border/40 bg-muted px-6 py-4 max-sm:px-4 dark:border-border dark:bg-muted/40">
        <SecondaryButton type="reset" form={formId} className="font-semibold tracking-wide">
          Cancel
        </SecondaryButton>
        <SaveButton form={formId} className="bg-action-icon hover:bg-action-icon/90">
          Save Changes
        </SaveButton>
      </div>
    </SettingsCard>
  );
}

/** The profile photo, with Change Photo (type- and size-checked) and Remove. */
function PhotoField({
  name,
  photo,
  onChange,
}: {
  name: string;
  photo: { url: string; local: boolean } | null;
  onChange: (photo: { url: string; local: boolean } | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const titleId = useId();

  // Frees a picked photo's object URL when it's replaced or the page goes.
  useEffect(
    () => () => {
      if (photo?.local) URL.revokeObjectURL(photo.url);
    },
    [photo],
  );

  const pick = (file: File | undefined) => {
    if (!file) return;
    if (!PHOTO_TYPES.includes(file.type)) {
      setError("Use a PNG, JPG or WebP image.");
      return;
    }
    if (file.size > PHOTO_MAX_BYTES) {
      setError("That image is over 5 MB.");
      return;
    }
    setError(null);
    onChange({ url: URL.createObjectURL(file), local: true });
  };

  return (
    <div className="flex flex-wrap items-start gap-x-6 gap-y-5 pt-12 pb-16">
      <Avatar className="size-24 shadow-[0_2px_8px_rgb(0_0_0/0.15)]">
        {photo && <AvatarImage src={photo.url} alt="" />}
        <AvatarFallback className="bg-action-soft text-2xl font-semibold text-action">
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <h4 id={titleId} className="mt-2 text-base font-medium">
          Profile Picture
        </h4>
        <p className="mt-2 max-w-80 text-[13px] leading-[18px] text-muted-foreground">
          Upload a high-resolution image to represent your administrative identity across the
          platform.
        </p>
        <div className="mt-4 flex items-center gap-7">
          <input
            ref={inputRef}
            type="file"
            accept={PHOTO_TYPES.join(",")}
            aria-labelledby={titleId}
            className="sr-only"
            tabIndex={-1}
            onChange={(event) => {
              pick(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="h-8.5 rounded-lg border border-[#dbe1e5] bg-surface px-4 text-[13px] font-semibold tracking-wide whitespace-nowrap outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 dark:border-border dark:bg-muted/40"
          >
            Change Photo
          </button>
          <button
            type="button"
            disabled={!photo}
            onClick={() => {
              setError(null);
              onChange(null);
            }}
            className="rounded-sm text-[13px] font-semibold tracking-wide text-destructive outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 disabled:hover:no-underline"
          >
            Remove
          </button>
        </div>
        {error && (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
