"use client";

import { CpuIcon, EyeIcon, EyeSlashIcon, XIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { Dialog as DialogPrimitive } from "radix-ui";
import { type ReactNode, useId, useState } from "react";
import { toast } from "sonner";

import { ActionSheetContent } from "@/components/dashboard/action-sheet";
import { SuspendAccountDialog } from "@/components/conversations/suspend-account-dialog";
import { WarnUserDialog } from "@/components/conversations/warn-user-dialog";
import { BanAccountDialog } from "@/components/reports/ban-account-dialog";
import { CATEGORY_LABELS, reportInitials, riskVerdict } from "@/components/reports/report-styles";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { FEATURES } from "@/constants/features";
import type { SafetyReport } from "@/types/reports";

const sectionLabel =
  "text-[11px] font-bold tracking-widest text-review uppercase dark:text-subtle-foreground";

const footerButton =
  "h-14 rounded-xl text-base font-semibold tracking-wide outline-none focus-visible:ring-3 focus-visible:ring-ring/50 max-sm:h-12 max-sm:text-base";

/**
 * A report in full: who's involved, the evidence, the AI's read on it, notes,
 * and the four outcomes. Warn and Suspend reuse the Conversations dialogs,
 * aimed at the reported user; they open over the sheet, which fades its scrim.
 */
export function ReportSheet({
  report,
  onOpenChange,
  onCloseAutoFocus,
}: {
  report: SafetyReport | null;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus: (event: Event) => void;
}) {
  const [nested, setNested] = useState<"warn" | "suspend" | "ban" | null>(null);

  return (
    <Dialog open={report !== null} onOpenChange={onOpenChange}>
      <ActionSheetContent
        nestedOpen={nested !== null}
        onCloseAutoFocus={onCloseAutoFocus}
        className="max-w-128"
      >
        {report && (
          // Keyed, so the notes and the hidden image reset for each report.
          <ReportDetail key={report.id} report={report} nested={nested} onNested={setNested} />
        )}
      </ActionSheetContent>
    </Dialog>
  );
}

function ReportDetail({
  report,
  nested,
  onNested,
}: {
  report: SafetyReport;
  nested: "warn" | "suspend" | "ban" | null;
  onNested: (dialog: "warn" | "suspend" | "ban" | null) => void;
}) {
  const notesId = useId();
  const user = report.reportedUser;
  const toggle = (dialog: "warn" | "suspend" | "ban") => (open: boolean) =>
    onNested(open ? dialog : null);

  return (
    <>
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border/40 bg-background px-8 pt-6 pb-5 max-sm:px-4 dark:border-border">
        <div className="min-w-0">
          <DialogPrimitive.Title className="text-xl leading-7 font-bold tracking-wide">
            #{report.id}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {CATEGORY_LABELS[report.category]} report against {user.name}.
          </DialogPrimitive.Description>
          <div className="mt-1.5 flex flex-wrap gap-2">
            <span className="rounded-full bg-muted-strong px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase dark:bg-muted">
              {CATEGORY_LABELS[report.category]}
            </span>
            {FEATURES.aiMetrics && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
                  report.aiRisk >= 80
                    ? "bg-[#f8e8e8] text-destructive dark:bg-destructive/20"
                    : "bg-[#f3ede7] text-caution dark:bg-caution/30 dark:text-[#e9b97c]",
                )}
              >
                AI Risk: {report.aiRisk}/100 ({riskVerdict(report.aiRisk)})
              </span>
            )}
          </div>
        </div>
        <DialogPrimitive.Close className="-mr-1 rounded-md p-1 text-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50">
          <XIcon aria-hidden weight="bold" className="size-6" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-surface px-8 py-8 max-sm:px-4 dark:bg-background">
        <section>
          <h3 className={sectionLabel}>Users Involved</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <PersonCard
              tone="reported"
              initials={reportInitials(user.name)}
              name={user.name}
              role="Reported User"
              rows={[
                {
                  label: "Status",
                  value: user.flagged ? (
                    <span className="rounded bg-destructive-container px-1.5 py-0.5 text-[11px] text-destructive dark:bg-destructive/20">
                      Flagged
                    </span>
                  ) : (
                    <span className="text-[11px]">{user.accountStatus}</span>
                  ),
                },
                {
                  label: "Warning History",
                  value: (
                    <span className="text-[11px] font-bold">
                      {user.priorWarnings > 0 ? `${user.priorWarnings} Prior` : "None"}
                    </span>
                  ),
                },
              ]}
            />
            {report.reporter.kind === "member" ? (
              <PersonCard
                tone="reporter"
                initials={reportInitials(report.reporter.name)}
                name={report.reporter.name}
                role="Reporter"
                rows={[
                  {
                    label: "Status",
                    value: report.reporter.verified ? (
                      <span className="rounded bg-[#daf1fb] px-1.5 py-0.5 text-[11px] text-action dark:bg-action/25 dark:text-primary">
                        Verified
                      </span>
                    ) : (
                      <span className="text-[11px]">Unverified</span>
                    ),
                  },
                  {
                    label: "Trust Score",
                    value: (
                      <span className="text-[11px] font-bold tabular-nums">
                        {report.reporter.trustScore}/100
                      </span>
                    ),
                  },
                ]}
              />
            ) : (
              <PersonCard
                tone="reporter"
                initials={<CpuIcon weight="bold" className="size-5" />}
                name={report.reporter.name}
                role="Reporter"
                rows={[
                  { label: "Source", value: <span className="text-[11px]">Automated scan</span> },
                  {
                    label: "Confidence",
                    value: <span className="text-[11px] font-bold">{report.aiRisk}/100</span>,
                  },
                ]}
              />
            )}
          </div>
        </section>

        <section className="mt-9">
          <h3 className={sectionLabel}>Evidence Review</h3>
          <div className="mt-4 overflow-hidden rounded-xl border border-border/60 bg-background dark:border-border dark:bg-card">
            <p className="bg-muted px-4 py-3 text-[13px] leading-5 dark:bg-muted/50">
              <strong className="font-semibold tracking-wide">Transcript Excerpt:</strong> &ldquo;
              {report.evidence.transcript}&rdquo;
            </p>
            <EvidenceImage url={report.evidence.imageUrl} />
          </div>
        </section>

        {FEATURES.aiMetrics && (
          <section className="mt-9">
            <h3 className={sectionLabel}>AI Safety Analysis</h3>
            <dl className="mt-4 flex flex-col gap-3.5 rounded-xl border border-border/60 bg-background px-5 py-5 dark:border-border dark:bg-card">
              {report.analysis.map((signal) => (
                <div key={signal.label}>
                  <div className="flex items-center justify-between gap-3 text-xs font-semibold">
                    <dt>{signal.label}</dt>
                    <dd className="tabular-nums">{signal.score}%</dd>
                  </div>
                  <div aria-hidden className="mt-1.5 h-1.5 rounded-full bg-container dark:bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        signal.score >= 50 ? "bg-destructive" : "bg-action dark:bg-primary",
                      )}
                      style={{ width: `${signal.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </dl>
          </section>
        )}

        <section className="mt-9">
          <h3 className={sectionLabel}>
            <label htmlFor={notesId}>Internal Notes</label>
          </h3>
          <Textarea
            id={notesId}
            placeholder="Add moderator notes here..."
            className="mt-4 min-h-24 resize-y rounded-xl border-border/60 bg-background px-4 py-3 text-sm md:text-sm dark:border-border"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Only moderators see these. They aren&apos;t saved yet.
          </p>
        </section>
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-4 border-t border-border/40 bg-background px-8 py-6 max-sm:gap-2 max-sm:p-4 dark:border-border">
        <button
          type="button"
          onClick={() => toast("Dismissing reports isn't available yet")}
          className={cn(footerButton, "border border-border bg-background hover:bg-muted")}
        >
          Dismiss Report
        </button>
        <WarnUserDialog
          target={user}
          open={nested === "warn"}
          onOpenChange={toggle("warn")}
          trigger={
            <button
              type="button"
              className={cn(
                footerButton,
                "border border-border bg-background text-caution hover:bg-muted dark:text-[#e9b97c]",
              )}
            >
              Issue Warning
            </button>
          }
        />
        <SuspendAccountDialog
          target={user}
          open={nested === "suspend"}
          onOpenChange={toggle("suspend")}
          trigger={
            <button
              type="button"
              className={cn(footerButton, "bg-action text-white hover:bg-action/90")}
            >
              Suspend Account
            </button>
          }
        />
        <BanAccountDialog
          name={user.name}
          open={nested === "ban"}
          onOpenChange={toggle("ban")}
          trigger={
            <button
              type="button"
              className={cn(
                footerButton,
                "bg-destructive text-white hover:bg-destructive/90 dark:bg-destructive/60 dark:hover:bg-destructive/50",
              )}
            >
              Permanently Ban
            </button>
          }
        />
      </div>
    </>
  );
}

function PersonCard({
  tone,
  initials,
  name,
  role,
  rows,
}: {
  tone: "reported" | "reporter";
  initials: ReactNode;
  name: string;
  role: string;
  rows: { label: string; value: ReactNode }[];
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        tone === "reported"
          ? "border-destructive bg-destructive-soft dark:bg-destructive/10"
          : "border-border/50 bg-background dark:border-border dark:bg-card",
      )}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e5e9eb] text-sm font-bold text-action dark:bg-muted dark:text-primary"
        >
          {initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm leading-5 font-bold">{name}</p>
          <p className="text-[11px] text-muted-foreground">{role}</p>
        </div>
      </div>
      <dl className="mt-3.5 flex flex-col gap-2 text-[11px]">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** The attached screenshot, blurred until a moderator chooses to look at it. */
function EvidenceImage({ url }: { url?: string }) {
  const [revealed, setRevealed] = useState(false);
  if (!url) {
    return <p className="px-4 py-4 text-[13px] text-muted-foreground">No attachments.</p>;
  }
  return (
    <div className="px-4 pt-3 pb-4">
      <p className="text-[11px]">Attached Image</p>
      <div className="relative mt-2 h-32 overflow-hidden rounded-md bg-muted">
        {/* A sample stand-in for the reported screenshot. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={revealed ? "Attached evidence" : ""}
          className={cn(
            "size-full object-cover transition-[filter]",
            !revealed && "scale-110 blur-md grayscale-[30%]",
          )}
        />
        <button
          type="button"
          aria-pressed={revealed}
          onClick={() => setRevealed((current) => !current)}
          className={cn(
            "absolute flex items-center gap-2 rounded-full bg-background/95 px-4 py-2 text-xs font-semibold whitespace-nowrap text-destructive shadow-sm outline-none hover:bg-background focus-visible:ring-3 focus-visible:ring-ring/50",
            revealed ? "right-2 bottom-2 px-3 py-1.5 text-xs" : "top-1/2 left-1/2 -translate-1/2",
          )}
        >
          {revealed ? (
            <EyeSlashIcon aria-hidden weight="bold" className="size-4" />
          ) : (
            <EyeIcon aria-hidden weight="bold" className="size-5" />
          )}
          {revealed ? "Hide image" : "Show sensitive image"}
        </button>
      </div>
    </div>
  );
}
