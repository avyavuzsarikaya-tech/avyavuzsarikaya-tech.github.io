import type { Lang } from "../types.ts";

/**
 * Paid membership: the two periods and their prices, in one place.
 *
 * `checkoutUrl` stays empty until the payment provider (Paddle) approves the site. While it
 * is empty the payment page shows the plans and the total, and its button waits with a
 * short note. Once filled, the button opens the provider's checkout with `?plan=monthly`
 * or `?plan=yearly` added.
 */
export const PAYMENT: {
  currency: string;
  monthly: number;
  yearly: number;
  checkoutUrl: string;
} = {
  currency: "TRY",
  monthly: 49,
  yearly: 490,
  checkoutUrl: "",
};

export type Period = "monthly" | "yearly";

export const paymentOn: boolean = PAYMENT.checkoutUrl.startsWith("https://");

const LOCALE: Record<Lang, string> = {
  tr: "tr-TR",
  ar: "ar",
  en: "en-GB",
  fr: "fr-FR",
  es: "es-ES",
};

/** A price as the reader's language writes it: ₺49, 49 ₺, … */
export function price(amount: number, lang: Lang): string {
  return new Intl.NumberFormat(LOCALE[lang], {
    style: "currency",
    currency: PAYMENT.currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function isPeriod(value: unknown): value is Period {
  return value === "monthly" || value === "yearly";
}
