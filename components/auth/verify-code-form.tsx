"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AuthHeader, AuthStatusIcon } from "@/components/auth/auth-card";
import { AuthButton, AuthFieldGroup, AuthInput, AuthLink } from "@/components/auth/auth-controls";
import { MailCheckIcon } from "@/components/auth/auth-icons";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useRequestPasswordReset, useVerifyPasswordResetOtp } from "@/hooks/api";
import { usePasswordResetStore } from "@/store/use-password-reset-store";

const schema = z.object({
  otpCode: z.string().regex(/^\d{6}$/, "Enter the 6-digit code from the email"),
});

type VerifyCodeValues = z.infer<typeof schema>;

/** The emailed reset code: checked here, then carried to the new-password screen. */
export function VerifyCodeForm() {
  const router = useRouter();
  const email = usePasswordResetStore((state) => state.email);
  const setOtpCode = usePasswordResetStore((state) => state.setOtpCode);
  const verify = useVerifyPasswordResetOtp();
  const resend = useRequestPasswordReset();
  const form = useForm<VerifyCodeValues>({
    resolver: zodResolver(schema),
    defaultValues: { otpCode: "" },
  });

  // Opened directly or after a reload: the email lives only in memory.
  if (!email) {
    return (
      <>
        <AuthStatusIcon>
          <MailCheckIcon />
        </AuthStatusIcon>
        <AuthHeader
          title="Start your reset again"
          description="This page needs the email you asked for a code with. Enter it again to get a new code."
        />
        <AuthButton asChild className="mt-6">
          <Link href="/forgot-password">Request a code</Link>
        </AuthButton>
      </>
    );
  }

  const onSubmit = form.handleSubmit(({ otpCode }) =>
    verify.mutate(
      { email, otpCode },
      {
        onSuccess: () => {
          setOtpCode(otpCode);
          router.push("/reset-password");
        },
      },
    ),
  );

  return (
    <>
      <AuthStatusIcon>
        <MailCheckIcon />
      </AuthStatusIcon>
      <AuthHeader
        title="Check your email"
        description={`If an account matches ${email}, we’ve sent it a 6-digit code. Enter it to choose a new password.`}
      />
      <form method="post" onSubmit={onSubmit} noValidate className="mt-5.5">
        <AuthFieldGroup>
          <Controller
            name="otpCode"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="otp-code">Reset code</FieldLabel>
                <AuthInput
                  {...field}
                  onChange={(event) => field.onChange(event.target.value.replace(/\D/g, ""))}
                  id="otp-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="123456"
                  aria-invalid={fieldState.invalid}
                  className="tracking-[0.3em]"
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          {verify.error && <FieldError>{verify.error.message}</FieldError>}
          <AuthButton type="submit" disabled={verify.isPending}>
            {verify.isPending && <Spinner />}
            Verify code
          </AuthButton>
        </AuthFieldGroup>
      </form>
      <p className="mt-5.5 flex items-center justify-center gap-1 text-[13px] text-muted-foreground">
        Didn’t get it?
        <Button
          type="button"
          variant="link"
          disabled={resend.isPending}
          onClick={() =>
            resend.mutate(
              { email },
              {
                onSuccess: () => toast.success("We sent a new code"),
                onError: (error) => toast.error(error.message),
              },
            )
          }
          className="h-auto p-0 text-[13px]"
        >
          Send a new code
        </Button>
      </p>
      <p className="mt-3 text-center">
        <AuthLink href="/login">Back to sign in</AuthLink>
      </p>
    </>
  );
}
