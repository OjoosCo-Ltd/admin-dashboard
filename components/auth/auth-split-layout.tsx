import { cn } from "cn";
import type { ReactNode } from "react";

import { BrandPanel } from "@/components/auth/brand-panel";
import { AdminLogo } from "@/components/layout/logo";

/**
 * Brand panel beside a form, as on the login and setup frames (1440 wide:
 * 782px panel, 658px form side). From lg the layout is exactly one viewport
 * tall: the panel stays put and only the form side scrolls. Below lg only the
 * form shows, and the page scrolls normally.
 */
export function AuthSplitLayout({
  panelSide = "left",
  width = "default",
  children,
}: {
  panelSide?: "left" | "right";
  /** default is the login form's 432px column, wide the setup form's 480px. */
  width?: "default" | "wide";
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid min-h-svh lg:h-svh lg:grid-rows-1",
        panelSide === "left" ? "lg:grid-cols-[782fr_658fr]" : "lg:grid-cols-[658fr_782fr]",
      )}
    >
      <BrandPanel className={cn(panelSide === "right" && "lg:order-last")} />
      {/*
        m-auto rather than items-center, so a form taller than the viewport
        scrolls from its top. relative keeps absolutely positioned children
        (Radix's hidden checkbox input) inside the scroller; otherwise they'd
        stretch the page and the whole layout would scroll.
      */}
      <div className="relative flex px-4 py-12 sm:px-10 lg:overflow-y-auto lg:py-28">
        <div className={cn("m-auto w-full", width === "wide" ? "max-w-120" : "max-w-108")}>
          <AdminLogo className="mb-6" />
          {children}
        </div>
      </div>
    </div>
  );
}
