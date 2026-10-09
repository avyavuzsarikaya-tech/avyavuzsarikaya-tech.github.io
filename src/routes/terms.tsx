import { createFileRoute } from "@tanstack/react-router";
import { LegalPageView } from "@/components/legal";
import { legalHead } from "@/lib/site";

/** The terms page in English: /terms. Turkish: /tr/terms. */
export const Route = createFileRoute("/terms")({
  head: () => legalHead("en", "terms"),
  component: () => <LegalPageView page="terms" />,
});
