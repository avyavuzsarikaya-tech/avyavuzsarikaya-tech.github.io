import { createFileRoute } from "@tanstack/react-router";
import { VideoPage } from "@/components/videos";
import { videoHead } from "@/lib/site";
import { findVideo, loadVideo } from "@/lib/videos";

/** One video in English, with its transcript: /media/<id>. Other languages: /tr/media/<id>. */
export const Route = createFileRoute("/media_/$videoId")({
  loader: ({ params }) => loadVideo(params.videoId),
  head: ({ params }) => videoHead(findVideo(params.videoId), "en"),
  component: Page,
});

function Page() {
  return <VideoPage video={Route.useLoaderData()} />;
}
