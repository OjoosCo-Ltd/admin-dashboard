import { CheckCircleIcon } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard, AuthHeader, AuthStatusIcon } from "@/components/auth/auth-card";
import { AuthButton } from "@/components/auth/auth-controls";

export const metadata: Metadata = { title: "Password reset" };

export default function PasswordResetSuccessPage() {
  return (
    <AuthCard>
      <AuthStatusIcon tone="success">
        <CheckCircleIcon aria-hidden />
      </AuthStatusIcon>
      <AuthHeader
        title="Your password has been reset"
        description="Sign in with your new password to access your administration workspace."
      />
      <AuthButton asChild className="mt-6">
        <Link href="/login">Back to sign in</Link>
      </AuthButton>
    </AuthCard>
  );
}
