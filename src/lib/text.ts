import type { Lang, Story } from "@/lib/types";

const INTL: Record<Lang, string> = {
  tr: "tr-TR",
  ar: "ar",
  en: "en-GB",
  fr: "fr-FR",
  es: "es-ES",
};

export function paragraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function readingMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  if (!words) return 0;
  return Math.max(1, Math.ceil(words / 160));
}

export function formatDate(iso: string, lang: Lang): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(INTL[lang], {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function safeHttpUrl(raw: string): string | null {
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function storyTitle(story: Story, lang: Lang): string {
  const direct = story.locales[lang].title.trim();
  if (direct) return direct;
  for (const code of ["en", "tr", "fr", "es", "ar"] as const) {
    const title = story.locales[code].title.trim();
    if (title) return title;
  }
  return "";
}

export function hasCopy(story: Story, lang: Lang): boolean {
  return story.locales[lang].body.trim().length > 0;
}
