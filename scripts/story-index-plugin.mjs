import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { readSearchIndex } from "./search-index.mjs";

/**
 * `virtual:orbis-index`: a short card for every reading in content/stories — title,
 * summary, first lines, reading time — in each language. The front page and the section
 * pages need only this; a reading's full text is loaded when that reading is opened.
 * Without it every visitor would download every text in five languages up front.
 */

const ID = "virtual:orbis-index";
const RESOLVED = `\0${ID}`;
const LANGS = ["tr", "ar", "en", "fr", "es"];

function paragraphs(body) {
  return body
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function minutes(body) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return words ? Math.max(1, Math.ceil(words / 160)) : 0;
}

/** First paragraph as plain text, source markers like [1] removed, about three lines long. */
function lead(body) {
  const text = (paragraphs(body)[0] ?? "").replace(/\s*\[\d+\]/g, "").trim();
  if (text.length <= 320) return text;
  const cut = text.slice(0, 320);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 200 ? cut.lastIndexOf(" ") : 320)}…`;
}

export function readStoryIndex(dir) {
  return readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .flatMap((file) => {
      const story = JSON.parse(readFileSync(join(dir, file), "utf8"));
      // Drafts remain available to the editor but never enter public pages or the sitemap.
      if (story.status === "draft") return [];
      const locales = {};
      for (const lang of LANGS) {
        const copy = story.locales?.[lang] ?? {};
        const body = copy.body ?? "";
        locales[lang] = {
          title: copy.title ?? "",
          dek: copy.dek ?? "",
          region: copy.region ?? "",
          lead: lead(body),
          minutes: minutes(body),
          written: body.trim().length > 0,
        };
      }
      return [
        {
          id: story.id || file.slice(0, -5),
          file,
          theme: story.theme,
          date: story.date,
          ...(story.author ? { author: story.author } : {}),
          ...(story.updatedAt ? { updatedAt: story.updatedAt } : {}),
          ...(story.image ? { image: story.image } : {}),
          ...(story.membersOnly === true ? { membersOnly: true } : {}),
          locales,
        },
      ];
    });
}

export function storyIndexPlugin() {
  let dir = "";
  return {
    name: "orbis:story-index",
    configResolved(config) {
      dir = resolve(config.root, "content/stories");
    },
    resolveId(id) {
      return id === ID ? RESOLVED : undefined;
    },
    load(id) {
      if (id !== RESOLVED) return undefined;
      this.addWatchFile(dir);
      for (const name of readdirSync(dir)) this.addWatchFile(join(dir, name));
      return `export default ${JSON.stringify(readStoryIndex(dir))};`;
    },
    configureServer(server) {
      // The same language-specific JSON as the static build, before the HTML fallback.
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? "").split("?", 1)[0];
        const match = /^\/assets\/search\/([a-z]{2})\.json$/.exec(path);
        const lang = match?.[1];
        if (!match || !LANGS.includes(lang)) return next();
        if (req.method !== "GET" && req.method !== "HEAD") return next();
        try {
          const json = JSON.stringify(readSearchIndex(dir, lang));
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.setHeader("Cache-Control", "no-store");
          res.end(req.method === "HEAD" ? "" : json);
        } catch (error) {
          next(error);
        }
      });
      // While editing locally: a new or changed story file refreshes the index.
      const refresh = (file) => {
        if (!file.startsWith(dir)) return;
        for (const env of Object.values(server.environments ?? {})) {
          const mod = env.moduleGraph?.getModuleById(RESOLVED);
          if (mod) env.moduleGraph.invalidateModule(mod);
        }
      };
      server.watcher.on("add", refresh);
      server.watcher.on("change", refresh);
      server.watcher.on("unlink", refresh);
    },
  };
}
