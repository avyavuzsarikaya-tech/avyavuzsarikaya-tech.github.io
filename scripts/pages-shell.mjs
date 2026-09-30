import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd(), "dist", "client");
const assets = readdirSync(join(root, "assets"));
const css = assets.find((name) => name.endsWith(".css"));
if (!css) throw new Error("No CSS asset in dist/client/assets");
const fixCss = (html) => html.replace(/\/assets\/styles-[^"]+\.css/g, `/assets/${css}`);

// The shell answers the front page and, as 404.html, any address without its own file.
const html = fixCss(readFileSync(join(root, "_shell.html"), "utf8"));
writeFileSync(join(root, "index.html"), html);
writeFileSync(join(root, "404.html"), html);
writeFileSync(join(root, ".nojekyll"), "");

// Section and reading pages written by the prerender step (see vite.config.ts).
const THEMES = [
  ...readFileSync("src/lib/types.ts", "utf8")
    .match(/export const THEMES = \[([\s\S]*?)\]/)[1]
    .matchAll(/"([^"]+)"/g),
].map((m) => m[1]);
const stories = readdirSync("content/stories")
  .filter((name) => name.endsWith(".json"))
  .map((name) => {
    const story = JSON.parse(readFileSync(join("content/stories", name), "utf8"));
    return { id: story.id || name.slice(0, -5), date: story.date };
  });

const files = [
  ...THEMES.map((theme) => `${theme}.html`),
  ...stories.map((story) => join("read", `${story.id}.html`)),
];
for (const file of files) {
  const path = join(root, file);
  if (!existsSync(path)) throw new Error(`Prerendered page missing: ${file}`);
  writeFileSync(path, fixCss(readFileSync(path, "utf8")));
}

// Sitemap and robots.txt for search engines. The address comes from src/lib/site.ts.
const site = readFileSync("src/lib/site.ts", "utf8").match(/SITE_URL = "([^"]+)"/)[1];
const latest = stories
  .map((story) => story.date)
  .sort()
  .at(-1);
const urls = [
  { loc: `${site}/`, lastmod: latest },
  ...THEMES.map((theme) => ({ loc: `${site}/${theme}` })),
  ...stories.map((story) => ({ loc: `${site}/read/${story.id}`, lastmod: story.date })),
];
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map(
    ({ loc, lastmod }) =>
      `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`,
  ),
  "</urlset>",
  "",
].join("\n");
writeFileSync(join(root, "sitemap.xml"), sitemap);
writeFileSync(
  join(root, "robots.txt"),
  `User-agent: *\nDisallow: /panel\n\nSitemap: ${site}/sitemap.xml\n`,
);
