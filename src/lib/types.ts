export const LANGS = ["tr", "ar", "en", "fr", "es"] as const;
export type Lang = (typeof LANGS)[number];

export const THEMES = ["climate", "cities", "trade", "knowledge", "research"] as const;
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

export type Story = {
  id: string;
  theme: Theme;
  date: string;
  sources: Source[];
  locales: Record<Lang, LocaleCopy>;
};

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}

export function isTheme(value: string): value is Theme {
  return (THEMES as readonly string[]).includes(value);
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
