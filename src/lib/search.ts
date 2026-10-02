import { copyFor } from "@/lib/i18n";
import type { Lang, StoryCard } from "@/lib/types";

/**
 * Search over the reading cards already on the page (virtual:orbis-index): title,
 * summary, region, section name and first paragraph, in the language of the page.
 * Nothing is sent anywhere; the site stays a set of static files.
 */

export type SearchCopy = {
  title: string;
  label: string;
  placeholder: string;
  submit: string;
  /** Number of results; {n} is replaced. */
  count: (n: number) => string;
  empty: string;
  description: string;
};

const COPY: Record<Lang, SearchCopy> = {
  tr: {
    title: "Arama",
    label: "Okumalarda ara",
    placeholder: "Okumalarda ara",
    submit: "Ara",
    count: (n) => `${n} sonuç`,
    empty: "Aramanızla eşleşen okuma bulunamadı.",
    description: "Orbis okumalarında arama.",
  },
  ar: {
    title: "البحث",
    label: "ابحث في القراءات",
    placeholder: "ابحث في القراءات",
    submit: "بحث",
    count: (n) =>
      n === 1 ? "نتيجة واحدة" : n === 2 ? "نتيجتان" : n <= 10 ? `${n} نتائج` : `${n} نتيجة`,
    empty: "لا توجد قراءات مطابقة لبحثك.",
    description: "البحث في قراءات أوربيس.",
  },
  en: {
    title: "Search",
    label: "Search the readings",
    placeholder: "Search the readings",
    submit: "Search",
    count: (n) => (n === 1 ? "1 result" : `${n} results`),
    empty: "No readings match your search.",
    description: "Search the readings on Orbis.",
  },
  fr: {
    title: "Recherche",
    label: "Chercher dans les lectures",
    placeholder: "Chercher dans les lectures",
    submit: "Chercher",
    count: (n) => (n <= 1 ? `${n} résultat` : `${n} résultats`),
    empty: "Aucune lecture ne correspond à votre recherche.",
    description: "Rechercher dans les lectures d’Orbis.",
  },
  es: {
    title: "Búsqueda",
    label: "Buscar en las lecturas",
    placeholder: "Buscar en las lecturas",
    submit: "Buscar",
    count: (n) => (n === 1 ? "1 resultado" : `${n} resultados`),
    empty: "Ninguna lectura coincide con su búsqueda.",
    description: "Buscar en las lecturas de Orbis.",
  },
};

export function searchCopy(lang: Lang): SearchCopy {
  return COPY[lang];
}

/**
 * Text folded for matching: case, accents and Arabic vowel marks do not count, and the
 * Turkish dotless and dotted i match each other. "istanbul" finds "İstanbul", "isik"
 * finds "ışık", "ecole" finds "école", "كتاب" finds "كِتَاب".
 */
export function fold(text: string): string {
  return text
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .toLowerCase()
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function terms(query: string): string[] {
  return fold(query).split(" ").filter(Boolean);
}

/**
 * Readings in this language whose text holds every word of the query. A hit in the title
 * counts most, then the summary, region and section, then the first paragraph; equal
 * scores keep the newest first.
 */
export function searchCards(cards: StoryCard[], lang: Lang, query: string): StoryCard[] {
  const words = terms(query);
  if (words.length === 0) return [];
  const themes = copyFor(lang).themes;
  const scored: { card: StoryCard; score: number }[] = [];
  for (const card of cards) {
    const copy = card.locales[lang];
    if (!copy.written) continue;
    const fields: [string, number][] = [
      [fold(copy.title), 5],
      [fold(copy.dek), 3],
      [fold(`${copy.region} ${themes[card.theme]}`), 2],
      [fold(copy.lead), 1],
    ];
    let score = 0;
    let all = true;
    for (const word of words) {
      let hit = 0;
      for (const [text, weight] of fields) if (text.includes(word)) hit += weight;
      if (!hit) {
        all = false;
        break;
      }
      score += hit;
    }
    if (all) scored.push({ card, score });
  }
  return scored
    .sort((a, b) => b.score - a.score || b.card.date.localeCompare(a.card.date))
    .map((entry) => entry.card);
}
