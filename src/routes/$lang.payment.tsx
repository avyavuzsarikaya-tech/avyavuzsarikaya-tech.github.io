import { createFileRoute, redirect } from "@tanstack/react-router";
import { PaymentPage } from "@/components/members/pages";
import { DEFAULT_LANG, isPrefixed } from "@/lib/lang-path";
import { memberPageHead } from "@/lib/site";

/** The payment page in Turkish, Arabic, French or Spanish: /tr/payment, /ar/payment, … */
export const Route = createFileRoute("/$lang/payment")({
  beforeLoad: ({ params }) => {
    if (params.lang === DEFAULT_LANG) throw redirect({ to: "/payment", replace: true });
    if (!isPrefixed(params.lang)) throw redirect({ to: "/", replace: true });
  },
  head: ({ params }) => (isPrefixed(params.lang) ? memberPageHead(params.lang, "payment") : {}),
  component: PaymentPage,
});
