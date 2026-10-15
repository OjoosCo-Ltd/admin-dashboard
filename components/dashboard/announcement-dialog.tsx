"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  BellRingingIcon,
  DeviceMobileIcon,
  EnvelopeSimpleIcon,
  ImageIcon,
  InfoIcon,
  LinkSimpleIcon,
  ListBulletsIcon,
  MegaphoneIcon,
  PaperPlaneRightIcon,
  RocketLaunchIcon,
  TextBIcon,
  TextItalicIcon,
  UsersThreeIcon,
  type Icon,
} from "@phosphor-icons/react";
import { useId, useRef } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  ActionDialogBody,
  ActionDialogContent,
  ActionDialogFooter,
  ActionDialogHeader,
  ActionDialogLabel,
} from "@/components/dashboard/action-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { AnnouncementAudience } from "@/types/dashboard";

const AUDIENCES: { value: AnnouncementAudience; label: string }[] = [
  { value: "all", label: "All Users" },
  { value: "premium", label: "Premium Only" },
  { value: "new", label: "New Users (Last 7 Days)" },
];

const CHANNELS: { name: "inApp" | "push" | "email"; label: string; icon: Icon }[] = [
  { name: "inApp", label: "In-app Popup", icon: BellRingingIcon },
  { name: "push", label: "Push Notification", icon: DeviceMobileIcon },
  { name: "email", label: "Email Blast", icon: EnvelopeSimpleIcon },
];

const schema = z
  .object({
    title: z.string().trim().min(1, "Give the announcement a title"),
    // ⚠️ PROVISIONAL: Markdown, until the backend says what format it stores.
    content: z.string().trim().min(1, "Write the message"),
    audience: z.enum(["all", "premium", "new"]),
    inApp: z.boolean(),
    push: z.boolean(),
    email: z.boolean(),
    schedule: z.boolean(),
    scheduledAt: z.string(),
  })
  .refine((values) => values.inApp || values.push || values.email, {
    message: "Pick at least one delivery method",
    path: ["inApp"],
  })
  .refine((values) => !values.schedule || values.scheduledAt !== "", {
    message: "Pick when to send it",
    path: ["scheduledAt"],
  })
  // datetime-local values are the viewer's local time, as new Date reads them.
  .refine(
    (values) =>
      !values.schedule || !values.scheduledAt || new Date(values.scheduledAt) > new Date(),
    { message: "Pick a time in the future", path: ["scheduledAt"] },
  );

type AnnouncementValues = z.infer<typeof schema>;

const count = new Intl.NumberFormat("en-US");

/** Compose a broadcast to app users: message, audience, channels and an optional send time. */
export function AnnouncementDialog({
  audienceSizes,
  open,
  onOpenChange,
}: {
  audienceSizes: Record<AnnouncementAudience, number>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ActionDialogContent className="max-w-224">
        {/* Mounted only while open, so every opening starts a fresh draft. */}
        <AnnouncementForm audienceSizes={audienceSizes} onClose={() => onOpenChange(false)} />
      </ActionDialogContent>
    </Dialog>
  );
}

function AnnouncementForm({
  audienceSizes,
  onClose,
}: {
  audienceSizes: Record<AnnouncementAudience, number>;
  onClose: () => void;
}) {
  const formId = useId();
  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  const form = useForm<AnnouncementValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      content: "",
      audience: "all",
      inApp: true,
      push: false,
      email: false,
      schedule: false,
      scheduledAt: "",
    },
  });
  const [audience, schedule] = useWatch({ control: form.control, name: ["audience", "schedule"] });

  // UI only: there's no announcements endpoint yet.
  const onSubmit = form.handleSubmit(() => toast("Announcements aren't available yet"));

  /** Wraps the selection in Markdown, or inserts a placeholder to type over. */
  const format = (before: string, after: string, placeholder: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const { selectionStart: start, selectionEnd: end, value } = textarea;
    const selected = value.slice(start, end) || placeholder;
    form.setValue("content", value.slice(0, start) + before + selected + after + value.slice(end), {
      shouldDirty: true,
    });
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  const tools = [
    { label: "Bold", icon: TextBIcon, run: () => format("**", "**", "bold text") },
    { label: "Italic", icon: TextItalicIcon, run: () => format("_", "_", "italic text") },
    { label: "Link", icon: LinkSimpleIcon, run: () => format("[", "](https://)", "link text") },
    { label: "Bulleted list", icon: ListBulletsIcon, run: () => format("\n- ", "", "list item") },
    {
      label: "Image",
      icon: ImageIcon,
      run: () => format("![", "](https://)", "image description"),
    },
  ];

  return (
    <>
      <ActionDialogHeader
        icon={<MegaphoneIcon weight="fill" className="-scale-x-100" />}
        title="Platform Announcement"
        description="Broadcast a message to your global user base."
        className="bg-muted"
        descriptionClassName="text-[13px]"
      />
      <ActionDialogBody className="pb-9">
        <form
          id={formId}
          method="post"
          onSubmit={onSubmit}
          noValidate
          className="grid gap-10 md:grid-cols-[1fr_16rem]"
        >
          <div className="flex flex-col gap-7 pt-1">
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="flex flex-col gap-2">
                  <ActionDialogLabel asChild>
                    <label htmlFor={`${formId}-title`}>Message title</label>
                  </ActionDialogLabel>
                  <Input
                    {...field}
                    id={`${formId}-title`}
                    placeholder="e.g., Major System Update Scheduled"
                    aria-invalid={fieldState.invalid}
                    className="h-12 rounded-md px-3 text-base placeholder:text-[#6b7280] md:text-base"
                  />
                  <FieldError errors={[fieldState.error]} />
                </div>
              )}
            />
            <Controller
              name="content"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="flex flex-col gap-2">
                  <ActionDialogLabel asChild>
                    <label htmlFor={`${formId}-content`}>Rich text content</label>
                  </ActionDialogLabel>
                  <div className="overflow-hidden rounded-md border has-focus-visible:border-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/50 has-aria-invalid:border-destructive">
                    <div
                      role="toolbar"
                      aria-label="Formatting"
                      className="flex h-9 items-center border-b bg-muted px-0.5 text-muted-foreground"
                    >
                      {tools.map((tool, index) => (
                        <span key={tool.label} className="flex items-center">
                          {/* The Figma separates the inline styles from the blocks. */}
                          {index === 3 && <span aria-hidden className="mx-3 h-5 w-px bg-border" />}
                          <button
                            type="button"
                            onClick={tool.run}
                            className="rounded p-0.5 outline-none hover:bg-background hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                          >
                            <tool.icon aria-hidden weight="bold" className="size-5.5" />
                            <span className="sr-only">{tool.label}</span>
                          </button>
                        </span>
                      ))}
                    </div>
                    <Textarea
                      {...field}
                      ref={(element) => {
                        field.ref(element);
                        contentRef.current = element;
                      }}
                      id={`${formId}-content`}
                      placeholder="Type your high-stakes message here..."
                      aria-invalid={fieldState.invalid}
                      className="min-h-63 resize-none rounded-none border-0 px-6 py-6 text-sm placeholder:text-[#6b7280] focus-visible:ring-0 aria-invalid:ring-0 md:text-sm"
                    />
                  </div>
                  <FieldError errors={[fieldState.error]} />
                </div>
              )}
            />
          </div>

          <div className="flex flex-col">
            <ActionDialogLabel id={`${formId}-audience`} className="flex items-center gap-2">
              <UsersThreeIcon aria-hidden weight="bold" className="size-4.5" />
              Target audience
            </ActionDialogLabel>
            <Controller
              name="audience"
              control={form.control}
              render={({ field }) => (
                <RadioGroup
                  aria-labelledby={`${formId}-audience`}
                  value={field.value}
                  onValueChange={field.onChange}
                  className="mt-3 gap-1"
                >
                  {AUDIENCES.map((option) => (
                    <label
                      key={option.value}
                      className="flex h-12.5 cursor-pointer items-center gap-3 rounded-md border bg-background px-3 text-base"
                    >
                      <RadioGroupItem
                        value={option.value}
                        className="size-4.5 border-outline data-checked:border-action data-checked:bg-action dark:data-checked:bg-action"
                      />
                      {option.label}
                    </label>
                  ))}
                </RadioGroup>
              )}
            />

            <ActionDialogLabel id={`${formId}-channels`} className="mt-10 flex items-center gap-2">
              <PaperPlaneRightIcon aria-hidden weight="bold" className="size-4.5" />
              Delivery method
            </ActionDialogLabel>
            <div
              role="group"
              aria-labelledby={`${formId}-channels`}
              className="mt-3 flex flex-col gap-1"
            >
              {CHANNELS.map((channel) => (
                <Controller
                  key={channel.name}
                  name={channel.name}
                  control={form.control}
                  render={({ field }) => (
                    <label className="flex h-12.5 cursor-pointer items-center gap-2.5 rounded-lg bg-muted px-3 text-base">
                      <channel.icon aria-hidden className="size-6 shrink-0 text-action" />
                      {channel.label}
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked === true);
                          // The "at least one" error sits on inApp; recheck it whichever box changed.
                          void form.trigger("inApp");
                        }}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        className="ml-auto size-5 rounded-[4px] border-outline bg-background data-checked:border-action data-checked:bg-action dark:data-checked:bg-action"
                      />
                    </label>
                  )}
                />
              ))}
              <FieldError errors={[form.formState.errors.inApp]} />
            </div>

            <div className="mt-auto pt-10">
              <label className="flex h-16 cursor-pointer items-center justify-between gap-4 rounded-lg border border-[#9fc9de] bg-info-soft px-6 text-[13px] tracking-wide text-[#4d6876] uppercase">
                Schedule release
                <Controller
                  name="schedule"
                  control={form.control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mr-1 scale-[1.3] data-checked:bg-action dark:data-checked:bg-action data-unchecked:bg-[#47626f] dark:data-unchecked:bg-[#47626f]"
                    />
                  )}
                />
              </label>
              {schedule && (
                <Controller
                  name="scheduledAt"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div className="mt-3 flex flex-col gap-2">
                      <label
                        htmlFor={`${formId}-when`}
                        className="text-[13px] text-muted-foreground"
                      >
                        Send on
                      </label>
                      <Input
                        {...field}
                        id={`${formId}-when`}
                        type="datetime-local"
                        aria-invalid={fieldState.invalid}
                        className="h-10 rounded-md bg-background px-3 text-sm"
                      />
                      <FieldError errors={[fieldState.error]} />
                    </div>
                  )}
                />
              )}
            </div>
          </div>
        </form>
      </ActionDialogBody>
      <ActionDialogFooter className="justify-between gap-y-4">
        <p className="flex items-center gap-2 text-base text-muted-foreground max-sm:text-sm">
          <InfoIcon aria-hidden className="size-5 shrink-0" />
          This action will reach {count.format(audienceSizes[audience])} users.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-4 max-sm:w-full max-sm:gap-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-14 rounded-[10px] bg-background px-6 text-base font-normal max-sm:h-11 max-sm:flex-1"
          >
            Discard Draft
          </Button>
          <Button
            type="submit"
            form={formId}
            className="h-14 w-60 gap-3 rounded-[10px] bg-action text-base font-normal text-white shadow-[0_8px_20px_-6px_rgb(0_100_129/0.5)] hover:bg-action/90 max-sm:h-11 max-sm:w-auto max-sm:flex-1"
          >
            {schedule ? "Schedule" : "Send Now"}
            <RocketLaunchIcon aria-hidden className="size-6" />
          </Button>
        </div>
      </ActionDialogFooter>
    </>
  );
}
