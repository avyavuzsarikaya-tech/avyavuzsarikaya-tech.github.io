import { createFileRoute, redirect } from "@tanstack/react-router";
import { AboutPage } from "@/components/about";
import { DEFAULT_LANG, isPrefixed } from "@/lib/lang-path";
import { aboutHead } from "@/lib/site";

/** About Orbis in Turkish, Arabic, French or Spanish: /tr/about, /ar/about, … */
export const Route = createFileRoute("/$lang/about")({
  beforeLoad: ({ params }) => {
    if (params.lang === DEFAULT_LANG) throw redirect({ to: "/about", replace: true });
    if (!isPrefixed(params.lang)) throw redirect({ to: "/", replace: true });
  },
  head: ({ params }) => (isPrefixed(params.lang) ? aboutHead(params.lang) : {}),
  component: AboutPage,
});
