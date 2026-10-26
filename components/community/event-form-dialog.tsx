"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarBlankIcon,
  ClockIcon,
  CloudArrowUpIcon,
  PlusCircleIcon,
  UsersIcon,
  XIcon,
} from "@phosphor-icons/react";
import { cn } from "cn";
import { Dialog as DialogPrimitive, RadioGroup as RadioGroupPrimitive } from "radix-ui";
import {
  type ComponentProps,
  type DragEvent,
  type ReactNode,
  useEffect,
  useId,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
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
import { SAMPLE_EVENT_COMMUNITIES } from "@/constants/community-sample";
import { FEATURES } from "@/constants/features";
import type { CommunityEvent } from "@/types/community";

const IMAGE_TYPES = ["image/svg+xml", "image/png", "image/jpeg", "image/gif"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// The backend's CreateEventDto takes a name, an optional description (5,000
// characters at most), startsAt and an optional capacity of at least 1. It
// also requires a type (VIRTUAL or PHYSICAL), which the Figma doesn't ask for,
// and has no fields for the image, the community or the initial status yet.
const schema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Give the event a title")
    .max(200, "Keep the title under 200 characters"),
  description: z.string().trim().max(5000, "Keep the description under 5,000 characters"),
  date: z.string().min(1, "Pick a date"),
  time: z.string().min(1, "Pick a start time"),
  community: z.string().min(1, "Choose the community hosting it"),
  capacity: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || (Number.isInteger(Number(value)) && Number(value) >= 1),
      "Use a whole number of at least 1, or leave it empty for no limit",
    ),
  status: z.enum(["draft", "published"]),
});

type EventValues = z.infer<typeof schema>;

const label = "text-[13px]/4 font-semibold";
const control =
  "h-10 rounded-md border-border/50 bg-background text-sm placeholder:text-[#9ca3af] md:text-sm dark:border-border dark:bg-input/30";
const leadingIcon =
  "pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground";
// Native date and time fields, with the Figma's icon on the left in place of
// Chrome's picker button on the right. Clicking anywhere opens the picker.
const nativePicker =
  "pl-11.5 text-base text-foreground md:text-base dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:hidden";

/** Create New Community Event, or edit one: image, title, description, when, where, capacity and status. */
export function EventFormDialog({
  event,
  open,
  onOpenChange,
  onCloseAutoFocus,
  trigger,
}: {
  /** The event being edited. Without one the dialog creates an event. */
  event?: CommunityEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
        <EventForm event={event} onCancel={() => onOpenChange(false)} />
      </ActionDialogContent>
    </Dialog>
  );
}

// Mounted only while the dialog is open, so every opening starts fresh.
function EventForm({ event, onCancel }: { event?: CommunityEvent; onCancel: () => void }) {
  const id = useId();
  const form = useForm<EventValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: event?.title ?? "",
      description: event?.description ?? "",
      date: event?.startsAt.slice(0, 10) ?? "",
      time: event?.startsAt.slice(11, 16) ?? "",
      community: event?.community.name ?? "",
      capacity: event?.capacity ? String(event.capacity) : "",
      // A listed event has been published.
      status: event && event.status !== "draft" ? "published" : "draft",
    },
  });
  const errors = form.formState.errors;

  // UI only: nothing reaches POST /community/groups/{groupId}/events or PATCH /community/events/{id}.
  const onSubmit = form.handleSubmit(() =>
    toast(event ? "Editing events isn't available yet" : "Creating events isn't available yet"),
  );

  return (
    <>
      <div className="flex shrink-0 items-center gap-4 border-b px-6 py-6 max-sm:p-4">
        <DialogPrimitive.Title className="min-w-0 flex-1 text-xl/7 font-semibold">
          {event ? "Edit Community Event" : "Create New Community Event"}
        </DialogPrimitive.Title>
        <DialogPrimitive.Description className="sr-only">
          {event
            ? `Update ${event.title}'s details.`
            : "Add an event for community members to join."}
        </DialogPrimitive.Description>
        <DialogPrimitive.Close className="-mr-1 rounded-md p-1 text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50">
          <XIcon aria-hidden weight="bold" className="size-4.5" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </div>

      <form method="post" noValidate onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-6 pt-8 pb-12 max-sm:p-4">
          {FEATURES.eventMedia && <ImageDropzone currentImage={event?.imageUrl} />}

          <Field data-invalid={Boolean(errors.title)} className="gap-2">
            <FieldLabel htmlFor={`${id}-title`} className={label}>
              Event Title
            </FieldLabel>
            <Input
              id={`${id}-title`}
              placeholder="e.g., Mindfulness Workshop Series"
              aria-invalid={Boolean(errors.title)}
              className={cn(control, "px-4")}
              {...form.register("title")}
            />
            <FieldError errors={[errors.title]} />
          </Field>

          <Field data-invalid={Boolean(errors.description)} className="gap-2">
            <FieldLabel htmlFor={`${id}-description`} className={label}>
              Description
            </FieldLabel>
            <Textarea
              id={`${id}-description`}
              placeholder="Describe what the event is about..."
              aria-invalid={Boolean(errors.description)}
              className={cn(control, "min-h-26.5 resize-none px-4 py-3")}
              {...form.register("description")}
            />
            <FieldError errors={[errors.description]} />
          </Field>

          <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.date)} className="gap-2">
              <FieldLabel htmlFor={`${id}-date`} className={label}>
                Date
              </FieldLabel>
              <div className="relative">
                <CalendarBlankIcon aria-hidden className={leadingIcon} />
                <Input
                  id={`${id}-date`}
                  type="date"
                  aria-invalid={Boolean(errors.date)}
                  onClick={(click) => click.currentTarget.showPicker?.()}
                  className={cn(control, nativePicker)}
                  {...form.register("date")}
                />
              </div>
              <FieldError errors={[errors.date]} />
            </Field>
            <Field data-invalid={Boolean(errors.time)} className="gap-2">
              <FieldLabel htmlFor={`${id}-time`} className={label}>
                Time
              </FieldLabel>
              <div className="relative">
                <ClockIcon aria-hidden className={leadingIcon} />
                <Input
                  id={`${id}-time`}
                  type="time"
                  aria-invalid={Boolean(errors.time)}
                  onClick={(click) => click.currentTarget.showPicker?.()}
                  className={cn(control, nativePicker)}
                  {...form.register("time")}
                />
              </div>
              <FieldError errors={[errors.time]} />
            </Field>

            <Controller
              name="community"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-2">
                  <FieldLabel htmlFor={`${id}-community`} className={label}>
                    Community
                  </FieldLabel>
                  <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      ref={field.ref}
                      id={`${id}-community`}
                      onBlur={field.onBlur}
                      aria-invalid={fieldState.invalid}
                      className={cn(
                        control,
                        "w-full px-4 text-[15px] data-placeholder:text-foreground data-[size=default]:h-10 md:text-[15px] [&>svg]:size-5 [&>svg]:text-foreground",
                      )}
                    >
                      <SelectValue placeholder="Select a community group..." />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {SAMPLE_EVENT_COMMUNITIES.map((community) => (
                        <SelectItem key={community.name} value={community.name} className="py-2">
                          {community.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Field data-invalid={Boolean(errors.capacity)} className="gap-2">
              <FieldLabel htmlFor={`${id}-capacity`} className={label}>
                Event Capacity
                <span className="font-normal text-muted-foreground">(Optional)</span>
              </FieldLabel>
              <div className="relative">
                <UsersIcon aria-hidden className={leadingIcon} />
                <Input
                  id={`${id}-capacity`}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  placeholder="e.g., 50"
                  aria-invalid={Boolean(errors.capacity)}
                  className={cn(control, "pl-12 text-base md:text-base")}
                  {...form.register("capacity")}
                />
              </div>
              <FieldError errors={[errors.capacity]} />
            </Field>
          </div>

          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <fieldset>
                <legend className={cn(label, "mb-2")}>Initial Status</legend>
                {/* A two-way switch: the chosen side lifts onto white, as in the Figma. */}
                <RadioGroupPrimitive.Root
                  value={field.value}
                  onValueChange={field.onChange}
                  orientation="horizontal"
                  className="inline-flex rounded-lg border border-border/30 bg-container p-1.5 dark:border-border dark:bg-muted"
                >
                  {(["draft", "published"] as const).map((value) => (
                    <RadioGroupPrimitive.Item
                      key={value}
                      value={value}
                      className="h-8 min-w-20 rounded-md px-4 text-[13px] font-semibold tracking-wide text-muted-foreground transition-[color,background-color,box-shadow] outline-none focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=checked]:bg-background data-[state=checked]:text-foreground data-[state=checked]:shadow-xs"
                    >
                      {value === "draft" ? "Draft" : "Published"}
                    </RadioGroupPrimitive.Item>
                  ))}
                </RadioGroupPrimitive.Root>
              </fieldset>
            )}
          />
        </div>

        <div className="flex shrink-0 flex-wrap justify-end gap-3 border-t bg-surface px-6 py-3.5 max-sm:p-4 dark:bg-muted/40">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-12 rounded-[12px] border-[#c5c6c7] bg-background px-7 text-base font-semibold max-sm:flex-1 dark:border-border"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-12 gap-2 rounded-[12px] bg-action px-7 text-base font-semibold text-white hover:bg-action/90 max-sm:flex-1 dark:bg-primary dark:text-primary-foreground"
          >
            {event ? (
              "Save Changes"
            ) : (
              <>
                <PlusCircleIcon aria-hidden weight="bold" className="size-5" />
                Create Event
              </>
            )}
          </Button>
        </div>
      </form>
    </>
  );
}

/** The dashed upload area: click or drop an SVG, PNG, JPG or GIF, then it shows the image. */
function ImageDropzone({ currentImage }: { currentImage?: string }) {
  const id = useId();
  const [picked, setPicked] = useState<{ url: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const preview = picked?.url ?? currentImage;

  // Frees the preview's object URL when it's replaced or the dialog closes.
  useEffect(
    () => () => {
      if (picked) URL.revokeObjectURL(picked.url);
    },
    [picked],
  );

  const accept = (file: File | undefined) => {
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) return setError("Use an SVG, PNG, JPG or GIF image.");
    if (file.size > MAX_IMAGE_BYTES) return setError("Use an image under 5MB.");
    setError(null);
    setPicked({ url: URL.createObjectURL(file), name: file.name });
  };

  const onDrop = (drop: DragEvent<HTMLLabelElement>) => {
    drop.preventDefault();
    setDragging(false);
    accept(drop.dataTransfer.files[0]);
  };

  return (
    <div className="flex flex-col gap-2">
      <p id={`${id}-label`} className={label}>
        Event Image
      </p>
      <label
        htmlFor={id}
        onDragOver={(over) => {
          over.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        data-dragging={dragging || undefined}
        className="relative flex h-48 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-[#c9ced3] bg-container text-center transition-colors hover:bg-muted-strong has-focus-visible:ring-3 has-focus-visible:ring-ring/50 data-dragging:border-action data-dragging:bg-action-soft dark:border-border dark:bg-muted/40"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- an object URL or a sample cover, neither optimizable
          <img src={preview} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <>
            <span
              aria-hidden
              className="flex size-12 items-center justify-center rounded-full bg-[#e0e3e6] text-[#8e9499] dark:bg-muted-strong/10 dark:text-muted-foreground"
            >
              <CloudArrowUpIcon weight="bold" className="size-6" />
            </span>
            <span className="mt-4 text-[13px]/5 font-medium">Click to upload or drag and drop</span>
            <span id={`${id}-hint`} className="text-xs/5 text-muted-foreground">
              SVG, PNG, JPG or GIF (Recommended 1200×480px)
            </span>
          </>
        )}
        {preview && (
          <span className="sr-only">
            Replace the event image{picked ? ` (${picked.name})` : ""}
          </span>
        )}
        <input
          id={id}
          type="file"
          accept={IMAGE_TYPES.join(",")}
          aria-labelledby={`${id}-label`}
          aria-describedby={error ? `${id}-hint ${id}-error` : `${id}-hint`}
          className="sr-only"
          onChange={(change) => {
            accept(change.target.files?.[0]);
            // Picking the same file again should still fire a change.
            change.target.value = "";
          }}
        />
      </label>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
