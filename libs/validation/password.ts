import { z } from "zod";

/**
 * New-password requirements, in the order the checklist under the field shows
 * them. ⚠️ PROVISIONAL: copied from the admin Figma; confirm against the
 * backend's password rules when the setup and reset flows are wired.
 */
export const PASSWORD_RULES = [
  {
    id: "length",
    label: "At least 12 characters",
    test: (value: string) => value.length >= 12,
  },
  {
    id: "case",
    label: "Uppercase and lowercase letters",
    test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value),
  },
  {
    id: "number-symbol",
    label: "At least one number and one symbol",
    test: (value: string) => /\d/.test(value) && /[^A-Za-z0-9]/.test(value),
  },
] as const;

export type PasswordStrength = "weak" | "fair" | "good" | "strong";

/** null while the field is empty. Meeting every rule is "good"; 16+ characters makes it "strong". */
export function getPasswordStrength(password: string): PasswordStrength | null {
  if (!password) return null;
  const passed = PASSWORD_RULES.filter((rule) => rule.test(password)).length;
  if (passed === PASSWORD_RULES.length) return password.length >= 16 ? "strong" : "good";
  return passed === PASSWORD_RULES.length - 1 ? "fair" : "weak";
}

export const newPasswordSchema = z
  .string()
  .min(1, "Enter a password")
  .refine(
    (value) => PASSWORD_RULES.every((rule) => rule.test(value)),
    "Use a password that meets every requirement below",
  );
