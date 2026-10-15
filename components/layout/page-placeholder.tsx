import { ClockIcon } from "lucide-react";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type EndpointGroup = Record<string, string | ((...ids: string[]) => string)>;

/** Placeholder for a section that's waiting on its designs. Lists its backend routes, if any. */
export function PagePlaceholder({
  title,
  groups = [],
}: {
  title: string;
  groups?: EndpointGroup[];
}) {
  const endpoints = [
    ...new Set(
      groups.flatMap((group) =>
        Object.values(group).map((value) =>
          typeof value === "string" ? value : value(":id", ":id"),
        ),
      ),
    ),
  ];

  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ClockIcon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>
          {endpoints.length
            ? "Waiting on designs. These backend routes are ready:"
            : "Waiting on designs. The backend has no admin routes for this yet."}
        </EmptyDescription>
      </EmptyHeader>
      {endpoints.length > 0 && (
        <EmptyContent>
          <ul className="font-mono text-xs text-muted-foreground">
            {endpoints.map((endpoint) => (
              <li key={endpoint}>{endpoint}</li>
            ))}
          </ul>
        </EmptyContent>
      )}
    </Empty>
  );
}
