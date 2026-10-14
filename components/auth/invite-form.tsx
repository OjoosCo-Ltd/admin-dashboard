"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

import { AuthHeader } from "@/components/auth/auth-card";
import {
  AuthButton,
  AuthFieldGroup,
  AuthInput,
  AuthLink,
  LockedInput,
} from "@/components/auth/auth-controls";
import { NewPasswordFields } from "@/components/auth/new-password-fields";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { newPasswordSchema } from "@/libs/validation/password";

const schema = z
  .object({
    fullName: z.string().trim().min(1, "Enter your full name"),
    password: newPasswordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type InviteValues = z.infer<typeof schema>;

export interface Invitation {
  fullName: string;
  email: string;
  /** Display name of the role the Super Admin assigned. */
  role: string;
}

/** An invited admin picks a password. Email and role are fixed by the invitation. */
export function InviteForm({ invitation }: { invitation: Invitation }) {
  const router = useRouter();
  const form = useForm<InviteValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: invitation.fullName, password: "", confirmPassword: "" },
  });

  // UI only: the account isn't activated yet. The invitation endpoint replaces this redirect.
  const onSubmit = form.handleSubmit(() => router.push("/login"));

  return (
    <>
      <AuthHeader
        eyebrow="Administrator invitation"
        title="Complete your admin account"
        description="You’ve been invited to join the Xparience administration team."
      />
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
              <FieldLabel htmlFor="email">Invited email</FieldLabel>
              <LockedInput
                id="email"
                type="email"
                value={invitation.email}
                autoComplete="username"
                aria-describedby="email-description"
              />
              <FieldDescription id="email-description" className="text-xs">
                This invitation is bound to this email address.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="role">Assigned role</FieldLabel>
              <LockedInput id="role" value={invitation.role} aria-describedby="role-description" />
              <FieldDescription id="role-description" className="text-xs">
                Assigned by your Super Admin · cannot be changed
              </FieldDescription>
            </Field>
            <NewPasswordFields passwordLabel="Create password" />
            <AuthButton type="submit">Activate account</AuthButton>
          </AuthFieldGroup>
        </form>
      </FormProvider>
      <p className="mt-5.5 text-center">
        <AuthLink href="/login">Already have an account? Sign in</AuthLink>
      </p>
    </>
  );
}
