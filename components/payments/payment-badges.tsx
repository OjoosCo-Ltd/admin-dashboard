import type { Icon } from "@phosphor-icons/react";
import { BankIcon, CreditCardIcon, DeviceMobileIcon, WalletIcon } from "@phosphor-icons/react/ssr";
import { cn } from "cn";

import { PLAN_NAMES } from "@/components/subscriptions/subscription-format";
import type {
  PaymentMethod,
  PaymentMethodKind,
  PaymentStatus,
  Transaction,
} from "@/types/payments";
import type { BillingCycle } from "@/types/subscriptions";

// The Figma's status colors, spelled out: Tailwind's green, red, purple and
// amber are each a shade off. Successful is the sheet frame's green (the table
// frame's is too faint), and Pending's amber is deepened, so every label
// reads at 11px (4.5:1).
const STATUSES: Record<PaymentStatus, { label: string; pill: string }> = {
  successful: {
    label: "Successful",
    pill: "bg-[#e6f4ea] text-[#137333] dark:bg-[#26ad60]/15 dark:text-[#5fd394]",
  },
  failed: {
    label: "Failed",
    pill: "bg-[#fdeceb] text-[#c03a2b] dark:bg-[#c03a2b]/20 dark:text-[#f08a80]",
  },
  refunded: {
    label: "Refunded",
    pill: "bg-[#f5eef8] text-[#8d44ac] dark:bg-[#8d44ac]/20 dark:text-[#d2a6e6]",
  },
  pending: {
    label: "Pending",
    pill: "bg-[#fef9e7] text-[#a15f00] dark:bg-[#f39c13]/15 dark:text-[#f7bf63]",
  },
};

export const STATUS_LABELS: Record<PaymentStatus, string> = {
  successful: STATUSES.successful.label,
  failed: STATUSES.failed.label,
  refunded: STATUSES.refunded.label,
  pending: STATUSES.pending.label,
};

/** "Successful", "Failed", "Refunded" or "Pending" in its color: the 11px pill both payments frames draw. */
export function PaymentStatusBadge({
  status,
  className,
}: {
  status: PaymentStatus;
  className?: string;
}) {
  const look = STATUSES[status];
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[11px]/4.25 font-medium whitespace-nowrap",
        look.pill,
        className,
      )}
    >
      {look.label}
    </span>
  );
}

/** Each method's glyph, as the Figma draws them: a card, a wallet, a phone and a bank. */
export const METHOD_ICONS: Record<PaymentMethodKind, Icon> = {
  card: CreditCardIcon,
  paypal: WalletIcon,
  "apple-pay": DeviceMobileIcon,
  "bank-transfer": BankIcon,
};

export const METHOD_LABELS: Record<PaymentMethodKind, string> = {
  card: "Card",
  paypal: "PayPal",
  "apple-pay": "Apple Pay",
  "bank-transfer": "Bank Transfer",
};

/** "Visa •••• 4242" for a card in the table; "Visa ****4242" in the sheet; the method's name otherwise. */
export function methodText(method: PaymentMethod, style: "table" | "sheet" = "table") {
  if (method.kind !== "card" || !method.last4) return method.label;
  return style === "table"
    ? `${method.shortLabel ?? method.label} •••• ${method.last4}`
    : `${method.label} ****${method.last4}`;
}

/** The payments frames call a yearly cycle "Annual", where Subscriptions says "Yearly". */
export const CYCLE_NAMES: Record<BillingCycle, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
};

/** "Premium Sub (Annual)" in the table; the sheet lists the plan and its cycle apart. */
export const productLabel = (transaction: Pick<Transaction, "plan" | "cycle">) =>
  `${PLAN_NAMES[transaction.plan]} Sub (${CYCLE_NAMES[transaction.cycle]})`;

export const TRANSACTION_KINDS: Record<Transaction["kind"], string> = {
  "new-subscription": "New Subscription",
  renewal: "Subscription Renewal",
  upgrade: "Plan Upgrade",
};
