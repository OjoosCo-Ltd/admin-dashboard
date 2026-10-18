"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UploadSimpleIcon, UserIcon } from "@phosphor-icons/react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  ActionDialogBody,
  ActionDialogContent,
  ActionDialogFooter,
  ActionDialogHeader,
} from "@/components/dashboard/action-dialog";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { COACH_SPECIALIZATIONS } from "@/components/well-being/coach-styles";

const BIO_MAX = 500;
const PHOTO_TYPES = ["image/png", "image/jpeg", "image/webp"];
const PHOTO_MAX_BYTES = 5 * 1024 * 1024;

const schema = z.object({
  fullName: z.string().trim().min(1, "Enter the coach's full name").max(80, "Keep it under 80"),
  specialization: z.string().min(1, "Pick a specialization"),
  biography: z.string().max(BIO_MAX, `Keep it under ${BIO_MAX} characters`),
  active: z.boolean(),
});

type CoachValues = z.infer<typeof schema>;

const field =
  "rounded-md border-[#dfe3e7] bg-background px-4 text-sm text-foreground placeholder:text-[#6b7280] md:text-sm dark:border-border dark:bg-muted/40";
const label = "text-[13px] font-semibold tracking-wide";

/** Profile, specialization and starting availability for a new coach. */
export function AddCoachDialog({ trigger }: { trigger: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <ActionDialogContent className="max-w-168">
        {/* Mounted only while open, so every opening starts a blank profile. */}
        <AddCoachForm />
      </ActionDialogContent>
    </Dialog>
  );
}

function AddCoachForm() {
  const formId = useId();
  const form = useForm<CoachValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", specialization: "", biography: "", active: true },
  });
  const biography = useWatch({ control: form.control, name: "biography" });

  // UI only: there's no coach endpoint yet.
  const onSubmit = form.handleSubmit(() => toast("Adding coaches isn't available yet"));

  return (
    <>
      <ActionDialogHeader
        title="Add New Coach"
        description="Configure profile details and specializations."
        className="items-center bg-surface px-10 py-7 max-sm:px-5"
        titleClassName="text-[22px] leading-8 font-semibold"
        descriptionClassName="mt-1 text-[13px] text-muted-foreground"
      />
      <ActionDialogBody className="px-10 py-8 max-sm:px-5">
        <form
          id={formId}
          method="post"
          onSubmit={onSubmit}
          noValidate
          className="flex flex-col divide-y divide-muted-strong dark:divide-border [&>section]:py-12 [&>section:first-child]:pt-0 [&>section:last-child]:pb-2"
        >
          <section aria-labelledby={`${formId}-photo`}>
            <h3 id={`${formId}-photo`} className="text-xl leading-7 font-semibold">
              Profile Image
            </h3>
            <p className="mt-2 text-[13px] text-muted-foreground">
              Upload a high-quality portrait. Recommended size 400×400px.
            </p>
            <PhotoPicker />
          </section>

          <section aria-labelledby={`${formId}-basics`} className="flex flex-col gap-6">
            <h3 id={`${formId}-basics`} className="text-xl leading-7 font-semibold">
              Basic Information
            </h3>
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
                    autoComplete="off"
                    placeholder="Enter coach's full name"
                    aria-invalid={fieldState.invalid}
                    aria-required
                    className={`${field} h-10.5`}
                  />
                  <FieldError errors={[fieldState.error]} />
                </div>
              )}
            />
            <Controller
              name="specialization"
              control={form.control}
              render={({ field: specialization, fieldState }) => (
                <div className="flex flex-col gap-2">
                  <span id={`${formId}-specialization`} className={label}>
                    Primary Specialization
                  </span>
                  <Select value={specialization.value} onValueChange={specialization.onChange}>
                    <SelectTrigger
                      ref={specialization.ref}
                      onBlur={specialization.onBlur}
                      aria-labelledby={`${formId}-specialization`}
                      aria-invalid={fieldState.invalid}
                      aria-required
                      className={`${field} h-10.5 w-full data-placeholder:text-foreground data-[size=default]:h-10.5 [&_svg:not([class*='size-'])]:size-5`}
                    >
                      <SelectValue placeholder="Select specialization..." />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {COACH_SPECIALIZATIONS.map((option) => (
                        <SelectItem key={option} value={option} className="py-2 text-sm">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </div>
              )}
            />
            <Controller
              name="biography"
              control={form.control}
              render={({ field: bio, fieldState }) => (
                <div className="flex flex-col gap-2">
                  <label htmlFor={`${formId}-bio`} className={label}>
                    Biography
                  </label>
                  <Textarea
                    {...bio}
                    id={`${formId}-bio`}
                    placeholder="Brief professional background..."
                    aria-invalid={fieldState.invalid}
                    aria-describedby={`${formId}-bio-count`}
                    className={`${field} field-sizing-fixed h-25.5 min-h-0 resize-none py-3`}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <FieldError errors={[fieldState.error]} />
                    <p
                      id={`${formId}-bio-count`}
                      className="ml-auto text-[13px] text-muted-foreground tabular-nums"
                    >
                      {biography.length}/{BIO_MAX} characters
                    </p>
                  </div>
                </div>
              )}
            />
          </section>

          <Controller
            name="active"
            control={form.control}
            render={({ field: active }) => (
              <section
                aria-labelledby={`${formId}-availability`}
                className="flex items-center justify-between gap-6"
              >
                <div>
                  <h3 id={`${formId}-availability`} className="text-xl leading-7 font-semibold">
                    Initial Availability Status
                  </h3>
                  <p
                    id={`${formId}-availability-hint`}
                    className="mt-1 text-[13px] text-muted-foreground"
                  >
                    Set coach as active and available for bookings immediately.
                  </p>
                </div>
                <label className="flex shrink-0 cursor-pointer items-center gap-3 text-[13px] font-semibold tracking-wide">
                  <Switch
                    checked={active.value}
                    onCheckedChange={active.onChange}
                    aria-describedby={`${formId}-availability-hint`}
                    className="h-6 w-10 data-[size=default]:h-6 data-[size=default]:w-10 data-checked:bg-action dark:data-checked:bg-primary [&_[data-slot=switch-thumb]]:size-5 [&_[data-slot=switch-thumb]]:data-checked:translate-x-[calc(100%-4px)]"
                  />
                  <span className="w-14">{active.value ? "Active" : "Inactive"}</span>
                </label>
              </section>
            )}
          />
        </form>
      </ActionDialogBody>
      <ActionDialogFooter className="bg-surface px-10 py-5 max-sm:px-5">
        <DialogPrimitive.Close className="h-12 rounded-lg border border-border bg-background px-7 text-base font-semibold tracking-wide outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 max-sm:h-11 max-sm:flex-1">
          Cancel
        </DialogPrimitive.Close>
        <button
          type="submit"
          form={formId}
          className="h-12 rounded-lg bg-action px-7 text-base font-semibold tracking-wide text-white outline-none hover:bg-action/90 focus-visible:ring-3 focus-visible:ring-ring/50 max-sm:h-11 max-sm:flex-1"
        >
          Add Coach
        </button>
      </ActionDialogFooter>
    </>
  );
}

/** The portrait picker: previews the picked image in the circle, checked for type and size. */
function PhotoPicker() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Frees the preview's object URL when it's replaced or the dialog closes.
  useEffect(
    () => () => {
      if (photo) URL.revokeObjectURL(photo);
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
    setPhoto(URL.createObjectURL(file));
  };

  return (
    <div className="mt-6 flex items-center gap-6">
      <span className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-dashed border-outline/60 bg-muted-strong text-outline dark:bg-muted">
        {photo ? (
          // A local preview of the picked file.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="Profile preview" className="size-full object-cover" />
        ) : (
          <UserIcon aria-hidden weight="bold" className="size-8" />
        )}
      </span>
      <div className="flex flex-col items-start gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={PHOTO_TYPES.join(",")}
          aria-label="Profile image"
          className="sr-only"
          tabIndex={-1}
          onChange={(event) => {
            pick(event.target.files?.[0]);
            // Lets the same file be picked again after Remove.
            event.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-8.5 items-center gap-2 rounded-md border border-[#dfe3e7] bg-background px-4 text-[13px] font-semibold tracking-wide outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 dark:border-border"
        >
          <UploadSimpleIcon aria-hidden weight="bold" className="size-4.5" />
          {photo ? "Replace Image" : "Upload Image"}
        </button>
        <button
          type="button"
          disabled={!photo}
          onClick={() => setPhoto(null)}
          className="rounded-sm px-2.5 text-xs font-semibold tracking-wide text-destructive outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60 disabled:hover:no-underline"
        >
          Remove
        </button>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
