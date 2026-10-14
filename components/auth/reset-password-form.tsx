"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

import { AuthHeader } from "@/components/auth/auth-card";
import { AuthButton, AuthFieldGroup, AuthLink } from "@/components/auth/auth-controls";
import { NewPasswordFields } from "@/components/auth/new-password-fields";
import { newPasswordSchema } from "@/libs/validation/password";

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
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  // UI only: the password isn't changed yet. The reset endpoint replaces this redirect.
  const onSubmit = form.handleSubmit(() => router.push("/reset-password/success"));

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
            <AuthButton type="submit">Reset password</AuthButton>
          </AuthFieldGroup>
        </form>
      </FormProvider>
      <p className="mt-5.5 text-center">
        <AuthLink href="/login">Back to sign in</AuthLink>
      </p>
    </>
  );
}
