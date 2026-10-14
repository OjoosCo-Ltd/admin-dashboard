import type { Metadata } from "next";

import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { SetupForm } from "@/components/auth/setup-form";

export const metadata: Metadata = { title: "Set up your account" };

// UI only: the real value is the verified email bound to the setup link.
const SAMPLE_EMAIL = "alex.morgan@example.com";

export default function SetupPage() {
  return (
    <AuthSplitLayout panelSide="right" width="wide">
      <SetupForm email={SAMPLE_EMAIL} />
    </AuthSplitLayout>
  );
}
