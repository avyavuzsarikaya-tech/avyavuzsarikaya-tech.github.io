import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { readVideos } from "./video-index.mjs";

/**
 * Static search index: one JSON file per language with the full plain text of every
 * published reading — title, summary and body. The page loads only its own language's
 * file and searches it in the browser; no server is involved. All five indexes live
 * under assets/search/<lang>.json, so the existing assets publication includes them.
 */

const LANGS = ["en", "tr"];

/**
 * Body text as the reader sees it: links and images reduced to their words, source
 * markers like [1] and formatting marks removed, paragraphs joined, whitespace
 * collapsed to single spaces.
 */
function plain(body) {
  return body
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1") // [text](address) and ![alt](address) → text
    .replace(/\s*\[\d+\]/g, "") // source markers
    .replace(/[*_`~]/g, "") // emphasis marks
    .replace(/^\s{0,3}#{1,6}\s+/gm, "") // heading marks
    .replace(/^\s*>\s?/gm, "") // quote marks
    .replace(/\s+/g, " ")
    .trim();
}

/** Shared by static builds and the local preview endpoint. */
export function readSearchIndex(storiesDir, lang) {
  const stories = readdirSync(storiesDir)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .flatMap((file) => {
      const story = JSON.parse(readFileSync(join(storiesDir, file), "utf8"));
      // Drafts never enter public output — same rule as the page index and the feeds.
      if (story.status === "draft") return [];
      return [{ ...story, id: story.id || file.slice(0, -5) }];
    })
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));

  return stories.flatMap((story) => {
    const copy = story.locales?.[lang] ?? {};
    const body = plain(copy.body ?? "");
    // A reading without text in this language is not in this language's index.
    if (!body) return [];
    return [
      {
        id: story.id,
        theme: story.theme,
        date: story.date,
        title: copy.title ?? "",
        dek: copy.dek ?? "",
        region: copy.region ?? "",
        body,
      },
    ];
  });
}

/**
 * Videos are searched like readings: their title, one sentence and the full transcript.
 * Their records carry `kind: "video"` and the id `video:<id>`, so a video and a reading
 * with the same name never mix.
 */
export function readVideoSearchIndex(videosDir, lang) {
  return readVideos(videosDir).flatMap((video) => {
    const copy = video.locales?.[lang];
    const body = plain(copy?.transcript ?? "");
    if (!copy?.title?.trim() || !body) return [];
    return [
      {
        id: `video:${video.id}`,
        kind: "video",
        date: video.date,
        title: copy.title.trim(),
        dek: (copy.dek ?? "").trim(),
        body,
      },
    ];
  });
}

/** content/videos sits beside content/stories. */
export function videosDirFor(storiesDir) {
  return join(dirname(storiesDir), "videos");
}

export function writeSearchIndex(outDir, storiesDir = "content/stories", videosDir = videosDirFor(storiesDir)) {
  const dir = join(outDir, "assets", "search");
  mkdirSync(dir, { recursive: true });
  for (const lang of LANGS) {
    const records = readSearchIndex(storiesDir, lang);
    const videos = readVideoSearchIndex(videosDir, lang);
    writeFileSync(join(dir, `${lang}.json`), `${JSON.stringify([...records, ...videos], null, 2)}\n`);
    console.log(`[search] ${records.length} readings and ${videos.length} videos in assets/search/${lang}.json`);
  }
}
