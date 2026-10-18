import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { RESOURCE_FORM_ID, ResourceForm } from "@/components/well-being/resource-form";

export const metadata: Metadata = { title: "Create Resource" };

const button =
  "flex h-14 items-center justify-center rounded-[12px] px-8 text-[17px] outline-none focus-visible:ring-3 focus-visible:ring-ring/50 max-sm:h-12 max-sm:flex-1 max-sm:px-4";

// UI only: the form validates and previews, but nothing is saved yet.
export default function CreateResourcePage() {
  return (
    <>
      <PageHeader
        title="Create New Resource"
        description="Add a new educational article, guide, or exercise to the well-being library."
      >
        <Link
          href="/well-being/resources"
          className={`${button} border border-border bg-transparent text-subtle-foreground hover:bg-muted`}
        >
          Cancel
        </Link>
        {/* The form lives below; these submit it, each saying how. */}
        <button
          type="submit"
          form={RESOURCE_FORM_ID}
          name="intent"
          value="draft"
          className={`${button} border border-border bg-transparent text-subtle-foreground hover:bg-muted`}
        >
          Save Draft
        </button>
        <button
          type="submit"
          form={RESOURCE_FORM_ID}
          name="intent"
          value="published"
          className={`${button} bg-primary text-primary-foreground hover:bg-primary/90 max-sm:basis-full`}
        >
          Publish Resource
        </button>
      </PageHeader>
      <ResourceForm />
    </>
  );
}
