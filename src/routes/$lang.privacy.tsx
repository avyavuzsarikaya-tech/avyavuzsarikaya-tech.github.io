import { createFileRoute, redirect } from "@tanstack/react-router";
import { LegalPageView } from "@/components/legal";
import { DEFAULT_LANG, isPrefixed } from "@/lib/lang-path";
import { legalHead } from "@/lib/site";

/** The privacy page in Turkish: /tr/privacy. */
export const Route = createFileRoute("/$lang/privacy")({
  beforeLoad: ({ params }) => {
    if (params.lang === DEFAULT_LANG) throw redirect({ to: "/privacy", replace: true });
    if (!isPrefixed(params.lang)) throw redirect({ to: "/", replace: true });
  },
  head: ({ params }) => (isPrefixed(params.lang) ? legalHead(params.lang, "privacy") : {}),
  component: () => <LegalPageView page="privacy" />,
});
