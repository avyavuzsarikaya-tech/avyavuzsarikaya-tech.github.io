import type { Lang } from "@/lib/types";

/**
 * Search over the static per-language index (scripts/search-index.mjs writes it).
 * Query and fields pass through the same per-language normalization, so İ/ı, ç/c,
 * é/e and أ/ا meet on common ground. Every query word must appear somewhere in the
 * entry; matching a word's beginning is enough ("clim" finds "climate").
 */

export type SearchEntry = {
  id: string;
  theme: string;
  date: string;
  title: string;
  dek: string;
  region: string;
  body: string;
};

export type SearchHit = SearchEntry & { score: number };

const TITLE = 3;
const DEK = 2;
const BODY = 1; // body and region
const LIMIT = 20;

/**
 * Arabic marks that carry no letter: harakat, superscript alef, tatweel and Quranic
 * annotation signs. U+0660–U+066D (Arabic-Indic digits, ٪ and separators) sit between
 * the harakat and the superscript alef and must stay, so the range is split around them.
 */
const ARABIC_MARKS = /[ً-ٰٟـؐ-ؚۖ-ۭ]/g;

/** The definite article with the particles that attach before it, longest first. */
const ARABIC_ARTICLE = /^(?:وال|فال|بال|كال|لل|ال)(?=..)/;

/** Turkish letters a reader may type without: "cocuk" should find "çocuk". */
const TURKISH_FOLD: Record<string, string> = {
  ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u",
};

export function normalize(text: string, lang: Lang): string {
  let out = text;
  if (lang === "tr") {
    // Turkish folds İ→i and I→ı first (a plain toLowerCase would give i̇ and i),
    // then every Turkish letter meets its plain one.
    out = out.toLocaleLowerCase("tr").replace(/[çğıöşüâîû]/g, (c) => TURKISH_FOLD[c]);
  } else {
    out = out.toLowerCase();
  }
  if (lang === "fr" || lang === "es") {
    // é, ñ, ç… become their base letters: split the accents off, then drop them.
    out = out
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/œ/g, "oe")
      .replace(/æ/g, "ae");
  }
  if (lang === "ar") {
    out = out
      .replace(ARABIC_MARKS, "")
      .replace(/[أإآٱ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي");
  }
  return out.replace(/\s+/g, " ").trim();
}

/** The words of a text, normalized, without the punctuation stuck to their edges. */
function words(text: string, lang: Lang): string[] {
  const normalized = normalize(text, lang);
  if (!normalized) return [];
  return normalized
    .split(" ")
    .map((word) => word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""))
    .filter(Boolean);
}

/** An Arabic word without its article: الاقتصاد → اقتصاد. Other languages pass through. */
function bare(word: string, lang: Lang): string {
  return lang === "ar" ? word.replace(ARABIC_ARTICLE, "") : word;
}

/**
 * Words of a field as the search compares them. In Arabic each word is kept as written
 * and, when it carries the article, once more without it, so "اقتصاد" finds "الاقتصاد".
 */
function fieldWords(text: string, lang: Lang): string[] {
  const list = words(text, lang);
  if (lang !== "ar") return list;
  return list.flatMap((word) => {
    const stripped = bare(word, lang);
    return stripped === word ? [word] : [word, stripped];
  });
}

type Prepared = { entry: SearchEntry; title: string[]; dek: string[]; body: string[] };

/**
 * Each index is split into words once per language and kept for later queries, so a
 * search on every keystroke does not re-read every reading. The cache lets go of an
 * index as soon as the page does.
 */
const prepared = new WeakMap<SearchEntry[], Map<Lang, Prepared[]>>();

function prepare(index: SearchEntry[], lang: Lang): Prepared[] {
  let byLang = prepared.get(index);
  if (!byLang) {
    byLang = new Map();
    prepared.set(index, byLang);
  }
  let list = byLang.get(lang);
  if (!list) {
    list = index.map((entry) => ({
      entry,
      title: fieldWords(entry.title, lang),
      dek: fieldWords(entry.dek, lang),
      body: [...fieldWords(entry.region, lang), ...fieldWords(entry.body, lang)],
    }));
    byLang.set(lang, list);
  }
  return list;
}

export function search(index: SearchEntry[], query: string, lang: Lang): SearchHit[] {
  // A query word with the article searches for its bare form, which matches both
  // the word with the article and without it.
  const terms = words(query, lang).map((term) => bare(term, lang));
  if (terms.length === 0) return [];
  const hits = prepare(index, lang).flatMap(({ entry, title, dek, body }) => {
    let score = 0;
    for (const term of terms) {
      // A word counts once, in the best field it appears in.
      if (title.some((word) => word.startsWith(term))) score += TITLE;
      else if (dek.some((word) => word.startsWith(term))) score += DEK;
      else if (body.some((word) => word.startsWith(term))) score += BODY;
      else return []; // every query word must match
    }
    return [{ ...entry, score }];
  });
  return hits
    .sort(
      (a, b) =>
        b.score - a.score || b.date.localeCompare(a.date) || a.id.localeCompare(b.id),
    )
    .slice(0, LIMIT);
}
