import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * `virtual:orbis-videos`: a short card for every video in content/videos — title, one
 * sentence, picture, length — without the transcript. The front page's media strip and the
 * list of videos need only this; a video's page loads its own file, transcript included.
 * Videos stand on their own: they belong to no reading and no issue.
 */

const ID = "virtual:orbis-videos";
const RESOLVED = `\0${ID}`;
export const VIDEO_DIR = "content/videos";

/** Every published video file, newest first. Drafts never reach the public pages. */
export function readVideos(dir = VIDEO_DIR) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .flatMap((file) => {
      const video = JSON.parse(readFileSync(join(dir, file), "utf8"));
      if (video.status === "draft") return [];
      return [{ ...video, id: video.id || file.slice(0, -5), file }];
    })
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

/** A video is shown in a language when it has a title in that language. */
export function videoWritten(video, lang) {
  return Boolean(video.locales?.[lang]?.title?.trim());
}

export function readVideoIndex(dir = VIDEO_DIR) {
  return readVideos(dir).map((video) => {
    const locales = {};
    for (const [lang, copy] of Object.entries(video.locales ?? {})) {
      if (!copy?.title?.trim()) continue;
      locales[lang] = { title: copy.title.trim(), dek: (copy.dek ?? "").trim() };
    }
    return {
      id: video.id,
      file: video.file,
      date: video.date,
      src: video.src,
      ...(video.poster ? { poster: video.poster } : {}),
      ...(Number.isFinite(video.duration) ? { duration: video.duration } : {}),
      locales,
    };
  });
}

export function videoIndexPlugin() {
  let dir = "";
  return {
    name: "orbis:video-index",
    configResolved(config) {
      dir = resolve(config.root, VIDEO_DIR);
    },
    resolveId(id) {
      return id === ID ? RESOLVED : undefined;
    },
    load(id) {
      if (id !== RESOLVED) return undefined;
      if (existsSync(dir)) {
        this.addWatchFile(dir);
        for (const name of readdirSync(dir)) this.addWatchFile(join(dir, name));
      }
      return `export default ${JSON.stringify(readVideoIndex(dir))};`;
    },
    configureServer(server) {
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
