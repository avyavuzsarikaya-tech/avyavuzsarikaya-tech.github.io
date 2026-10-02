import { createFileRoute, redirect } from "@tanstack/react-router";
import { SearchPage } from "@/components/search";
import { DEFAULT_LANG, isPrefixed } from "@/lib/lang-path";
import { searchHead } from "@/lib/site";

/** Search in Turkish, Arabic, French or Spanish: /tr/search, /ar/search, … */
export const Route = createFileRoute("/$lang/search")({
  beforeLoad: ({ params }) => {
    if (params.lang === DEFAULT_LANG) throw redirect({ to: "/search", replace: true });
    if (!isPrefixed(params.lang)) throw redirect({ to: "/", replace: true });
  },
  head: ({ params }) => (isPrefixed(params.lang) ? searchHead(params.lang) : {}),
  component: SearchPage,
});
