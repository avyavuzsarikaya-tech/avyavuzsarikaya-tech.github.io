import { createFileRoute } from "@tanstack/react-router";
import { MembershipPage } from "@/components/members/pages";
import { memberPageHead } from "@/lib/site";

/** The membership page in English: /membership. The other languages are /tr/membership, /ar/membership, … */
export const Route = createFileRoute("/membership")({
  head: () => memberPageHead("en", "membership"),
  component: MembershipPage,
});
