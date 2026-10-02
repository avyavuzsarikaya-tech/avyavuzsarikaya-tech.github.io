import assert from "node:assert/strict";
import test from "node:test";
import { fold, searchCards, searchCopy, terms } from "./search.ts";
import type { Lang, LocaleCard, StoryCard } from "./types.ts";

const LANGS: Lang[] = ["tr", "ar", "en", "fr", "es"];

function locale(fields: Partial<LocaleCard> = {}): LocaleCard {
  return { title: "", dek: "", region: "", lead: "", minutes: 1, written: true, ...fields };
}

/** A card written in one language only; the other languages are empty. */
function card(id: string, lang: Lang, fields: Partial<LocaleCard>, date = "2026-01-01"): StoryCard {
  const locales = Object.fromEntries(
    LANGS.map((l) => [l, l === lang ? locale(fields) : locale({ written: false })]),
  ) as Record<Lang, LocaleCard>;
  return { id, file: `${id}.json`, theme: "climate", date, locales };
}

const ids = (cards: StoryCard[]) => cards.map((c) => c.id);

test("every language has its search words", () => {
  for (const lang of LANGS) {
    const copy = searchCopy(lang);
    assert.ok(copy.title && copy.placeholder && copy.empty, lang);
    assert.ok(copy.count(3).includes("3"), lang);
  }
});

test("Turkish: İ/I/ı and Turkish letters meet their plain forms", () => {
  assert.equal(fold("İKLİM"), "iklim");
  assert.equal(fold("IŞIK"), "isik");
  const cards = [
    card("a", "tr", { title: "Çocukların göç yolu" }),
    card("b", "tr", { title: "Kâğıt fiyatları", lead: "IŞIK hızı üzerine" }),
  ];
  assert.deepEqual(ids(searchCards(cards, "tr", "cocuk goc")), ["a"]);
  assert.deepEqual(ids(searchCards(cards, "tr", "ÇOCUK")), ["a"]);
  assert.deepEqual(ids(searchCards(cards, "tr", "kagit")), ["b"]);
  assert.deepEqual(ids(searchCards(cards, "tr", "ışık")), ["b"]);
});

test("Arabic ignores harakat and tatweel, and unifies alef, ة/ه and ى/ي", () => {
  const cards = [
    card("a", "ar", { title: "السَّلَامُ" }),
    card("b", "ar", { title: "إلى مدرسة" }),
    card("c", "ar", { title: "على الطريق" }),
    card("d", "ar", { title: "السـلام" }),
  ];
  assert.deepEqual(ids(searchCards(cards, "ar", "السلام")).sort(), ["a", "d"]);
  assert.deepEqual(ids(searchCards(cards, "ar", "الي")), ["b"]);
  assert.deepEqual(ids(searchCards(cards, "ar", "مدرسه")), ["b"]);
  assert.deepEqual(ids(searchCards(cards, "ar", "علي")), ["c"]);
});

test("Arabic keeps its digits and the percent sign", () => {
  assert.equal(fold("عام ٢٠٢٠"), "عام ٢٠٢٠");
  assert.ok(fold("نسبة ٥٪").includes("٥"));
  const cards = [card("a", "ar", { title: "تقرير", lead: "في عام ٢٠٢٠" })];
  assert.deepEqual(ids(searchCards(cards, "ar", "٢٠٢٠")), ["a"]);
});

test("Arabic finds a word with or without the article and its particles", () => {
  const cards = [
    card("a", "ar", { title: "الاقتصاد والهجرة" }),
    card("b", "ar", { title: "اقتصاد البلاد" }),
    card("c", "ar", { title: "تقرير", lead: "نص للاقتصاد" }),
  ];
  assert.deepEqual(terms("الاقتصاد"), ["اقتصاد"]);
  assert.deepEqual(ids(searchCards(cards, "ar", "اقتصاد")).sort(), ["a", "b", "c"]);
  assert.deepEqual(ids(searchCards(cards, "ar", "الاقتصاد")).sort(), ["a", "b", "c"]);
  assert.deepEqual(ids(searchCards(cards, "ar", "هجرة")), ["a"]);
});

test("French and Spanish ignore accents and ligatures", () => {
  const fr = [card("a", "fr", { title: "Les élèves", dek: "Une œuvre" })];
  assert.deepEqual(ids(searchCards(fr, "fr", "ELEVE")), ["a"]);
  assert.deepEqual(ids(searchCards(fr, "fr", "oeuvre")), ["a"]);
  const es = [card("b", "es", { title: "Informe", lead: "La acción climática" })];
  assert.deepEqual(ids(searchCards(es, "es", "accion")), ["b"]);
});

test("a query word must begin a word: 'war' does not find 'software'", () => {
  const cards = [
    card("war", "en", { title: "The cost of war" }),
    card("soft", "en", { title: "Software toward the future" }),
  ];
  assert.deepEqual(ids(searchCards(cards, "en", "war")), ["war"]);
  assert.deepEqual(ids(searchCards(cards, "en", "soft")), ["soft"]);
});

test("every query word must match; an empty query finds nothing", () => {
  const cards = [card("a", "en", { title: "Climate report", lead: "The rivers rise." })];
  assert.deepEqual(ids(searchCards(cards, "en", "clim rep")), ["a"]);
  assert.deepEqual(ids(searchCards(cards, "en", "climate missing")), []);
  assert.deepEqual(ids(searchCards(cards, "en", "   ")), []);
});

test("region and section name are searched", () => {
  const cards = [
    card("a", "en", { title: "Rivers", region: "Africa" }),
    card("b", "en", { title: "Rivers", region: "Asia" }),
  ];
  assert.deepEqual(ids(searchCards(cards, "en", "africa")), ["a"]);
  // Both cards are in the climate section.
  assert.deepEqual(ids(searchCards(cards, "en", "climate")).sort(), ["a", "b"]);
});

test("only readings written in the page's language are searched", () => {
  const cards = [card("a", "en", { title: "Rivers" })];
  assert.deepEqual(ids(searchCards(cards, "fr", "rivers")), []);
});

test("title beats summary, summary beats first paragraph; ties keep the newest first", () => {
  const cards = [
    card("lead", "en", { lead: "The rivers rise." }, "2026-01-03"),
    card("dek", "en", { dek: "The rivers rise." }, "2026-01-02"),
    card("old-title", "en", { title: "Rivers" }, "2026-01-01"),
    card("new-title", "en", { title: "Rivers" }, "2026-02-01"),
  ];
  assert.deepEqual(ids(searchCards(cards, "en", "rivers")), [
    "new-title",
    "old-title",
    "dek",
    "lead",
  ]);
});

test("the same cards answer repeated queries in more than one language", () => {
  const c = card("a", "tr", { title: "Çocuk" });
  c.locales.en = locale({ title: "Child" });
  assert.deepEqual(ids(searchCards([c], "tr", "cocuk")), ["a"]);
  assert.deepEqual(ids(searchCards([c], "en", "child")), ["a"]);
  assert.deepEqual(ids(searchCards([c], "tr", "çocuk")), ["a"]);
});
