import { createFileRoute, redirect } from "@tanstack/react-router";
import { VideoPage } from "@/components/videos";
import { DEFAULT_LANG, isPrefixed } from "@/lib/lang-path";
import { videoHead } from "@/lib/site";
import { findVideo, loadVideo } from "@/lib/videos";

/** One video in Turkish (and the other prefixed languages): /tr/media/<id>. */
export const Route = createFileRoute("/$lang/media_/$videoId")({
  beforeLoad: ({ params }) => {
    if (params.lang === DEFAULT_LANG) {
      throw redirect({ to: "/media/$videoId", params: { videoId: params.videoId }, replace: true });
    }
    if (!isPrefixed(params.lang)) throw redirect({ to: "/", replace: true });
  },
  loader: ({ params }) => loadVideo(params.videoId),
  head: ({ params }) =>
    isPrefixed(params.lang) ? videoHead(findVideo(params.videoId), params.lang) : {},
  component: Page,
});

function Page() {
  return <VideoPage video={Route.useLoaderData()} />;
}
