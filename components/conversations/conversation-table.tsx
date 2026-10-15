"use client";

import {
  DotsThreeVerticalIcon,
  EyeIcon,
  FunnelSimpleIcon,
  WarningOctagonIcon,
} from "@phosphor-icons/react";
import { cn } from "cn";
import { parseAsInteger, parseAsStringLiteral, useQueryState } from "nuqs";
import { useId, useRef, useState } from "react";

import {
  AiAssistBadge,
  SAFETY_STYLES,
  SafetyStatusBadge,
} from "@/components/conversations/conversation-badges";
import { ConversationSheet } from "@/components/conversations/conversation-sheet";
import { EvidenceReviewDialog } from "@/components/conversations/evidence-review-dialog";
import { FlagConversationDialog } from "@/components/conversations/flag-conversation-dialog";
import { pairName } from "@/components/conversations/participants";
import { SuspendAccountDialog } from "@/components/conversations/suspend-account-dialog";
import { WarnUserDialog } from "@/components/conversations/warn-user-dialog";
import { DashboardCard, DashboardCardTitle } from "@/components/dashboard/dashboard-card";
import { PagePagination } from "@/components/dashboard/page-pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { initials } from "@/libs/utils";
import type { Conversation, SafetyStatus } from "@/types/conversations";

const PAGE_SIZE = 10;

const STATE_FILTERS = ["all", "active", "paused", "closed"] as const satisfies readonly (
  "all" | Conversation["state"]
)[];

type StateFilter = (typeof STATE_FILTERS)[number];

const STATE_LABELS: Record<StateFilter, string> = {
  all: "All Statuses",
  active: "Active",
  paused: "Paused",
  closed: "Closed",
};

const SAFETY_FILTERS = ["all", "healthy", "under-review", "reported"] as const satisfies readonly (
  "all" | SafetyStatus
)[];

type SafetyFilter = (typeof SAFETY_FILTERS)[number];

const isStateFilter = (value: string): value is StateFilter =>
  (STATE_FILTERS as readonly string[]).includes(value);

const isSafetyFilter = (value: string): value is SafetyFilter =>
  (SAFETY_FILTERS as readonly string[]).includes(value);

// Widths from the Figma's 1,110px table. They're targets: a column still
// grows to fit its content, and the table scrolls sideways when it can't fit.
const COLUMNS = [
  { label: "Conversation ID", width: "w-[14.6%]" },
  { label: "Participants", width: "w-[13.7%]" },
  { label: "Match Date", width: "w-[7.1%]" },
  { label: "Messages", width: "w-[14%]", align: "text-center" },
  { label: "Last Activity", width: "w-[10.8%]" },
  { label: "AI Assist", width: "w-[10%]" },
  { label: "Safety Status", width: "w-[13.7%]" },
  { label: "Actions", width: "w-[16.1%]" },
];

/** A row dialog: the evidence review (Investigate), or a moderation action. */
type DialogKind = "evidence" | "flag" | "warn" | "suspend";

const cell = "px-4 py-3";

// The two header controls: white, outlined, 34px tall.
const control =
  "h-8.5 rounded-md bg-background pl-3 text-[13px] font-semibold text-foreground data-[size=default]:h-8.5";

// The Figma sets the row icons 3px above the row's middle, where the text and pills sit.
const iconButton =
  "inline-flex size-7 -translate-y-0.75 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=open]:bg-muted";

const count = new Intl.NumberFormat("en-US");

/** "Oct 12, 2023" may only break before the year, as the Figma sets it. */
const keepMonthDay = (date: string) => date.replace(" ", "\u00a0");

/**
 * Conversation Management: status and safety filters, the conversations and
 * their pages. A row opens in the side sheet, or straight into the evidence
 * review or a moderation dialog. The filters, page and open conversation live
 * in the URL (?state=, ?safety=, ?page=, ?conversation=), so a view can be shared.
 */
export function ConversationTable({
  conversations,
  total,
  className,
}: {
  conversations: Conversation[];
  /** Conversations across every page. */
  total: number;
  className?: string;
}) {
  const titleId = useId();
  const [stateFilter, setStateFilter] = useQueryState(
    "state",
    parseAsStringLiteral(STATE_FILTERS).withDefault("all"),
  );
  const [safetyFilter, setSafetyFilter] = useQueryState(
    "safety",
    parseAsStringLiteral(SAFETY_FILTERS).withDefault("all"),
  );
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [conversationId, setConversationId] = useQueryState("conversation");
  const [dialog, setDialog] = useState<{ kind: DialogKind; id: string } | null>(null);

  // UI only: filtering the sample rows stands in for /admin/chat/conversations'
  // `status` and `hasReports` params (which don't map one to one yet), and
  // every page shows the same sample rows.
  const rows = conversations.filter(
    (row) =>
      (stateFilter === "all" || row.state === stateFilter) &&
      (safetyFilter === "all" || row.safety === safetyFilter),
  );
  const filtered = stateFilter !== "all" || safetyFilter !== "all";
  const filteredTotal = filtered ? rows.length : total;
  const pageCount = Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), pageCount);
  const first = (currentPage - 1) * PAGE_SIZE + 1;
  const last = Math.min(currentPage * PAGE_SIZE, filteredTotal);

  const selected = conversations.find((row) => row.id === conversationId);
  // Keeps the last conversation on screen while the sheet animates closed.
  const [shown, setShown] = useState(selected);
  if (selected && selected !== shown) setShown(selected);
  // The button that opened the sheet (the eye, or a row's ⋮), to take focus back when it closes.
  const opener = useRef<HTMLElement>(null);

  const view = (id: string, from: HTMLElement) => {
    opener.current = from;
    void setConversationId(id);
  };

  return (
    <DashboardCard className={cn("overflow-hidden p-0", className)}>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b p-6">
        <DashboardCardTitle id={titleId} className="text-xl/7 font-semibold">
          Conversation Management
        </DashboardCardTitle>
        <div className="flex w-full gap-3 sm:w-auto">
          <Select
            value={stateFilter}
            onValueChange={(value) => {
              if (!isStateFilter(value)) return;
              void setStateFilter(value === "all" ? null : value);
              void setPage(null);
            }}
          >
            <SelectTrigger
              aria-label="Filter by status"
              className={cn(
                control,
                "min-w-0 flex-1 pr-2.5 sm:w-35.5 sm:flex-none [&_svg]:text-[#6b7280] dark:[&_svg]:text-muted-foreground",
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="end">
              {STATE_FILTERS.map((value) => (
                <SelectItem key={value} value={value} className="py-2">
                  {STATE_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <SafetyFilterMenu
            value={safetyFilter}
            onChange={(value) => {
              void setSafetyFilter(value === "all" ? null : value);
              void setPage(null);
            }}
          />
        </div>
      </div>

      <Table aria-labelledby={titleId} className="min-w-230">
        <colgroup>
          {COLUMNS.map((column) => (
            <col key={column.label} className={column.width} />
          ))}
        </colgroup>
        <TableHeader className="[&_tr]:border-b-0">
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            {COLUMNS.map((column) => (
              <TableHead
                key={column.label}
                className={cn(
                  "h-auto px-4 py-3 text-xs/4 font-semibold tracking-wider whitespace-normal text-muted-foreground uppercase",
                  column.align,
                )}
              >
                {/* The Figma stacks every two-word label. */}
                <span className="inline-block w-min">{column.label}</span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.id === conversationId ? "selected" : undefined}
              className="border-border/30 hover:bg-primary/5 data-[state=selected]:bg-primary/5 dark:border-border"
            >
              <TableCell className={cn(cell, "text-xs font-bold tracking-wider")}>
                #{row.id}
              </TableCell>
              <TableCell className={cell}>
                <div className="flex items-center gap-0.5">
                  <div className="flex shrink-0 -space-x-2">
                    {row.participants.map((participant) => (
                      // A white border sets the second photo off the first. The Figma's
                      // photos have no inner outline, hence after:hidden.
                      <Avatar
                        key={participant.id}
                        className="size-8 border-2 border-card after:hidden"
                      >
                        {participant.avatarUrl && (
                          <AvatarImage src={participant.avatarUrl} alt="" />
                        )}
                        <AvatarFallback className="bg-accent text-[10px] font-semibold text-primary">
                          {initials(participant.name)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  {/* The Figma's 47px text box ("Sarah / & Mark", "Alex & / Sam"), widened only by a longer word. */}
                  <span className="w-min min-w-11.75 shrink-0 text-[13px]/4.5 whitespace-normal">
                    {pairName(row)}
                  </span>
                </div>
              </TableCell>
              <TableCell
                className={cn(cell, "text-[13px]/4.5 whitespace-normal text-muted-foreground")}
              >
                <span className="block max-w-15">{keepMonthDay(row.matchedOn)}</span>
              </TableCell>
              <TableCell className={cn(cell, "text-center text-[13px]")}>
                {count.format(row.messageCount)}
              </TableCell>
              <TableCell
                className={cn(cell, "text-[13px]/4.5 whitespace-normal text-muted-foreground")}
              >
                {/* Narrow enough that "Active Now" takes two lines and "14m ago" one. */}
                <span className="block max-w-15">{row.lastActivity}</span>
              </TableCell>
              <TableCell className={cell}>
                <AiAssistBadge level={row.aiAssist} />
              </TableCell>
              <TableCell className={cell}>
                <SafetyStatusBadge status={row.safety} />
              </TableCell>
              <TableCell className={cell}>
                <RowActions
                  conversation={row}
                  dialog={dialog?.id === row.id ? dialog.kind : null}
                  onDialogChange={(kind) => setDialog(kind ? { kind, id: row.id } : null)}
                  onView={(from) => view(row.id, from)}
                />
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={COLUMNS.length}
                className="h-24 text-center text-[13px] text-muted-foreground"
              >
                No conversations match these filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* pr-4: the › button's own padding puts its glyph 28px in, where the Figma has it. */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t bg-muted/30 py-3 pr-4 pl-6">
        <p className="text-[13px] text-muted-foreground">
          {filteredTotal === 0
            ? "No conversations to show"
            : `Showing ${count.format(first)} to ${count.format(last)} of ${count.format(filteredTotal)} ${filteredTotal === 1 ? "conversation" : "conversations"}`}
        </p>
        <PagePagination
          page={currentPage}
          pageCount={pageCount}
          onPageChange={(next) => void setPage(next === 1 ? null : next)}
          variant="compact"
        />
      </div>

      <ConversationSheet
        conversation={shown}
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) void setConversationId(null);
        }}
        onCloseAutoFocus={(event) => {
          if (!opener.current?.isConnected) return;
          event.preventDefault();
          opener.current.focus();
        }}
      />
    </DashboardCard>
  );
}

/** "Filter by Safety": a menu of the safety statuses. Its funnel turns teal while one is set. */
function SafetyFilterMenu({
  value,
  onChange,
}: {
  value: SafetyFilter;
  onChange: (value: SafetyFilter) => void;
}) {
  return (
    // Not modal: a modal menu locks scrolling, and hiding the scrollbar shifts the page.
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(control, "min-w-0 flex-1 justify-between pr-2.5 sm:w-40.75 sm:flex-none")}
        >
          Filter by Safety
          {value !== "all" && <span className="sr-only">: {SAFETY_STYLES[value].label}</span>}
          <FunnelSimpleIcon
            aria-hidden
            weight="bold"
            className={cn(
              "size-4",
              value === "all" ? "text-muted-foreground" : "text-action dark:text-primary",
            )}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Safety status</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(next) => {
            if (isSafetyFilter(next)) onChange(next);
          }}
        >
          {SAFETY_FILTERS.map((option) => (
            <DropdownMenuRadioItem key={option} value={option} className="py-2">
              {option === "all" ? "All" : SAFETY_STYLES[option].label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface RowActionsProps {
  conversation: Conversation;
  /** Which of this row's dialogs is open. */
  dialog: DialogKind | null;
  onDialogChange: (dialog: DialogKind | null) => void;
  /** Opens the sheet. `from` gets focus back when it closes. */
  onView: (from: HTMLElement) => void;
}

/**
 * A row's actions. Open conversations show the eye (the sheet) and a flag;
 * reported ones lead with Investigate (the evidence review) and keep the
 * rest in a ⋮ menu.
 */
function RowActions(props: RowActionsProps) {
  const { conversation, dialog, onDialogChange, onView } = props;
  const name = `#${conversation.id}`;

  if (conversation.safety === "reported") return <ReportedRowActions {...props} />;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label={`View conversation ${name}`}
        onClick={(event) => onView(event.currentTarget)}
        className={iconButton}
      >
        <EyeIcon aria-hidden weight="bold" className="size-4.75" />
      </button>
      <FlagConversationDialog
        conversation={conversation}
        open={dialog === "flag"}
        onOpenChange={(open) => onDialogChange(open ? "flag" : null)}
        trigger={
          <button type="button" aria-label={`Flag ${name} for review`} className={iconButton}>
            <WarningOctagonIcon aria-hidden weight="bold" className="size-4.5" />
          </button>
        }
      />
    </div>
  );
}

function ReportedRowActions({ conversation, dialog, onDialogChange, onView }: RowActionsProps) {
  const name = `#${conversation.id}`;
  const menuRef = useRef<HTMLButtonElement>(null);
  // Set when an item opens the sheet or a dialog: that takes focus, so the menu mustn't take it back.
  const handedOff = useRef(false);

  const openFromMenu = (kind: DialogKind) => {
    handedOff.current = true;
    onDialogChange(kind);
  };
  // The menu's items are gone by the time these dialogs close, so focus goes back to the ⋮.
  const returnToMenu = (event: Event) => {
    event.preventDefault();
    menuRef.current?.focus();
  };
  const dialogProps = (kind: DialogKind) => ({
    conversation,
    open: dialog === kind,
    onOpenChange: (open: boolean) => onDialogChange(open ? kind : null),
  });

  return (
    <div className="flex items-center gap-1">
      <EvidenceReviewDialog
        {...dialogProps("evidence")}
        trigger={
          <button
            type="button"
            className="h-8 shrink-0 rounded-md bg-action/10 px-3 text-base text-action transition-colors outline-none hover:bg-action/15 focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-primary/15 dark:text-primary dark:hover:bg-primary/25"
          >
            Investigate<span className="sr-only"> {name}</span>
          </button>
        }
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          ref={menuRef}
          aria-label={`More actions for ${name}`}
          className={iconButton}
        >
          <DotsThreeVerticalIcon aria-hidden weight="bold" className="size-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-44"
          onCloseAutoFocus={(event) => {
            if (handedOff.current) event.preventDefault();
            handedOff.current = false;
          }}
        >
          <DropdownMenuItem
            onSelect={() => {
              if (!menuRef.current) return;
              handedOff.current = true;
              onView(menuRef.current);
            }}
          >
            View details
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => openFromMenu("flag")}>Flag for review</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => openFromMenu("warn")}>Warn user</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => openFromMenu("suspend")}>
            Suspend account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <FlagConversationDialog {...dialogProps("flag")} onCloseAutoFocus={returnToMenu} />
      <WarnUserDialog {...dialogProps("warn")} onCloseAutoFocus={returnToMenu} />
      <SuspendAccountDialog {...dialogProps("suspend")} onCloseAutoFocus={returnToMenu} />
    </div>
  );
}
