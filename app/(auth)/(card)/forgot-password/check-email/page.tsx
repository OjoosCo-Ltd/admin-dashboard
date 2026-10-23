import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { VerifyCodeForm } from "@/components/auth/verify-code-form";

export const metadata: Metadata = { title: "Check your email" };

export default function CheckEmailPage() {
  return (
    <AuthCard>
      <VerifyCodeForm />
    </AuthCard>
  );
}
