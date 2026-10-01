export const LANGS = ["tr", "ar", "en", "fr", "es"] as const;
export type Lang = (typeof LANGS)[number];

export const THEMES = [
  "climate",
  "environment",
  "politics",
  "economy",
  "science",
  "technology",
  "culture",
  "health",
  "research",
] as const;
export type Theme = (typeof THEMES)[number];

export type AudioClip = {
  name: string;
  mime: string;
  dataUrl: string;
};

export type LocaleCopy = {
  title: string;
  dek: string;
  region: string;
  body: string;
  audio: AudioClip | null;
};

export type Source = {
  n: number;
  label: string;
  url: string;
};

/** The picture shown with a reading. `src` is images/<file> in the repository. */
export type StoryImage = {
  src: string;
  /** Short description. Gray caption under the picture, and the image alt text. */
  credit: string;
};

export type Story = {
  id: string;
  theme: Theme;
  date: string;
  sources: Source[];
  image?: StoryImage;
  locales: Record<Lang, LocaleCopy>;
};

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}

export function isTheme(value: string): value is Theme {
  return (THEMES as readonly string[]).includes(value);
}

/** Older two-part sections, mapped to the first half of their old label. */
const LEGACY_THEMES: Record<string, Theme> = {
  cities: "politics",
  trade: "science",
  knowledge: "culture",
};

/** A current section, or the new home of an old two-part one; otherwise undefined. */
export function toTheme(value: string): Theme | undefined {
  return isTheme(value) ? value : LEGACY_THEMES[value];
}

export function normalizeTheme(value: string): Theme {
  return toTheme(value) ?? "research";
}

export function emptyLocale(): LocaleCopy {
  return { title: "", dek: "", region: "", body: "", audio: null };
}

export function blankStory(): Story {
  return {
    id: crypto.randomUUID(),
    theme: "climate",
    date: new Date().toISOString().slice(0, 10),
    sources: [],
    locales: {
      tr: emptyLocale(),
      ar: emptyLocale(),
      en: emptyLocale(),
      fr: emptyLocale(),
      es: emptyLocale(),
    },
  };
}

/** What the front page and section pages know about a reading in one language. */
export type LocaleCard = {
  title: string;
  dek: string;
  region: string;
  /** First paragraph as plain text, for a card without a summary. */
  lead: string;
  minutes: number;
  /** Whether the reading has a text in this language. */
  written: boolean;
};

/** A reading as listed on the front page; the full text is loaded when it is opened. */
export type StoryCard = {
  id: string;
  /** File name in content/stories. */
  file: string;
  theme: Theme;
  date: string;
  image?: StoryImage;
  locales: Record<Lang, LocaleCard>;
};
