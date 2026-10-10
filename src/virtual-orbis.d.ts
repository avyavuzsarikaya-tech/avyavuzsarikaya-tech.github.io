declare module "virtual:orbis-index" {
  import type { StoryCard } from "@/lib/types";
  const index: StoryCard[];
  export default index;
}

declare module "virtual:orbis-videos" {
  import type { VideoCard } from "@/lib/types";
  const index: VideoCard[];
  export default index;
}
