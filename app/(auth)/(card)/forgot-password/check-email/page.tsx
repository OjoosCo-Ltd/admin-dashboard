import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard, AuthHeader, AuthStatusIcon } from "@/components/auth/auth-card";
import { AuthButton } from "@/components/auth/auth-controls";
import { MailCheckIcon } from "@/components/auth/auth-icons";

export const metadata: Metadata = { title: "Check your email" };

export default function CheckEmailPage() {
  return (
    <AuthCard>
      <AuthStatusIcon>
        <MailCheckIcon />
      </AuthStatusIcon>
      <AuthHeader
        title="Check your email"
        description="If an account matches the information provided, you’ll receive password reset instructions shortly."
      />
      <p className="mt-6 text-[13px] leading-5 text-muted-foreground">
        Check your inbox and spam folder. Reset links are time-limited and can only be used once.
      </p>
      <AuthButton asChild className="mt-6">
        <Link href="/login">Back to sign in</Link>
      </AuthButton>
    </AuthCard>
  );
}
