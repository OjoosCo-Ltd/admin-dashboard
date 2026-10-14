"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { AuthHeader, AuthNotice } from "@/components/auth/auth-card";
import {
  AuthButton,
  AuthCheckbox,
  AuthFieldGroup,
  AuthInput,
  AuthLink,
} from "@/components/auth/auth-controls";
import { ShieldCheckOutlineIcon } from "@/components/auth/auth-icons";
import { PasswordInput } from "@/components/auth/password-input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useLogin } from "@/hooks/api";

const schema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
  remember: z.boolean(),
});

type LoginValues = z.infer<typeof schema>;

export function LoginForm({ next, expired }: { next: string; expired: boolean }) {
  const router = useRouter();
  const login = useLogin();
  const form = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: false },
  });

  // `remember` is UI only for now: the session cookies last as long either way.
  const onSubmit = form.handleSubmit(({ email, password }) =>
    login.mutate({ email, password }, { onSuccess: () => router.replace(next) }),
  );

  return (
    <>
      <AuthHeader
        title="Welcome back"
        description="Sign in to access your administration workspace."
      />
      {expired && (
        <AuthNotice title="Your session expired" className="mt-6">
          Sign in again to continue where you left off.
        </AuthNotice>
      )}
      <form method="post" onSubmit={onSubmit} noValidate className="mt-6">
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
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <PasswordInput
                  {...field}
                  id="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <div className="flex items-center justify-between gap-4 py-1">
            <Controller
              name="remember"
              control={form.control}
              render={({ field }) => (
                <Field orientation="horizontal" className="w-auto gap-3">
                  <AuthCheckbox
                    id="remember"
                    name={field.name}
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                  <FieldLabel htmlFor="remember" className="font-normal">
                    Remember me
                  </FieldLabel>
                </Field>
              )}
            />
            <AuthLink href="/forgot-password">Forgot password?</AuthLink>
          </div>
          {login.error && <FieldError>{login.error.message}</FieldError>}
          <AuthButton type="submit" disabled={login.isPending}>
            {login.isPending && <Spinner />}
            Sign in
          </AuthButton>
        </AuthFieldGroup>
      </form>
      <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheckOutlineIcon className="size-4 shrink-0" />
        Secure access for authorized administrators only.
      </p>
    </>
  );
}
