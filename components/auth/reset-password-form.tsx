"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

import { AuthHeader } from "@/components/auth/auth-card";
import { AuthButton, AuthFieldGroup, AuthLink } from "@/components/auth/auth-controls";
import { NewPasswordFields } from "@/components/auth/new-password-fields";
import { FieldError } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useResetPassword } from "@/hooks/api";
import { newPasswordSchema } from "@/libs/validation/password";
import { usePasswordResetStore } from "@/store/use-password-reset-store";

const schema = z
  .object({
    password: newPasswordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const email = usePasswordResetStore((state) => state.email);
  const otpCode = usePasswordResetStore((state) => state.otpCode);
  const clear = usePasswordResetStore((state) => state.clear);
  const reset = useResetPassword();
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  // The code is checked on the previous screen and kept in memory only.
  if (!email || !otpCode) {
    return (
      <>
        <AuthHeader
          title="Start your reset again"
          description="Ask for a new code to choose a new password. Codes aren't kept between visits."
        />
        <AuthButton asChild className="mt-6">
          <Link href="/forgot-password">Request a code</Link>
        </AuthButton>
      </>
    );
  }

  const onSubmit = form.handleSubmit(({ password }) =>
    reset.mutate(
      { email, otpCode, password },
      {
        onSuccess: () => {
          clear();
          router.push("/reset-password/success");
        },
      },
    ),
  );

  return (
    <>
      <AuthHeader
        title="Create a new password"
        description="Choose a strong password to secure your administrator account."
      />
      <FormProvider {...form}>
        <form method="post" onSubmit={onSubmit} noValidate className="mt-5.5">
          <AuthFieldGroup>
            <NewPasswordFields passwordLabel="New password" confirmLabel="Confirm new password" />
            {reset.error && <FieldError>{reset.error.message}</FieldError>}
            <AuthButton type="submit" disabled={reset.isPending}>
              {reset.isPending && <Spinner />}
              Reset password
            </AuthButton>
          </AuthFieldGroup>
        </form>
      </FormProvider>
      <p className="mt-5.5 text-center">
        <AuthLink href="/login">Back to sign in</AuthLink>
      </p>
    </>
  );
}
