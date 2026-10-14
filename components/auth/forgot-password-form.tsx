"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { AuthHeader } from "@/components/auth/auth-card";
import { AuthButton, AuthFieldGroup, AuthInput, AuthLink } from "@/components/auth/auth-controls";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

const schema = z.object({
  email: z.email("Enter a valid email"),
});

type ForgotPasswordValues = z.infer<typeof schema>;

// Placeholder: the Figma has no frame for this step yet, so it reuses the
// pieces of the other recovery screens. Replace it when the design lands.
export function ForgotPasswordForm() {
  const router = useRouter();
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  // UI only: no email is sent yet. The forgot-password endpoint replaces this redirect.
  const onSubmit = form.handleSubmit(() => router.push("/forgot-password/check-email"));

  return (
    <>
      <AuthHeader
        title="Forgot your password?"
        description="Enter the email address of your administrator account and we’ll send you a link to reset your password."
      />
      <form method="post" onSubmit={onSubmit} noValidate className="mt-5.5">
        <AuthFieldGroup>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email">Email address</FieldLabel>
                <AuthInput
                  {...field}
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <AuthButton type="submit">Send reset link</AuthButton>
        </AuthFieldGroup>
      </form>
      <p className="mt-5.5 text-center">
        <AuthLink href="/login">Back to sign in</AuthLink>
      </p>
    </>
  );
}
