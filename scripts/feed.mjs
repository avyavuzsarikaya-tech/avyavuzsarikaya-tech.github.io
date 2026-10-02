import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { readStoryIndex } from "./story-index-plugin.mjs";

const escapeXml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[char];
  });

/** Write one RSS 2.0 feed per language after the static pages and sitemap exist. */
export function writeFeeds({ root, langs, site, name }) {
  const stories = readStoryIndex("content/stories")
    .map((story) => {
      const date = new Date(story.date);
      if (Number.isNaN(date.getTime())) {
        throw new Error(`Invalid RSS publication date in ${story.file}: ${story.date}`);
      }
      return { ...story, date };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  for (const lang of langs) {
    const prefix = lang === "en" ? "" : `/${lang}`;
    const items = stories
      .filter((story) => story.locales[lang]?.written)
      .slice(0, 50)
      .map((story) => {
        const copy = story.locales[lang];
        const link = escapeXml(`${site}${prefix}/read/${story.id}`);
        return [
          "    <item>",
          `      <title>${escapeXml(copy.title)}</title>`,
          `      <link>${link}</link>`,
          `      <description>${escapeXml(copy.dek)}</description>`,
          `      <pubDate>${story.date.toUTCString()}</pubDate>`,
          `      <guid isPermaLink="true">${link}</guid>`,
          "    </item>",
        ].join("\n");
      });

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<rss version="2.0">',
      "  <channel>",
      `    <title>${escapeXml(name)} (${escapeXml(lang)})</title>`,
      `    <link>${escapeXml(`${site}${prefix}/`)}</link>`,
      `    <description>${escapeXml(`${name} readings (${lang}).`)}</description>`,
      `    <language>${escapeXml(lang)}</language>`,
      ...items,
      "  </channel>",
      "</rss>",
      "",
    ].join("\n");
    const dir = lang === "en" ? root : join(root, lang);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "feed.xml"), xml);
    console.log(`[pages] ${items.length} readings in ${prefix.slice(1) || "."}/feed.xml`);
  }
}
