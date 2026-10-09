import { createFileRoute } from "@tanstack/react-router";
import { PaymentPage } from "@/components/members/pages";
import { memberPageHead } from "@/lib/site";

/** The payment page in English: /payment. The other languages are /tr/payment, /ar/payment, … */
export const Route = createFileRoute("/payment")({
  head: () => memberPageHead("en", "payment"),
  component: PaymentPage,
});
