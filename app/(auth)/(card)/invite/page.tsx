import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { InviteForm, type Invitation } from "@/components/auth/invite-form";

export const metadata: Metadata = { title: "Accept invitation" };

// UI only: the real values come from the invitation link.
const SAMPLE_INVITATION: Invitation = {
  fullName: "Maya Bennett",
  email: "maya.bennett@example.com",
  role: "Trust & Safety Admin",
};

export default function InvitePage() {
  return (
    <AuthCard size="wide">
      <InviteForm invitation={SAMPLE_INVITATION} />
    </AuthCard>
  );
}
