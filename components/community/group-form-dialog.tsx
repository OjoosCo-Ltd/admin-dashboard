"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  GlobeHemisphereWestIcon,
  ImageSquareIcon,
  LockSimpleIcon,
  PencilSimpleIcon,
  PlusCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { cn } from "cn";
import { Dialog as DialogPrimitive, RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { type ComponentProps, type ReactNode, useEffect, useId, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { ActionDialogContent } from "@/components/dashboard/action-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { GROUP_CATEGORIES } from "@/constants/community";
import { FEATURES } from "@/constants/features";
import type { CommunityGroup, GroupPrivacy } from "@/types/community";

const MAX_DESCRIPTION = 500;
const MAX_ICON_BYTES = 2 * 1024 * 1024;
const ICON_TYPES = ["image/png", "image/jpeg"];

// The backend's AdminCreateGroupDto takes name, description and category, all
// required. The icon and privacy are the Figma's; it has no fields for them yet,
// so their inputs stay hidden, and they must stay out of the request body (an
// extra property is a 400). The icon's type and size are checked as it's picked (IconPicker).
const schema = z.object({
  icon: z.instanceof(File).nullable(),
  name: z
    .string()
    .trim()
    .min(1, "Give the group a name")
    .max(60, "Keep the name under 60 characters"),
  category: z.string().min(1, "Choose a primary category"),
  description: z
    .string()
    .trim()
    .min(1, "Describe what the group is for")
    .max(MAX_DESCRIPTION, `Keep the description under ${MAX_DESCRIPTION} characters`),
  privacy: z.enum(["public", "private"]),
});

export type GroupFormValues = z.infer<typeof schema>;

const PRIVACY: { value: GroupPrivacy; label: string; description: string; icon: ReactNode }[] = [
  {
    value: "public",
    label: "Public",
    description: "Anyone can find the group, see members, and view public posts.",
    icon: (
      <GlobeHemisphereWestIcon
        aria-hidden
        weight="fill"
        className="size-5 text-action dark:text-primary"
      />
    ),
  },
  {
    value: "private",
    label: "Private",
    description: "Only members can see who's in the group and what they post.",
    icon: <LockSimpleIcon aria-hidden weight="bold" className="size-5" />,
  },
];

const label = "text-[13px]/4 font-semibold tracking-wide";
const control =
  "rounded-lg border-border/50 bg-background px-4 text-[15px] placeholder:text-outline md:text-[15px] dark:border-border dark:bg-input/30";

/**
 * Create New Community Group, or edit one: an icon, the name, category and
 * description, and who can see it. Submitting a new group hands its values to
 * `onCreated`, which shows the success screen.
 */
export function GroupFormDialog({
  group,
  open,
  onOpenChange,
  onCreated,
  onCloseAutoFocus,
  trigger,
}: {
  /** The group being edited. Without one the dialog creates a group. */
  group?: CommunityGroup;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (values: GroupFormValues) => void;
  onCloseAutoFocus?: ComponentProps<typeof DialogPrimitive.Content>["onCloseAutoFocus"];
  /** The button that opens it. Focus returns there on close. */
  trigger?: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <ActionDialogContent
        onCloseAutoFocus={onCloseAutoFocus}
        className="max-w-168 rounded-[12px] border"
      >
        <GroupForm group={group} onCancel={() => onOpenChange(false)} onCreated={onCreated} />
      </ActionDialogContent>
    </Dialog>
  );
}

// Mounted only while the dialog is open, so every opening starts fresh.
function GroupForm({
  group,
  onCancel,
  onCreated,
}: {
  group?: CommunityGroup;
  onCancel: () => void;
  onCreated?: (values: GroupFormValues) => void;
}) {
  const id = useId();
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      icon: null,
      name: group?.name ?? "",
      // The sample groups carry the Figma's labels, which aren't backend categories.
      category: GROUP_CATEGORIES.find((option) => option.label === group?.category)?.value ?? "",
      description: group?.description ?? "",
      privacy: group?.privacy ?? "public",
    },
  });
  const description = useWatch({ control: form.control, name: "description" });

  const onSubmit = form.handleSubmit((values) => {
    // UI only: nothing reaches POST or PATCH /admin/community/groups yet.
    if (group) toast("Editing groups isn't available yet");
    else onCreated?.(values);
  });

  return (
    <>
      <div className="flex shrink-0 items-start gap-4 border-b bg-surface px-6 pt-6 pb-6 max-sm:p-4 dark:bg-muted/40">
        <div className="min-w-0 flex-1">
          <DialogPrimitive.Title className="text-2xl/8 font-semibold max-sm:text-xl/7">
            {group ? "Edit Community Group" : "Create New Community Group"}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-1 text-[13px]/5 text-muted-foreground">
            {group
              ? "Update how members find and recognize this group."
              : "Establish a new space for members to connect and share experiences."}
          </DialogPrimitive.Description>
        </div>
        <DialogPrimitive.Close className="mt-1.5 -mr-1 rounded-md p-1 text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50">
          <XIcon aria-hidden weight="bold" className="size-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </div>

      <form method="post" noValidate onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-6 pb-6 max-sm:p-4">
          <div className={cn("grid gap-6", FEATURES.eventMedia && "sm:grid-cols-[11.875rem_1fr]")}>
            {FEATURES.eventMedia && (
              <Controller
                name="icon"
                control={form.control}
                render={({ field }) => (
                  <IconPicker onChange={field.onChange} currentImage={group?.imageUrl} />
                )}
              />
            )}

            <div className="flex min-w-0 flex-col gap-6">
              <Field data-invalid={Boolean(form.formState.errors.name)} className="gap-2">
                <FieldLabel htmlFor={`${id}-name`} className={label}>
                  Group Name
                </FieldLabel>
                <Input
                  id={`${id}-name`}
                  placeholder="e.g. Seattle Urban Hikers"
                  aria-invalid={Boolean(form.formState.errors.name)}
                  className={cn(control, "h-11.5")}
                  {...form.register("name")}
                />
                <FieldError errors={[form.formState.errors.name]} />
              </Field>

              <Controller
                name="category"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel htmlFor={`${id}-category`} className={label}>
                      Category
                    </FieldLabel>
                    <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        ref={field.ref}
                        id={`${id}-category`}
                        onBlur={field.onBlur}
                        aria-invalid={fieldState.invalid}
                        className={cn(
                          control,
                          "h-11.5 w-full data-placeholder:text-foreground data-[size=default]:h-11.5 [&>svg]:size-5 [&>svg]:text-foreground",
                        )}
                      >
                        <SelectValue placeholder="Select a primary category" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {GROUP_CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value} className="py-2">
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Field data-invalid={Boolean(form.formState.errors.description)} className="gap-2">
                <FieldLabel htmlFor={`${id}-description`} className={label}>
                  Description
                </FieldLabel>
                <Textarea
                  id={`${id}-description`}
                  placeholder="Describe the purpose, goals, and target audience for this group..."
                  aria-invalid={Boolean(form.formState.errors.description)}
                  aria-describedby={`${id}-count`}
                  maxLength={MAX_DESCRIPTION}
                  className={cn(control, "min-h-26.5 resize-none py-3")}
                  {...form.register("description")}
                />
                <div className="flex items-start gap-3">
                  <FieldError errors={[form.formState.errors.description]} />
                  <p
                    id={`${id}-count`}
                    className="ml-auto text-[13px] text-muted-foreground tabular-nums"
                  >
                    <span className="sr-only">Characters used: </span>
                    {description.length} / {MAX_DESCRIPTION}
                  </p>
                </div>
              </Field>
            </div>
          </div>

          {FEATURES.groupPrivacy && (
            <Controller
              name="privacy"
              control={form.control}
              render={({ field }) => (
                <fieldset className="mt-6 border-t border-border/50 pt-6 dark:border-border">
                  <legend className="float-left mb-3 w-full text-xs/4 font-semibold tracking-wider uppercase">
                    Privacy &amp; Visibility
                  </legend>
                  <RadioGroupPrimitive.Root
                    value={field.value}
                    onValueChange={field.onChange}
                    className="clear-left grid gap-3 sm:grid-cols-2"
                  >
                    {PRIVACY.map((option) => {
                      const optionId = `${id}-privacy-${option.value}`;
                      return (
                        // The label stretches over the whole card, so any of it picks the option.
                        <div
                          key={option.value}
                          className="relative flex gap-3 rounded-lg border border-border/50 bg-background p-3.5 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50 has-data-[state=checked]:border-action has-data-[state=checked]:bg-[#fcfeff] dark:border-border dark:has-data-[state=checked]:border-primary dark:has-data-[state=checked]:bg-primary/5"
                        >
                          <RadioGroupPrimitive.Item
                            id={optionId}
                            value={option.value}
                            aria-describedby={`${optionId}-hint`}
                            className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-[#c4c7c9] bg-background outline-none data-[state=checked]:border-action dark:border-border dark:data-[state=checked]:border-primary"
                          >
                            <RadioGroupPrimitive.Indicator className="size-2.5 rounded-full bg-action dark:bg-primary" />
                          </RadioGroupPrimitive.Item>
                          <div className="min-w-0">
                            <label
                              htmlFor={optionId}
                              className="flex cursor-pointer items-center gap-1 text-lg/6 font-semibold after:absolute after:inset-0 after:rounded-lg"
                            >
                              {option.icon}
                              {option.label}
                            </label>
                            <p
                              id={`${optionId}-hint`}
                              className="mt-1 text-[13px]/5 text-muted-foreground"
                            >
                              {option.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </RadioGroupPrimitive.Root>
                </fieldset>
              )}
            />
          )}
        </div>

        <div className="flex shrink-0 flex-wrap justify-end gap-3 border-t bg-surface px-6 py-3.5 max-sm:p-4 dark:bg-muted/40">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-14 rounded-[12px] border-[#c5c6c7] bg-background px-8 text-lg font-semibold max-sm:flex-1 dark:border-border"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-14 gap-2 rounded-[12px] bg-action-icon px-8 text-lg font-semibold text-white hover:bg-action-icon/90 max-sm:flex-1 dark:bg-primary dark:text-primary-foreground"
          >
            {group ? (
              "Save Changes"
            ) : (
              <>
                <PlusCircleIcon aria-hidden weight="bold" className="size-5" />
                Create Group
              </>
            )}
          </Button>
        </div>
      </form>
    </>
  );
}

/** The 128px dashed circle: click it to pick a PNG or JPG under 2MB, then it shows the image. */
function IconPicker({
  onChange,
  currentImage,
}: {
  onChange: (file: File | null) => void;
  /** The group's current icon, when editing. */
  currentImage?: string;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const preview = picked ?? currentImage;
  const invalid = error !== null;

  // Frees the preview's object URL when it's replaced or the dialog closes.
  useEffect(
    () => () => {
      if (picked) URL.revokeObjectURL(picked);
    },
    [picked],
  );

  const pick = (file: File | undefined) => {
    if (!file) return;
    if (!ICON_TYPES.includes(file.type)) return setError("Use a PNG or JPG image.");
    if (file.size > MAX_ICON_BYTES) return setError("Use an image under 2MB.");
    setError(null);
    setPicked(URL.createObjectURL(file));
    onChange(file);
  };

  return (
    <div className="flex flex-col items-center sm:pt-3">
      <label
        htmlFor={id}
        className="self-start text-[11px]/4 font-semibold tracking-wider text-foreground uppercase"
      >
        Group Icon
      </label>
      <div className="relative mt-2">
        <button
          type="button"
          onClick={() => input.current?.click()}
          aria-describedby={invalid ? `${id}-hint ${id}-error` : `${id}-hint`}
          data-invalid={invalid || undefined}
          className="flex size-32 flex-col items-center justify-center gap-1 overflow-hidden rounded-full border-2 border-dashed border-[#c4c9cd] bg-muted text-sm text-muted-foreground transition-colors outline-none hover:bg-muted-strong focus-visible:ring-3 focus-visible:ring-ring/50 data-invalid:border-destructive dark:border-border"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- a local object URL, which next/image can't optimize
            <img src={preview} alt="" className="size-full object-cover" />
          ) : (
            <>
              <ImageSquareIcon aria-hidden weight="bold" className="size-7" />
              Upload
            </>
          )}
          <span className="sr-only">
            {preview ? "Change the group icon" : "Upload a group icon"}
          </span>
        </button>
        <span
          aria-hidden
          className="pointer-events-none absolute right-0 bottom-0 flex size-7 items-center justify-center rounded-full border bg-background text-foreground shadow-xs"
        >
          <PencilSimpleIcon weight="bold" className="size-3.5" />
        </span>
        <input
          ref={input}
          id={id}
          type="file"
          accept={ICON_TYPES.join(",")}
          className="sr-only"
          tabIndex={-1}
          onChange={(event) => {
            pick(event.target.files?.[0]);
            // Picking the same file again should still fire a change.
            event.target.value = "";
          }}
        />
      </div>
      <p
        id={`${id}-hint`}
        className="mt-3 max-w-37.5 text-center text-[13px]/4.5 text-muted-foreground"
      >
        Recommended: 512×512px, PNG or JPG under 2MB.
      </p>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-2 text-center text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
