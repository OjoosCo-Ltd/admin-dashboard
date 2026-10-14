"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

import { AuthHeader, AuthNotice } from "@/components/auth/auth-card";
import {
  AuthButton,
  AuthCheckbox,
  AuthFieldGroup,
  AuthInput,
  AuthLink,
  LockedInput,
} from "@/components/auth/auth-controls";
import { NewPasswordFields } from "@/components/auth/new-password-fields";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { ADMIN_ACCESS_POLICY_URL, PRIVACY_POLICY_URL } from "@/constants/links";
import { newPasswordSchema } from "@/libs/validation/password";

const schema = z
  .object({
    fullName: z.string().trim().min(1, "Enter your full name"),
    password: newPasswordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
    acceptPolicies: z
      .boolean()
      .refine((accepted) => accepted, "Accept the administrator access policies to continue"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SetupValues = z.infer<typeof schema>;

/** First-run creation of the primary Super Admin. `email` comes from the setup link. */
export function SetupForm({ email }: { email: string }) {
  const router = useRouter();
  const form = useForm<SetupValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", password: "", confirmPassword: "", acceptPolicies: false },
  });

  // UI only: no account is created yet. The setup endpoint replaces this redirect.
  const onSubmit = form.handleSubmit(() => router.push("/login"));

  return (
    <>
      <AuthHeader
        title="Set up your administrator account"
        description="Create the primary administrator account to initialize your Xparience administration workspace."
      />
      <AuthNotice title="Restricted initial setup" className="mt-5">
        Authorized, single-use and time-limited access. This creates the primary Super Admin; the
        role is fixed.
      </AuthNotice>
      <FormProvider {...form}>
        <form method="post" onSubmit={onSubmit} noValidate className="mt-5.5">
          <AuthFieldGroup>
            <Controller
              name="fullName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="full-name">Full name</FieldLabel>
                  <AuthInput
                    {...field}
                    id="full-name"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Field>
              <FieldLabel htmlFor="email">Work email</FieldLabel>
              {/* autoComplete="username" lets password managers file the new password under it. */}
              <LockedInput
                id="email"
                type="email"
                value={email}
                autoComplete="username"
                aria-describedby="email-description"
              />
              <FieldDescription id="email-description" className="text-xs">
                Verified work email · cannot be changed
              </FieldDescription>
            </Field>
            <NewPasswordFields />
            {/* The Figma sets the consent row and its links closer together than the fields. */}
            <div className="flex flex-col gap-3">
              <Controller
                name="acceptPolicies"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <div className="flex items-center gap-2.5">
                      <AuthCheckbox
                        id="accept-policies"
                        name={field.name}
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        required
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldLabel htmlFor="accept-policies" className="font-normal">
                        I accept the administrator access policies. *
                      </FieldLabel>
                    </div>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <p className="text-center text-sm font-semibold text-primary">
                <AuthLink href={ADMIN_ACCESS_POLICY_URL} target="_blank" rel="noreferrer">
                  Administrator access policies
                </AuthLink>
                {" · "}
                <AuthLink href={PRIVACY_POLICY_URL} target="_blank" rel="noreferrer">
                  Privacy policy
                </AuthLink>
              </p>
            </div>
            <AuthButton type="submit">Create Super Admin account</AuthButton>
          </AuthFieldGroup>
        </form>
      </FormProvider>
      <p className="mt-5.5 text-center">
        <AuthLink href="/login">Already set up? Sign in</AuthLink>
      </p>
    </>
  );
}
