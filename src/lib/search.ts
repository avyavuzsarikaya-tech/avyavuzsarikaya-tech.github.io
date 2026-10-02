import type { Lang, StoryCard } from "@/lib/types";
// Relative import with the extension, so the tests can load this file directly with node.
import { copyFor } from "./i18n.ts";

/**
 * Search over the reading cards already on the page (virtual:orbis-index): title,
 * summary, region, section name and first paragraph, in the language of the page.
 * Nothing is sent anywhere; the site stays a set of static files.
 *
 * Every query word must begin a word somewhere in the reading ("clim" finds "climate",
 * "war" does not find "software"). In Arabic a word also counts without the article
 * and the particles joined to it, so "اقتصاد" finds "الاقتصاد" and "للاقتصاد".
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
 * Arabic marks that carry no letter: harakat, superscript alef, tatweel and Quranic
 * annotation signs. Arabic-Indic digits and ٪ (U+0660–U+066D) sit between the harakat
 * and the superscript alef and must stay, so the range is split around them.
 */
// eslint-disable-next-line no-misleading-character-class -- a range of separate marks, nothing is combined
const ARABIC_MARKS = /[\u064B-\u065F\u0670\u0640\u0610-\u061A\u06D6-\u06ED]/g;

/** The Arabic article with the particles joined before it, longest first. */
const ARABIC_ARTICLE = /^(?:وال|فال|بال|كال|لل|ال)(?=..)/;

/**
 * Text folded for matching: case, accents and Arabic vowel marks do not count, and the
 * Turkish dotless and dotted i match each other. "istanbul" finds "İstanbul", "isik"
 * finds "ışık", "cocuk" finds "çocuk", "ecole" finds "école", "oeuvre" finds "œuvre",
 * "كتاب" finds "كِتَاب"; digits, Arabic ones included, stay as they are.
 */
export function fold(text: string): string {
  return text
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(ARABIC_MARKS, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/** An Arabic word without its article: الاقتصاد → اقتصاد. Other words pass through. */
function bare(word: string): string {
  return word.replace(ARABIC_ARTICLE, "");
}

/** The words of a query, folded; an Arabic word with the article searches its bare form. */
export function terms(query: string): string[] {
  return fold(query).split(" ").filter(Boolean).map(bare);
}

/** The words of a field, folded; an Arabic word with the article is kept both ways. */
function fieldWords(text: string): string[] {
  return fold(text)
    .split(" ")
    .filter(Boolean)
    .flatMap((word) => {
      const stripped = bare(word);
      return stripped === word ? [word] : [word, stripped];
    });
}

type Fields = [string[], number][];

/**
 * Each card is split into words once per language and kept, so a search on every
 * keystroke does not fold every reading again.
 */
const prepared = new WeakMap<StoryCard, Partial<Record<Lang, Fields>>>();

function fieldsOf(card: StoryCard, lang: Lang): Fields {
  let byLang = prepared.get(card);
  if (!byLang) {
    byLang = {};
    prepared.set(card, byLang);
  }
  let fields = byLang[lang];
  if (!fields) {
    const copy = card.locales[lang];
    const themes = copyFor(lang).themes;
    fields = [
      [fieldWords(copy.title), 5],
      [fieldWords(copy.dek), 3],
      [fieldWords(`${copy.region} ${themes[card.theme]}`), 2],
      [fieldWords(copy.lead), 1],
    ];
    byLang[lang] = fields;
  }
  return fields;
}

/**
 * Readings in this language whose text holds every word of the query. A hit in the title
 * counts most, then the summary, region and section, then the first paragraph; equal
 * scores keep the newest first.
 */
export function searchCards(cards: StoryCard[], lang: Lang, query: string): StoryCard[] {
  const words = terms(query);
  if (words.length === 0) return [];
  const scored: { card: StoryCard; score: number }[] = [];
  for (const card of cards) {
    if (!card.locales[lang].written) continue;
    const fields = fieldsOf(card, lang);
    let score = 0;
    let all = true;
    for (const word of words) {
      let hit = 0;
      for (const [list, weight] of fields) {
        if (list.some((w) => w.startsWith(word))) hit += weight;
      }
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
