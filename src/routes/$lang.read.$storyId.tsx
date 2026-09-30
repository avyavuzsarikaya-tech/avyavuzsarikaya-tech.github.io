import { createFileRoute, redirect } from "@tanstack/react-router";
import { ReadingPage } from "@/components/reading";
import { DEFAULT_LANG, isPrefixed } from "@/lib/lang-path";
import { findCard, loadStory } from "@/lib/seed";
import { storyHead } from "@/lib/site";

/** A reading in Turkish, Arabic, French or Spanish: /tr/read/<id>, … */
export const Route = createFileRoute("/$lang/read/$storyId")({
  beforeLoad: ({ params }) => {
    if (params.lang === DEFAULT_LANG) {
      throw redirect({ to: "/read/$storyId", params: { storyId: params.storyId }, replace: true });
    }
    if (!isPrefixed(params.lang)) throw redirect({ to: "/", replace: true });
  },
  loader: ({ params }) => loadStory(params.storyId),
  head: ({ params }) =>
    isPrefixed(params.lang) ? storyHead(findCard(params.storyId), params.lang) : {},
  component: Page,
});

function Page() {
  return <ReadingPage story={Route.useLoaderData()} />;
}
