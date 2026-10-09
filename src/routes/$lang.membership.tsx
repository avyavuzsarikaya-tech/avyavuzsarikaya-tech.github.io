import { createFileRoute, redirect } from "@tanstack/react-router";
import { MembershipPage } from "@/components/members/pages";
import { DEFAULT_LANG, isPrefixed } from "@/lib/lang-path";
import { memberPageHead } from "@/lib/site";

/** The membership page in Turkish, Arabic, French or Spanish: /tr/membership, /ar/membership, … */
export const Route = createFileRoute("/$lang/membership")({
  beforeLoad: ({ params }) => {
    if (params.lang === DEFAULT_LANG) throw redirect({ to: "/membership", replace: true });
    if (!isPrefixed(params.lang)) throw redirect({ to: "/", replace: true });
  },
  head: ({ params }) => (isPrefixed(params.lang) ? memberPageHead(params.lang, "membership") : {}),
  component: MembershipPage,
});
