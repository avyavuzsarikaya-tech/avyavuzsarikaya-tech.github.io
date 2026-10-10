import { createFileRoute, redirect } from "@tanstack/react-router";
import { VideoListPage } from "@/components/videos";
import { DEFAULT_LANG, isPrefixed } from "@/lib/lang-path";
import { mediaHead } from "@/lib/site";

/** Every video in Turkish (and the other prefixed languages): /tr/media. */
export const Route = createFileRoute("/$lang/media")({
  beforeLoad: ({ params }) => {
    if (params.lang === DEFAULT_LANG) throw redirect({ to: "/media", replace: true });
    if (!isPrefixed(params.lang)) throw redirect({ to: "/", replace: true });
  },
  head: ({ params }) => (isPrefixed(params.lang) ? mediaHead(params.lang) : {}),
  component: VideoListPage,
});
