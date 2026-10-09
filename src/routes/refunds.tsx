import { createFileRoute } from "@tanstack/react-router";
import { LegalPageView } from "@/components/legal";
import { legalHead } from "@/lib/site";

/** The refunds page in English: /refunds. Turkish: /tr/refunds. */
export const Route = createFileRoute("/refunds")({
  head: () => legalHead("en", "refunds"),
  component: () => <LegalPageView page="refunds" />,
});
