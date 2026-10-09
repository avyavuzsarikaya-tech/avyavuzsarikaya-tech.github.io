import INDEX from "virtual:orbis-index";
import { normalizeTheme, type Story, type StoryCard } from "@/lib/types";

/**
 * Published readings. Each one is a file in content/stories/<id>.json; the panel writes
 * those files to the repository and the site is rebuilt from them.
 *
 * The front page works from CARDS (title, summary and reading time of every reading).
 * A reading's full text is a separate download, fetched only when that reading opens.
 *
 * Media paths inside a story are relative to the site root (audio/…, images/…) and get
 * the base path added here. A data: address (a file just chosen in the panel) is left alone.
 */
const files = import.meta.glob<Story>("/content/stories/*.json", { import: "default" });

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
    video: story.video
      ? {
          ...story.video,
          src: mediaUrl(story.video.src),
          poster: story.video.poster ? mediaUrl(story.video.poster) : undefined,
        }
      : undefined,
    locales,
  };
}

/** A reading read straight from its file (the panel's copy of the latest version). */
export function fromFile(story: Story): Story {
  return resolve(structuredClone(story));
}

export const CARDS: StoryCard[] = INDEX.map((card) => ({
  ...card,
  theme: normalizeTheme(card.theme),
  image: card.image ? { ...card.image, src: mediaUrl(card.image.src) } : undefined,
  locales: Object.fromEntries(
    Object.entries(card.locales).map(([lang, locale]) => [
      lang,
      locale.audio ? { ...locale, audio: mediaUrl(locale.audio) } : locale,
    ]),
  ) as StoryCard["locales"],
}));

export function findCard(id: string): StoryCard | undefined {
  return CARDS.find((card) => card.id === id);
}

/** The full reading, or null when no published file has this id. */
export async function loadStory(id: string): Promise<Story | null> {
  const card = findCard(id);
  const load = card ? files[`/content/stories/${card.file}`] : undefined;
  if (!load) return null;
  return resolve(structuredClone(await load()));
}

/** Every reading in full, for the panel. */
export async function loadAllStories(): Promise<Story[]> {
  const all = await Promise.all(Object.values(files).map((load) => load()));
  return all.map((story) => resolve(structuredClone(story)));
}

/** The inverse of mediaUrl: the path as it is stored in the story file. */
export function mediaPath(url: string): string {
  const base = import.meta.env.BASE_URL;
  if (url.startsWith(base) && !/^(data:|blob:|https?:)/.test(url)) return url.slice(base.length);
  return url;
}
