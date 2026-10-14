import { CheckCircleIcon, CircleIcon } from "@phosphor-icons/react/ssr";
import { cn } from "cn";

import {
  getPasswordStrength,
  PASSWORD_RULES,
  type PasswordStrength as Strength,
} from "@/libs/validation/password";

// Only "Fair" is in the Figma; the other levels follow the same pattern.
const LEVELS: Record<Strength, { label: string; bar: string; text: string }> = {
  weak: { label: "Weak", bar: "w-1/4 bg-destructive", text: "text-destructive" },
  fair: { label: "Fair", bar: "w-1/2 bg-warning", text: "text-warning" },
  good: { label: "Good", bar: "w-3/4 bg-success", text: "text-success" },
  strong: { label: "Strong", bar: "w-full bg-success", text: "text-success" },
};

/** Strength bar and requirement checklist under a new-password field. */
export function PasswordStrength({ password, id }: { password: string; id?: string }) {
  const strength = getPasswordStrength(password);
  const level = strength ? LEVELS[strength] : null;

  return (
    <div id={id}>
      {/*
        The meter only shows once the field has a value. It collapses rather
        than unmounting so the aria-live region exists before its text
        changes, and the 0fr → 1fr grid row animates the height.
      */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none",
          level ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-border">
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-300",
                level ? level.bar : "w-0",
              )}
            />
          </div>
          <p aria-live="polite" className={cn("mt-2.5 mb-3 text-xs leading-4", level?.text)}>
            {level && `Password strength: ${level.label}`}
          </p>
        </div>
      </div>
      <ul className="mt-3 flex flex-col gap-1.5 text-xs leading-4 text-muted-foreground">
        {PASSWORD_RULES.map((rule) => {
          const met = rule.test(password);
          return (
            <li key={rule.id} className={cn("flex items-center gap-1", met && "text-foreground")}>
              {met ? (
                <CheckCircleIcon
                  aria-hidden
                  weight="fill"
                  className="size-3.5 shrink-0 text-success"
                />
              ) : (
                <CircleIcon aria-hidden weight="bold" className="size-3 shrink-0" />
              )}
              {rule.label}
              <span className="sr-only">{met ? " (met)" : " (not met)"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
