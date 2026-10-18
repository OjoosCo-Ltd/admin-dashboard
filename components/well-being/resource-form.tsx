"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CloudArrowUpIcon,
  ImageIcon,
  LinkSimpleIcon,
  ListBulletsIcon,
  ListNumbersIcon,
  TextBIcon,
  TextItalicIcon,
  TextUnderlineIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { cn } from "cn";
import {
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RESOURCE_CATEGORIES } from "@/components/well-being/resources-directory";

/** The form's id, so the page header's buttons can submit it. */
export const RESOURCE_FORM_ID = "create-resource";

const DESCRIPTION_LIMIT = 250;
const COVER_TYPES = ["image/svg+xml", "image/png", "image/jpeg", "image/gif"];
const COVER_MAX = { width: 800, height: 400 };

const schema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Give the resource a title")
      .max(120, "Keep the title under 120 characters"),
    description: z
      .string()
      .trim()
      .max(DESCRIPTION_LIMIT, `Keep it to ${DESCRIPTION_LIMIT} characters`),
    // ⚠️ PROVISIONAL: Markdown, until the backend says what format it stores.
    content: z.string().trim(),
    category: z.string(),
    status: z.enum(["draft", "published"]),
  })
  // A draft only needs a title; publishing needs the rest.
  .superRefine((values, context) => {
    if (values.status !== "published") return;
    if (!values.description)
      context.addIssue({
        code: "custom",
        path: ["description"],
        message: "Add a short description before publishing",
      });
    if (!values.content)
      context.addIssue({
        code: "custom",
        path: ["content"],
        message: "Write the content before publishing",
      });
    if (!values.category)
      context.addIssue({
        code: "custom",
        path: ["category"],
        message: "Pick a category before publishing",
      });
  });

type ResourceValues = z.infer<typeof schema>;

/** Title, description, content, cover and metadata for a new library resource. */
export function ResourceForm() {
  const id = useId();
  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  const form = useForm<ResourceValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "", content: "", category: "", status: "draft" },
  });
  const description = useWatch({ control: form.control, name: "description" });

  // Which header button submitted: Save Draft forces a draft, Publish forces publishing.
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    const intent = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value");
    if (intent === "draft" || intent === "published") form.setValue("status", intent);
    // UI only: there's no resource endpoint yet.
    return form.handleSubmit((values) =>
      toast(
        values.status === "published"
          ? "Publishing resources isn't available yet"
          : "Saving drafts isn't available yet",
      ),
    )(event);
  };

  /** Wraps the selection in Markdown, or inserts a placeholder to type over. */
  const format = (before: string, after: string, placeholder: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const { selectionStart: start, selectionEnd: end, value } = textarea;
    const selected = value.slice(start, end) || placeholder;
    form.setValue("content", value.slice(0, start) + before + selected + after + value.slice(end), {
      shouldDirty: true,
      shouldValidate: form.formState.isSubmitted,
    });
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  const tools = [
    [
      { label: "Bold", icon: TextBIcon, run: () => format("**", "**", "bold text") },
      { label: "Italic", icon: TextItalicIcon, run: () => format("_", "_", "italic text") },
      {
        label: "Underline",
        icon: TextUnderlineIcon,
        run: () => format("<u>", "</u>", "underlined text"),
      },
    ],
    [
      { label: "Bulleted list", icon: ListBulletsIcon, run: () => format("\n- ", "", "list item") },
      {
        label: "Numbered list",
        icon: ListNumbersIcon,
        run: () => format("\n1. ", "", "list item"),
      },
    ],
    [
      { label: "Link", icon: LinkSimpleIcon, run: () => format("[", "](https://)", "link text") },
      {
        label: "Image",
        icon: ImageIcon,
        run: () => format("![", "](https://)", "image description"),
      },
    ],
  ];

  return (
    <form
      id={RESOURCE_FORM_ID}
      method="post"
      onSubmit={onSubmit}
      noValidate
      className="grid items-start gap-6 xl:grid-cols-3"
    >
      <div className="flex flex-col gap-6 xl:col-span-2">
        <DashboardCard className="p-6 sm:p-6">
          <DashboardCardTitle className="text-2xl leading-8 font-semibold">
            Core Details
          </DashboardCardTitle>
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="mt-8 flex flex-col gap-2.5">
                <label
                  htmlFor={`${id}-title`}
                  className="text-sm font-semibold tracking-wide text-muted-foreground"
                >
                  Resource Title
                </label>
                <Input
                  {...field}
                  id={`${id}-title`}
                  placeholder="e.g., Understanding Dating Anxiety"
                  aria-invalid={fieldState.invalid}
                  className="h-12.5 rounded-md border-muted-strong bg-muted px-4 text-base placeholder:text-[#6b7280] md:text-lg dark:border-border"
                />
                <FieldError errors={[fieldState.error]} />
              </div>
            )}
          />
          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="mt-6 flex flex-col gap-2.5">
                <label
                  htmlFor={`${id}-description`}
                  className="text-sm font-semibold tracking-wide text-muted-foreground"
                >
                  Short Description
                </label>
                <Textarea
                  {...field}
                  id={`${id}-description`}
                  placeholder="A brief overview of what this resource covers..."
                  aria-invalid={fieldState.invalid}
                  aria-describedby={`${id}-description-count`}
                  maxLength={DESCRIPTION_LIMIT}
                  className="min-h-21 resize-none rounded-md border-muted-strong bg-muted px-4 py-3 text-base placeholder:text-[#6b7280] md:text-lg dark:border-border"
                />
                <div className="flex items-start justify-between gap-4">
                  <FieldError errors={[fieldState.error]} />
                  <p
                    id={`${id}-description-count`}
                    className="ml-auto text-xs text-outline tabular-nums"
                  >
                    {description.length} / {DESCRIPTION_LIMIT} characters
                  </p>
                </div>
              </div>
            )}
          />
        </DashboardCard>

        <DashboardCard className="p-6 sm:p-6">
          <DashboardCardTitle className="text-2xl leading-8 font-semibold">
            Resource Content
          </DashboardCardTitle>
          <Controller
            name="content"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="mt-6">
                <div
                  role="toolbar"
                  aria-label="Formatting"
                  className="flex items-center gap-1 border-b border-muted-strong pb-3 dark:border-border"
                >
                  {tools.map((group, index) => (
                    <span key={index} className="flex items-center gap-1">
                      {index > 0 && <span aria-hidden className="mx-2 h-6 w-px bg-border" />}
                      {group.map((tool) => (
                        <button
                          key={tool.label}
                          type="button"
                          onClick={tool.run}
                          className="rounded p-1 text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          <tool.icon aria-hidden weight="bold" className="size-5.5" />
                          <span className="sr-only">{tool.label}</span>
                        </button>
                      ))}
                    </span>
                  ))}
                </div>
                <label htmlFor={`${id}-content`} className="sr-only">
                  Resource content
                </label>
                <Textarea
                  {...field}
                  ref={(element) => {
                    field.ref(element);
                    contentRef.current = element;
                  }}
                  id={`${id}-content`}
                  placeholder="Write your full well-being resource content here..."
                  aria-invalid={fieldState.invalid}
                  className="mt-3 min-h-66 resize-y rounded-none border-0 px-0 py-2 text-base shadow-none placeholder:text-[#6b7280] focus-visible:ring-0 aria-invalid:ring-0 md:text-lg"
                />
                <FieldError errors={[fieldState.error]} />
              </div>
            )}
          />
        </DashboardCard>
      </div>

      <div className="flex flex-col gap-6">
        <CoverImageCard />

        <DashboardCard className="p-6 sm:p-6">
          <DashboardCardTitle className="text-2xl leading-8 font-semibold">
            Metadata
          </DashboardCardTitle>
          <Controller
            name="category"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="mt-8 flex flex-col gap-2.5">
                <span
                  id={`${id}-category`}
                  className="text-sm font-semibold tracking-wide text-muted-foreground"
                >
                  Category
                </span>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    aria-labelledby={`${id}-category`}
                    aria-invalid={fieldState.invalid}
                    className="h-12 w-full rounded-md border-muted-strong bg-muted px-4 text-base text-foreground data-[size=default]:h-12 md:text-lg dark:border-border dark:bg-muted [&_svg:not([class*='size-'])]:size-5"
                  >
                    <SelectValue placeholder="Select a category..." />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {RESOURCE_CATEGORIES.slice(1).map((option) => (
                      <SelectItem key={option.value} value={option.value} className="py-2 text-sm">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </div>
            )}
          />
          <hr className="my-7 border-muted-strong dark:border-border" />
          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <div>
                <span
                  id={`${id}-status`}
                  className="text-sm font-semibold tracking-wide text-muted-foreground"
                >
                  Publishing Status
                </span>
                <RadioGroup
                  aria-labelledby={`${id}-status`}
                  value={field.value}
                  onValueChange={field.onChange}
                  className="mt-4 gap-4"
                >
                  {[
                    {
                      value: "draft",
                      label: "Draft",
                      detail: "Hidden from users, saved for editing.",
                    },
                    {
                      value: "published",
                      label: "Published",
                      detail: "Visible to all active users immediately.",
                    },
                  ].map((option) => (
                    <label key={option.value} className="flex cursor-pointer items-start gap-3">
                      <RadioGroupItem
                        value={option.value}
                        className="mt-0.5 size-4.5 border-outline data-checked:border-action data-checked:bg-action dark:data-checked:bg-action"
                      />
                      <span>
                        <span className="block text-base leading-5">{option.label}</span>
                        <span className="block text-sm text-outline">{option.detail}</span>
                      </span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            )}
          />
        </DashboardCard>
      </div>
    </form>
  );
}

/** The cover drop zone: a picked or dropped image previews here, checked for type and size. */
function CoverImageCard() {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [cover, setCover] = useState<{ url: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  // Frees the preview's object URL when it's replaced or the page goes.
  useEffect(
    () => () => {
      if (cover) URL.revokeObjectURL(cover.url);
    },
    [cover],
  );

  const accept = (file: File | undefined) => {
    if (!file) return;
    if (!COVER_TYPES.includes(file.type)) {
      setError("Use an SVG, PNG, JPG or GIF image.");
      return;
    }
    const url = URL.createObjectURL(file);
    const probe = new window.Image();
    probe.onload = () => {
      if (
        file.type !== "image/svg+xml" &&
        (probe.naturalWidth > COVER_MAX.width || probe.naturalHeight > COVER_MAX.height)
      ) {
        URL.revokeObjectURL(url);
        setError(
          `That image is ${probe.naturalWidth}×${probe.naturalHeight}px; the most is 800×400px.`,
        );
        return;
      }
      setError(null);
      setCover({ url, name: file.name });
    };
    probe.onerror = () => {
      URL.revokeObjectURL(url);
      setError("That file couldn't be read as an image.");
    };
    probe.src = url;
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    accept(event.dataTransfer.files[0]);
  };

  return (
    <DashboardCard className="p-6 sm:p-6">
      <DashboardCardTitle className="text-2xl leading-8 font-semibold">
        Cover Image
      </DashboardCardTitle>
      {cover ? (
        <figure className="mt-8">
          {/* A local preview of the picked file. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover.url}
            alt="Cover preview"
            className="aspect-2/1 w-full rounded-lg border object-cover"
          />
          <figcaption className="mt-3 flex items-center justify-between gap-3 text-sm text-muted-foreground">
            <span className="truncate">{cover.name}</span>
            <button
              type="button"
              onClick={() => {
                setCover(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 font-medium text-destructive outline-none hover:bg-destructive/10 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <TrashIcon aria-hidden weight="bold" className="size-4" />
              Remove
            </button>
          </figcaption>
        </figure>
      ) : (
        <label
          htmlFor={inputId}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "mt-8 flex min-h-66 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted px-6 text-center transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
            dragging && "border-action bg-action/5",
          )}
        >
          <span
            aria-hidden
            className="flex size-12 items-center justify-center rounded-full bg-info-soft text-action dark:bg-info-soft/20 dark:text-primary"
          >
            <CloudArrowUpIcon weight="bold" className="size-6" />
          </span>
          <span className="mt-5 max-w-40 text-base leading-6 font-semibold text-muted-foreground">
            Click to upload or drag and drop
          </span>
          <span className="mt-1.5 max-w-44 text-xs leading-4 text-outline">
            SVG, PNG, JPG or GIF (max. 800×400px)
          </span>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={COVER_TYPES.join(",")}
            className="sr-only"
            onChange={(event: ChangeEvent<HTMLInputElement>) => accept(event.target.files?.[0])}
          />
        </label>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </DashboardCard>
  );
}
