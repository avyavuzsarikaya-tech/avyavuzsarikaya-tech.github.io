import { paragraphs } from "@/lib/text";
import type { Story } from "@/lib/types";

/**
 * The public address of the site. Link previews (WhatsApp, X, Telegram), the canonical
 * address and the sitemap are built from it. Change it here if the site moves to its
 * own domain (scripts/pages-shell.mjs reads the same value).
 */
export const SITE_URL = "https://avyavuzsarikaya-tech.github.io";
export const SITE_NAME = "Orbis";
export const SITE_DESCRIPTION =
  "Orbis: sourced readings in Turkish, Arabic, English, French, and Spanish.";
/** The 1200×630 card shown when a page without its own picture is shared. */
export const SITE_CARD = `${SITE_URL}/og.jpg`;

type Meta = Record<string, unknown>;

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Plain text, source markers like [1] removed, cut at a word near `max` characters. */
export function clip(text: string, max = 160): string {
  const plain = text.replace(/\s*\[\d+\]/g, "").replace(/\s+/g, " ").trim();
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:.–—-]+$/, "")}…`;
}

/** Title, description and the link-preview tags for one page. */
export function pageMeta({
  title,
  description,
  path,
  image = SITE_CARD,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
}): Meta[] {
  const url = absoluteUrl(path);
  const picture = absoluteUrl(image);
  return [
    { title },
    { name: "description", content: description },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:type", content: type },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: picture },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: picture },
  ];
}

export function canonical(path: string) {
  return { rel: "canonical", href: absoluteUrl(path) };
}

/** Head of a reading page, in English (the site's default language). */
export function storyHead(story: Story | undefined, path: string) {
  if (!story) {
    return { meta: [{ title: SITE_NAME }, { name: "robots", content: "noindex" }] };
  }
  const en = story.locales.en;
  const title = en.title.trim() || SITE_NAME;
  const description =
    clip(en.dek || paragraphs(en.body)[0] || "") || SITE_DESCRIPTION;
  const image = story.image?.src;
  return {
    meta: [
      ...pageMeta({
        title: `${title} — ${SITE_NAME}`,
        description,
        path,
        image: image || SITE_CARD,
        type: "article",
      }),
      { property: "article:published_time", content: story.date },
      {
        "script:ld+json": {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description,
          datePublished: story.date,
          inLanguage: "en",
          image: [absoluteUrl(image || SITE_CARD)],
          mainEntityOfPage: absoluteUrl(path),
          publisher: { "@type": "Organization", name: SITE_NAME, url: `${SITE_URL}/` },
        },
      },
    ],
    links: [canonical(path)],
  };
}
