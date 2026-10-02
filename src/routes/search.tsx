import { createFileRoute } from "@tanstack/react-router";
import { SearchPage } from "@/components/search";
import { searchHead } from "@/lib/site";

/** Search in English: /search?q=… The other languages are /tr/search, /ar/search, … */
export const Route = createFileRoute("/search")({
  head: () => searchHead("en"),
  component: SearchPage,
});
