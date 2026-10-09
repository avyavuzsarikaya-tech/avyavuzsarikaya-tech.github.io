import { createFileRoute } from "@tanstack/react-router";
import { NewsletterPage } from "@/components/members/pages";
import { memberPageHead } from "@/lib/site";

/** The newsletter page in English: /newsletter. The other languages are /tr/newsletter, /ar/newsletter, … */
export const Route = createFileRoute("/newsletter")({
  head: () => memberPageHead("en", "newsletter"),
  component: NewsletterPage,
});
