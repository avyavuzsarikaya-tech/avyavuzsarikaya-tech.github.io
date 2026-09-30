import { createFileRoute } from "@tanstack/react-router";
import { ReadingPage } from "@/components/reading";
import { findCard, loadStory } from "@/lib/seed";
import { storyHead } from "@/lib/site";

/** A reading in English. The other languages: /tr/read/<id>, /ar/read/<id>, … */
export const Route = createFileRoute("/read/$storyId")({
  // Only this reading's file is downloaded, not the whole library.
  loader: ({ params }) => loadStory(params.storyId),
  // Title, summary and link-preview tags come from the published file of the reading.
  head: ({ params }) => storyHead(findCard(params.storyId), "en"),
  component: Page,
});

function Page() {
  return <ReadingPage story={Route.useLoaderData()} />;
}
