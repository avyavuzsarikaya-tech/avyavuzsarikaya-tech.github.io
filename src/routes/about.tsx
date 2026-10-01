import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/components/about";
import { aboutHead } from "@/lib/site";

/** About Orbis in English: /about. The other languages are /tr/about, /ar/about, … */
export const Route = createFileRoute("/about")({
  head: () => aboutHead("en"),
  component: AboutPage,
});
