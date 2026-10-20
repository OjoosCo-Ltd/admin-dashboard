/** A currency and the locale that formats it. */
export interface CurrencyConfig {
  /** ISO 4217: "GBP". */
  code: string;
  /** The Intl locale its amounts are written in: "en-GB". */
  locale: string;
}

/**
 * ⚠️ PROVISIONAL: the currency of every billing figure (Subscriptions and
 * Payments). Their Figmas price in pounds ("£39.99 GBP"), while the dashboard,
 * Virtual Dates, Well-being and Settings show dollars. Fahd is to pick one for
 * the whole admin; switching is this line.
 */
export const BILLING_CURRENCY: CurrencyConfig = { code: "GBP", locale: "en-GB" };
