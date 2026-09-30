import { normalizeTheme, type Story } from "@/lib/types";

/**
 * Published readings. Each one is a file in content/stories/<id>.json; the panel writes
 * those files to the repository and the site is rebuilt from them.
 *
 * Media paths inside a story are relative to the site root (audio/…, images/…) and get
 * the base path added here. A data: address (a file just chosen in the panel) is left alone.
 */
const files = import.meta.glob<Story>("/content/stories/*.json", {
  eager: true,
  import: "default",
});

export function mediaUrl(path: string): string {
  if (!path || /^(data:|blob:|https?:|\/)/.test(path)) return path;
  return `${import.meta.env.BASE_URL}${path}`;
}

function resolve(story: Story): Story {
  const locales = { ...story.locales };
  for (const lang of Object.keys(locales) as (keyof Story["locales"])[]) {
    const audio = locales[lang].audio;
    locales[lang] = {
      ...locales[lang],
      audio: audio ? { ...audio, dataUrl: mediaUrl(audio.dataUrl) } : null,
    };
  }
  return {
    ...story,
    theme: normalizeTheme(story.theme),
    image: story.image ? { ...story.image, src: mediaUrl(story.image.src) } : undefined,
    locales,
  };
}

export const SEED: Story[] = Object.values(files).map((story) => resolve(structuredClone(story)));

/** The inverse of mediaUrl: the path as it is stored in the story file. */
export function mediaPath(url: string): string {
  const base = import.meta.env.BASE_URL;
  if (url.startsWith(base) && !/^(data:|blob:|https?:)/.test(url)) return url.slice(base.length);
  return url;
}
