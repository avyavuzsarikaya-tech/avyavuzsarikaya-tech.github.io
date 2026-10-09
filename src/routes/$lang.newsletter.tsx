import { createFileRoute, redirect } from "@tanstack/react-router";
import { NewsletterPage } from "@/components/members/pages";
import { DEFAULT_LANG, isPrefixed } from "@/lib/lang-path";
import { memberPageHead } from "@/lib/site";

/** The newsletter page in Turkish, Arabic, French or Spanish: /tr/newsletter, /ar/newsletter, … */
export const Route = createFileRoute("/$lang/newsletter")({
  beforeLoad: ({ params }) => {
    if (params.lang === DEFAULT_LANG) throw redirect({ to: "/newsletter", replace: true });
    if (!isPrefixed(params.lang)) throw redirect({ to: "/", replace: true });
  },
  head: ({ params }) => (isPrefixed(params.lang) ? memberPageHead(params.lang, "newsletter") : {}),
  component: NewsletterPage,
});
