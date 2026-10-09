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
  /** Turkish pages show lira; every other language shows dollars. */
  prices: Record<"TRY" | "USD", { monthly: number; yearly: number }>;
  checkoutUrl: string;
} = {
  prices: {
    TRY: { monthly: 49, yearly: 490 },
    USD: { monthly: 1, yearly: 10 },
  },
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

/** The currency of a language's pages. */
export function currencyFor(lang: Lang): "TRY" | "USD" {
  return lang === "tr" ? "TRY" : "USD";
}

/** A period's price as the reader's language writes it: ₺49, $1, 1 $, … */
export function price(period: Period, lang: Lang): string {
  const currency = currencyFor(lang);
  return new Intl.NumberFormat(LOCALE[lang], {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(PAYMENT.prices[currency][period]);
}

export function isPeriod(value: unknown): value is Period {
  return value === "monthly" || value === "yearly";
}
