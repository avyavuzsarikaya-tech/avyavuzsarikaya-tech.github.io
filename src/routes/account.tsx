import { createFileRoute } from "@tanstack/react-router";
import { AccountPage } from "@/components/members/account";
import { membersCopy } from "@/lib/members/copy";
import { SITE_NAME } from "@/lib/site";

/** The member's account in English: /account. The other languages: /tr/account, … */
export const Route = createFileRoute("/account")({
  validateSearch: (search: Record<string, unknown>): { back?: string } =>
    typeof search.back === "string" ? { back: search.back } : {},
  head: () => ({
    meta: [
      { title: `${membersCopy("en").account} — ${SITE_NAME}` },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AccountPage,
});
