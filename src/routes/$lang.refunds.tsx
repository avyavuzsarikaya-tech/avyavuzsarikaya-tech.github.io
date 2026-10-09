import { createFileRoute, redirect } from "@tanstack/react-router";
import { LegalPageView } from "@/components/legal";
import { DEFAULT_LANG, isPrefixed } from "@/lib/lang-path";
import { legalHead } from "@/lib/site";

/** The refunds page in Turkish: /tr/refunds. */
export const Route = createFileRoute("/$lang/refunds")({
  beforeLoad: ({ params }) => {
    if (params.lang === DEFAULT_LANG) throw redirect({ to: "/refunds", replace: true });
    if (!isPrefixed(params.lang)) throw redirect({ to: "/", replace: true });
  },
  head: ({ params }) => (isPrefixed(params.lang) ? legalHead(params.lang, "refunds") : {}),
  component: () => <LegalPageView page="refunds" />,
});
