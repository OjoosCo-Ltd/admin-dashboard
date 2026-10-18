"use client";

import { DotsThreeVerticalIcon, ImageIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { parseAsInteger, parseAsStringLiteral, useQueryStates } from "nuqs";
import { toast } from "sonner";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { PagePagination } from "@/components/dashboard/page-pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WellbeingFilterBar } from "@/components/well-being/wellbeing-filter-bar";
import type { ResourceCategory, ResourceStatus, WellbeingResource } from "@/types/well-being";

const PAGE_SIZE = 10;

export const RESOURCE_CATEGORIES: { value: "all" | ResourceCategory; label: string }[] = [
  { value: "all", label: "All Categories" },
  { value: "mindfulness", label: "Mindfulness" },
  { value: "confidence", label: "Confidence" },
  { value: "communication", label: "Communication" },
  { value: "relationships", label: "Relationships" },
];

const STATUSES: { value: "all" | ResourceStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

// Kept in the URL, so a filtered list can be shared and survives a reload.
const FILTERS = {
  category: parseAsStringLiteral(RESOURCE_CATEGORIES.map((option) => option.value)).withDefault(
    "all",
  ),
  status: parseAsStringLiteral(STATUSES.map((option) => option.value)).withDefault("all"),
  page: parseAsInteger.withDefault(1),
};

interface Filters {
  category: "all" | ResourceCategory;
  status: "all" | ResourceStatus;
  page: number;
}

const STATUS_STYLES: Record<ResourceStatus, { label: string; className: string; dot: string }> = {
  published: {
    label: "Published",
    className:
      "border-[#c8e6c9] bg-[#e8f5e9] text-[#2e7d32] dark:border-success/30 dark:bg-success/10 dark:text-success",
    dot: "bg-[#2e7d32] dark:bg-success",
  },
  draft: {
    label: "Draft",
    className: "border-border bg-[#e0e3e6] text-muted-foreground dark:bg-muted",
    dot: "bg-muted-foreground",
  },
  archived: {
    label: "Archived",
    className:
      "border-[#ffb4ab] bg-destructive-container text-[#93000a] dark:border-destructive/40 dark:bg-destructive/15 dark:text-destructive",
    dot: "bg-destructive",
  },
};

const COLUMNS = [
  { label: "Resource", width: "w-[20%]" },
  { label: "Category", width: "w-[14%]" },
  { label: "Views", width: "w-[8%]" },
  { label: "Engagement", width: "w-[17%]" },
  { label: "Published", width: "w-[10%]" },
  { label: "Status", width: "w-[11%]" },
  { label: "Actions", width: "w-[20%]" },
];

const edges = "px-3.5 first:pl-6 last:pr-6";

const day = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});
const count = new Intl.NumberFormat("en-US");

interface DirectoryProps {
  /** UI only: one sample page, filtered here. */
  resources: WellbeingResource[];
  /** Every resource, for the count and pages while no filter is set. */
  totalCount: number;
}

/** The resource library's filters and table, with the filters and page in the URL. */
export function ResourcesDirectory(props: DirectoryProps) {
  const [filters, setFilters] = useQueryStates(FILTERS);
  return <DirectoryView {...props} filters={filters} onChange={(next) => setFilters(next)} />;
}

/** What renders before the URL is read: the unfiltered first page. */
export function ResourcesDirectoryFallback(props: DirectoryProps) {
  return (
    <DirectoryView
      {...props}
      filters={{ category: "all", status: "all", page: 1 }}
      onChange={() => {}}
    />
  );
}

function DirectoryView({
  resources,
  totalCount,
  filters,
  onChange,
}: DirectoryProps & { filters: Filters; onChange: (next: Partial<Filters>) => void }) {
  const rows = resources.filter(
    (resource) =>
      (filters.category === "all" || resource.category === filters.category) &&
      (filters.status === "all" || resource.status === filters.status),
  );
  const filtered = filters.category !== "all" || filters.status !== "all";
  const total = filtered ? rows.length : totalCount;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(filters.page, 1), pageCount);
  const first = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const last = Math.min(page * PAGE_SIZE, total);

  // UI only: none of the resource actions reach a backend yet.
  const notYet = (action: string) => toast(`${action} isn't available yet`);

  return (
    <>
      <WellbeingFilterBar
        category={filters.category}
        categories={RESOURCE_CATEGORIES}
        onCategoryChange={(category) =>
          onChange({ category: category as Filters["category"], page: 1 })
        }
        status={filters.status}
        statuses={STATUSES}
        onStatusChange={(status) => onChange({ status: status as Filters["status"], page: 1 })}
      />

      <DashboardCard className="overflow-hidden p-0">
        <Table aria-label="Well-being resources" className="min-w-240">
          <colgroup>
            {COLUMNS.map((column) => (
              <col key={column.label} className={column.width} />
            ))}
          </colgroup>
          <TableHeader className="[&_tr]:border-muted-strong dark:[&_tr]:border-border">
            <TableRow className="bg-muted hover:bg-muted">
              {COLUMNS.map((column) => (
                <TableHead
                  key={column.label}
                  className={cn(
                    "h-12 text-sm font-semibold tracking-[0.08em] text-muted-foreground uppercase",
                    edges,
                  )}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((resource) => {
              const status = STATUS_STYLES[resource.status];
              const category =
                RESOURCE_CATEGORIES.find((option) => option.value === resource.category)?.label ??
                resource.category;
              return (
                <TableRow key={resource.id} className="border-muted-strong dark:border-border">
                  <TableCell className={cn(edges, "py-4")}>
                    <span className="flex items-center gap-6">
                      <span className="flex size-11.5 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                        {resource.coverUrl ? (
                          // A sample cover; the real ones come from the API.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={resource.coverUrl} alt="" className="size-full object-cover" />
                        ) : (
                          <ImageIcon aria-hidden className="size-5 text-muted-foreground" />
                        )}
                      </span>
                      <span className="text-lg leading-6 font-medium whitespace-normal">
                        {resource.title}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className={cn(edges, "py-4")}>
                    <span className="inline-flex h-7 items-center rounded-full bg-info-soft px-3.5 text-sm text-[#4d6876] dark:bg-info-soft/20 dark:text-info-soft">
                      {category}
                    </span>
                  </TableCell>
                  <TableCell className={cn(edges, "py-4 text-lg tabular-nums")}>
                    {count.format(resource.views)}
                  </TableCell>
                  <TableCell className={cn(edges, "py-4")}>
                    <span className="flex items-center gap-6">
                      <span className="w-10 text-lg text-muted-foreground tabular-nums">
                        {resource.engagement === undefined ? (
                          <>
                            <span aria-hidden>--</span>
                            <span className="sr-only">No data yet</span>
                          </>
                        ) : (
                          `${resource.engagement}%`
                        )}
                      </span>
                      <span
                        aria-hidden
                        className="h-2 w-24 rounded-full bg-muted-strong dark:bg-muted"
                      >
                        <span
                          className="block h-full rounded-full bg-action dark:bg-primary"
                          style={{ width: `${resource.engagement ?? 0}%` }}
                        />
                      </span>
                    </span>
                  </TableCell>
                  <TableCell
                    className={cn(
                      edges,
                      "py-4 text-lg leading-6 whitespace-normal text-muted-foreground",
                    )}
                  >
                    <time dateTime={resource.publishedAt}>
                      {day.format(new Date(resource.publishedAt))}
                    </time>
                  </TableCell>
                  <TableCell className={cn(edges, "py-4")}>
                    <span
                      className={cn(
                        "inline-flex h-7 items-center gap-2 rounded-md border px-2.5 text-sm",
                        status.className,
                      )}
                    >
                      <span aria-hidden className={cn("size-1.5 rounded-full", status.dot)} />
                      {status.label}
                    </span>
                  </TableCell>
                  <TableCell className={cn(edges, "py-4")}>
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger
                        aria-label={`Actions for ${resource.title}`}
                        className="ml-14 inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=open]:bg-muted"
                      >
                        <DotsThreeVerticalIcon aria-hidden weight="bold" className="size-5.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onSelect={() => notYet("Editing resources")}>
                          Edit resource
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => notYet("Previewing resources")}>
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() =>
                            notYet(
                              resource.status === "published"
                                ? "Archiving resources"
                                : "Publishing resources",
                            )
                          }
                        >
                          {resource.status === "published" ? "Archive" : "Publish"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => notYet("Deleting resources")}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={COLUMNS.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  No resources match these filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-muted-strong px-6 py-5 dark:border-border">
          <p className="text-lg text-muted-foreground">
            {total === 0
              ? "No resources to show"
              : `Showing ${count.format(first)}-${count.format(last)} of ${count.format(total)} ${total === 1 ? "resource" : "resources"}`}
          </p>
          <PagePagination
            variant="boxed"
            page={page}
            pageCount={pageCount}
            onPageChange={(next) => onChange({ page: next })}
          />
        </div>
      </DashboardCard>
    </>
  );
}
