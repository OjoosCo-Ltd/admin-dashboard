"use client";

import { ListChecksIcon, PlusIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import Link from "next/link";
import type { ReactNode } from "react";
import { toast } from "sonner";

/** The header's primary action, shared by the Overview and Resources tabs. */
export function CreateResourceLink() {
  return (
    <Link
      href="/well-being/resources/new"
      className="flex h-14 items-center gap-3 rounded-[12px] bg-primary pr-6 pl-5.5 text-base font-semibold text-primary-foreground outline-none hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50 max-sm:w-full max-sm:justify-center"
    >
      <PlusIcon aria-hidden weight="bold" className="size-4" />
      Create Resource
    </Link>
  );
}

/** The header link to the question editor, on the Assessment and Dating Coach tabs. */
export function ManageQuestionsLink() {
  return (
    <Link
      href="/well-being/assessment/questions"
      className="flex h-14 items-center gap-3 rounded-[12px] bg-primary pr-6 pl-5.5 text-base font-semibold text-primary-foreground outline-none hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50 max-sm:w-full max-sm:justify-center"
    >
      <ListChecksIcon aria-hidden weight="bold" className="size-4.5" />
      Manage Questions
    </Link>
  );
}

/** A header button whose action has no endpoint yet: it says so in a toast. */
export function NotYetButton({
  message,
  className,
  children,
}: {
  message: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => toast(message)}
      className={cn(
        "flex h-14 items-center justify-center gap-3 rounded-[12px] px-8 text-[17px] outline-none focus-visible:ring-3 focus-visible:ring-ring/50 max-sm:h-12 max-sm:w-full",
        className,
      )}
    >
      {children}
    </button>
  );
}
