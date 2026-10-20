import { BILLING_CURRENCY, type CurrencyConfig } from "@/constants/billing";

// One Intl formatter per currency and precision, built on first use.
const formatters = new Map<string, Intl.NumberFormat>();

function formatter(currency: CurrencyConfig, fractionDigits?: number) {
  const key = `${currency.locale}:${currency.code}:${fractionDigits ?? "auto"}`;
  let cached = formatters.get(key);
  if (!cached) {
    cached = new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      ...(fractionDigits === undefined
        ? {}
        : { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }),
    });
    formatters.set(key, cached);
  }
  return cached;
}

/** "£39.99", "£0.00": pence always shown. */
export const formatMoney = (amount: number, currency = BILLING_CURRENCY) =>
  formatter(currency, 2).format(amount);

/** "£42,571": rounded to whole pounds. */
export const formatWholeMoney = (amount: number, currency = BILLING_CURRENCY) =>
  formatter(currency, 0).format(amount);

/** A price as a plan card shows it: "£0", "£14.99". */
export const formatPrice = (amount: number, currency = BILLING_CURRENCY) =>
  Number.isInteger(amount) ? formatWholeMoney(amount, currency) : formatMoney(amount, currency);

/** The currency's symbol: "£". */
export const currencySymbol = (currency = BILLING_CURRENCY) =>
  formatter(currency)
    .formatToParts(0)
    .find((part) => part.type === "currency")?.value ?? currency.code;

const COMPACT_UNITS = [
  { divisor: 1_000_000, suffix: "m" },
  { divisor: 1_000, suffix: "k" },
  { divisor: 1, suffix: "" },
] as const;

/**
 * "£842.5k", "£82.4k", "£100k", "£1.2m", "£840": one decimal, dropped when
 * it's zero, as the Figmas write them. Spelled out by hand: Node's and the
 * browser's Intl compact notation disagree on the case of "k", which breaks
 * hydration.
 */
export function formatCompactMoney(amount: number, currency = BILLING_CURRENCY) {
  const value = Math.abs(amount);
  const round = (index: number) => {
    const { divisor, suffix } = COMPACT_UNITS[index];
    return Number((value / divisor).toFixed(suffix ? 1 : 0));
  };
  let index = COMPACT_UNITS.findIndex(({ divisor }) => value >= divisor);
  if (index === -1) index = COMPACT_UNITS.length - 1;
  let rounded = round(index);
  // Rounding can carry into the next unit: 999,950 reads "£1m", not "£1000k".
  if (rounded >= 1000 && index > 0) {
    index -= 1;
    rounded = round(index);
  }
  // A negative that rounds to nothing reads "£0", not "-£0".
  const sign = amount < 0 && rounded > 0 ? "-" : "";
  return `${sign}${currencySymbol(currency)}${rounded}${COMPACT_UNITS[index].suffix}`;
}
