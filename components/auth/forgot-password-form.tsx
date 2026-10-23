"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { AuthHeader } from "@/components/auth/auth-card";
import { AuthButton, AuthFieldGroup, AuthInput, AuthLink } from "@/components/auth/auth-controls";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useRequestPasswordReset } from "@/hooks/api";
import { usePasswordResetStore } from "@/store/use-password-reset-store";

const schema = z.object({
  email: z.email("Enter a valid email"),
});

type ForgotPasswordValues = z.infer<typeof schema>;

// Placeholder: the Figma has no frame for this step yet, so it reuses the
// pieces of the other recovery screens. Replace it when the design lands.
export function ForgotPasswordForm() {
  const router = useRouter();
  const setEmail = usePasswordResetStore((state) => state.setEmail);
  const request = useRequestPasswordReset();
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(({ email }) =>
    request.mutate(
      { email },
      {
        onSuccess: () => {
          setEmail(email);
          router.push("/forgot-password/check-email");
        },
      },
    ),
  );

  return (
    <>
      <AuthHeader
        title="Forgot your password?"
        description="Enter the email address of your administrator account and we’ll email you a 6-digit code to reset your password."
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
          {request.error && <FieldError>{request.error.message}</FieldError>}
          <AuthButton type="submit" disabled={request.isPending}>
            {request.isPending && <Spinner />}
            Send code
          </AuthButton>
        </AuthFieldGroup>
      </form>
      <p className="mt-5.5 text-center">
        <AuthLink href="/login">Back to sign in</AuthLink>
      </p>
    </>
  );
}
