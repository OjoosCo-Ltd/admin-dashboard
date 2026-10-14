"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";

import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrength } from "@/components/auth/password-strength";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

interface NewPasswordValues {
  password: string;
  confirmPassword: string;
}

/**
 * Password (with strength meter) and confirmation, shared by setup,
 * invitation and reset. Render inside a FormProvider whose values include
 * `password` and `confirmPassword`.
 */
export function NewPasswordFields({
  passwordLabel = "Password",
  confirmLabel = "Confirm password",
}: {
  passwordLabel?: string;
  confirmLabel?: string;
}) {
  const { control } = useFormContext<NewPasswordValues>();
  // useWatch rather than form.watch(): watch() isn't React Compiler safe.
  const password = useWatch({ control, name: "password" });

  return (
    <>
      <Controller
        name="password"
        control={control}
        // The match check lives on confirmPassword; re-run it when this field changes.
        rules={{ deps: ["confirmPassword"] }}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="password">{passwordLabel}</FieldLabel>
            <PasswordInput
              {...field}
              id="password"
              autoComplete="new-password"
              placeholder="Enter password"
              aria-invalid={fieldState.invalid}
              aria-describedby="password-requirements"
            />
            <FieldError errors={[fieldState.error]} />
            <PasswordStrength id="password-requirements" password={password} />
          </Field>
        )}
      />
      <Controller
        name="confirmPassword"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="confirm-password">{confirmLabel}</FieldLabel>
            <PasswordInput
              {...field}
              id="confirm-password"
              autoComplete="new-password"
              placeholder="Enter password"
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
    </>
  );
}
