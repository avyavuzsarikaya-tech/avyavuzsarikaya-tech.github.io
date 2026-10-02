import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Static search index: one JSON file per language with the full plain text of every
 * published reading — title, summary and body. The page loads only its own language's
 * file and searches it in the browser; no server is involved. English lives at
 * search.json, the other languages at <lang>/search.json, mirroring the address layout.
 */

const LANGS = ["tr", "ar", "en", "fr", "es"];

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

export function writeSearchIndex(outDir, storiesDir = "content/stories") {
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

  for (const lang of LANGS) {
    const records = stories.flatMap((story) => {
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
    const dir = lang === "en" ? outDir : join(outDir, lang);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "search.json"), `${JSON.stringify(records, null, 2)}\n`);
    console.log(
      `[search] ${records.length} readings in ${lang === "en" ? "." : lang}/search.json`,
    );
  }
}
