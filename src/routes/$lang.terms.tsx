import { createFileRoute, redirect } from "@tanstack/react-router";
import { LegalPageView } from "@/components/legal";
import { DEFAULT_LANG, isPrefixed } from "@/lib/lang-path";
import { legalHead } from "@/lib/site";

/** The terms page in Turkish: /tr/terms. */
export const Route = createFileRoute("/$lang/terms")({
  beforeLoad: ({ params }) => {
    if (params.lang === DEFAULT_LANG) throw redirect({ to: "/terms", replace: true });
    if (!isPrefixed(params.lang)) throw redirect({ to: "/", replace: true });
  },
  head: ({ params }) => (isPrefixed(params.lang) ? legalHead(params.lang, "terms") : {}),
  component: () => <LegalPageView page="terms" />,
});
