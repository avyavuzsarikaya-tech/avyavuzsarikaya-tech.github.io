import { createFileRoute } from "@tanstack/react-router";
import { VideoListPage } from "@/components/videos";
import { mediaHead } from "@/lib/site";

/** Every video in English: /media. The other languages are /tr/media, … */
export const Route = createFileRoute("/media")({
  head: () => mediaHead("en"),
  component: VideoListPage,
});
