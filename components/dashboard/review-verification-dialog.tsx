"use client";

import {
  ArrowClockwiseIcon,
  CheckCircleIcon,
  IdentificationCardIcon,
  MagnifyingGlassPlusIcon,
  SealCheckIcon,
  WarningIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import {
  ActionDialogBody,
  ActionDialogContent,
  ActionDialogFooter,
  ActionDialogHeader,
} from "@/components/dashboard/action-dialog";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { VerificationCheck, VerificationRequest } from "@/types/dashboard";

// Submission times are shown in GMT, so every admin reads the same time.
const day = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
const time = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

const CHECK_STATUS: Record<VerificationCheck["status"], { icon: ReactNode; label: string }> = {
  passed: { icon: <CheckCircleIcon className="size-4.5 text-success" />, label: "passed" },
  warning: {
    icon: <WarningIcon weight="bold" className="size-4.5 text-[#f59e0b]" />,
    label: "needs review",
  },
  failed: { icon: <XCircleIcon className="size-4.5 text-destructive" />, label: "failed" },
};

// On phones the two secondary actions share a row above a full-width Approve.
const footerButton =
  "h-14 rounded-[10px] px-8 text-[17px] font-normal max-sm:h-11 max-sm:px-3 max-sm:text-[15px]";

/** An admin's review of one ID verification: who, what was submitted, automated checks, decision. */
export function ReviewVerificationDialog({
  request,
  open,
  onOpenChange,
}: {
  request: VerificationRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [rotation, setRotation] = useState(0);
  const submittedAt = new Date(request.submittedAt);

  // UI only: none of the decisions reach the verification endpoints yet.
  const notYet = (action: string) => toast(`${action} isn't available yet`);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ActionDialogContent className="max-w-225">
        <ActionDialogHeader
          icon={<SealCheckIcon />}
          title="Review Verification"
          description={`Request ID: ${request.id}`}
        />
        <ActionDialogBody className="flex flex-col gap-6">
          <dl className="grid gap-6 rounded-xl border bg-muted p-6 sm:grid-cols-3">
            <div>
              <dt className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                User legal name
              </dt>
              <dd className="mt-2 text-xl leading-7 font-semibold">{request.legalName}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                Document type
              </dt>
              <dd className="mt-2 flex items-center gap-2 text-base leading-6 font-medium">
                <IdentificationCardIcon aria-hidden className="size-5 shrink-0 text-action" />
                {request.documentType}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                Submission date
              </dt>
              <dd className="mt-2 text-base leading-6">
                <time dateTime={request.submittedAt}>
                  {day.format(submittedAt)} • {time.format(submittedAt)} GMT
                </time>
              </dd>
            </div>
          </dl>

          <div className="grid gap-6 sm:grid-cols-2">
            <ImagePanel
              title="Profile photo"
              src={request.photoUrl}
              alt={`Profile photo of ${request.legalName}`}
            />
            <ImagePanel
              title="Submitted ID document"
              src={request.documentUrl}
              alt={`${request.documentType} submitted by ${request.legalName}`}
              contain
              rotation={rotation}
              onRotate={() => setRotation((current) => (current + 90) % 360)}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_12.25rem]">
            <div className="flex flex-col gap-3">
              <label
                htmlFor="verification-notes"
                className="text-base text-muted-foreground uppercase"
              >
                Administrative notes
              </label>
              <Textarea
                id="verification-notes"
                placeholder="Add observations regarding document authenticity or facial match..."
                className="min-h-28 rounded-lg bg-surface px-6 py-5 text-[15px] placeholder:text-[#6b7280] md:text-[15px]"
              />
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-base font-normal text-muted-foreground uppercase">Checks</h3>
              <ul className="flex flex-col gap-1.5">
                {request.checks.map((check) => (
                  <li
                    key={check.id}
                    className="flex h-8 items-center justify-between gap-2 rounded-md border bg-surface px-3 text-xs font-medium"
                  >
                    {check.label}
                    <span aria-hidden>{CHECK_STATUS[check.status].icon}</span>
                    <span className="sr-only">: {CHECK_STATUS[check.status].label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ActionDialogBody>
        <ActionDialogFooter className="max-sm:grid max-sm:grid-cols-2">
          <Button
            variant="outline"
            onClick={() => notYet("Requesting more info")}
            className={`${footerButton} bg-background text-muted-foreground`}
          >
            Request More Info
          </Button>
          <Button
            variant="outline"
            onClick={() => notYet("Rejecting a submission")}
            className={`${footerButton} border-destructive bg-background text-destructive hover:bg-destructive/5 hover:text-destructive`}
          >
            Reject Submission
          </Button>
          <Button
            onClick={() => notYet("Approving a user")}
            className={`${footerButton} bg-action text-white hover:bg-action/90 max-sm:col-span-2`}
          >
            Approve User
          </Button>
        </ActionDialogFooter>
      </ActionDialogContent>
    </Dialog>
  );
}

/** A titled image frame with a full-size link and, for documents, a rotate control. */
function ImagePanel({
  title,
  src,
  alt,
  contain = false,
  rotation = 0,
  onRotate,
}: {
  title: string;
  src: string;
  alt: string;
  contain?: boolean;
  rotation?: number;
  onRotate?: () => void;
}) {
  const sideways = rotation % 180 !== 0;

  return (
    <section className="overflow-hidden rounded-xl border">
      <div className="flex h-11 items-center justify-between gap-2 bg-muted-strong px-4">
        <h3 className="text-xs font-semibold tracking-wider uppercase">{title}</h3>
        <div className="flex items-center gap-1">
          {onRotate && (
            <button
              type="button"
              onClick={onRotate}
              className="rounded-md p-1 text-muted-foreground outline-none hover:bg-background/60 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <ArrowClockwiseIcon aria-hidden weight="bold" className="size-5" />
              <span className="sr-only">Rotate {title.toLowerCase()}</span>
            </button>
          )}
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="rounded-md p-1 text-muted-foreground outline-none hover:bg-background/60 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <MagnifyingGlassPlusIcon aria-hidden weight="bold" className="size-5" />
            <span className="sr-only">Open {title.toLowerCase()} full size (new tab)</span>
          </a>
        </div>
      </div>
      <div className={`relative h-89 overflow-hidden ${contain ? "bg-[#ececec]" : "bg-muted"}`}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 640px) 26rem, 100vw"
          className={
            contain
              ? "object-contain p-9 transition-transform duration-200 motion-reduce:transition-none"
              : "object-cover"
          }
          // A quarter turn of a landscape card has to shrink to stay in the frame.
          style={
            contain
              ? { transform: `rotate(${rotation}deg) scale(${sideways ? 0.62 : 1})` }
              : undefined
          }
        />
      </div>
    </section>
  );
}
