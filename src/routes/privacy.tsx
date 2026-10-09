import { createFileRoute } from "@tanstack/react-router";
import { LegalPageView } from "@/components/legal";
import { legalHead } from "@/lib/site";

/** The privacy page in English: /privacy. Turkish: /tr/privacy. */
export const Route = createFileRoute("/privacy")({
  head: () => legalHead("en", "privacy"),
  component: () => <LegalPageView page="privacy" />,
});
