import assert from "node:assert/strict";
import test from "node:test";
import { normalize, search } from "./search.ts";
import type { SearchEntry } from "./search.ts";

function entry(fields: Partial<SearchEntry> & { id: string }): SearchEntry {
  return {
    theme: "climate",
    date: "2026-01-01",
    title: "",
    dek: "",
    region: "",
    body: "",
    ...fields,
  };
}

test("Turkish folds İ, I, i and ı onto the right letters", () => {
  assert.equal(normalize("İKLİM", "tr"), "iklim");
  assert.equal(normalize("IŞIK", "tr"), "isik");
  const index = [
    entry({ id: "a", title: "İklim raporu", body: "Metin" }),
    entry({ id: "b", title: "Baska", body: "IŞIK hızı üzerine" }),
  ];
  assert.deepEqual(search(index, "iklim", "tr").map((h) => h.id), ["a"]);
  assert.deepEqual(search(index, "İKLİM", "tr").map((h) => h.id), ["a"]);
  assert.deepEqual(search(index, "ışık", "tr").map((h) => h.id), ["b"]);
});

test("Turkish finds words typed without Turkish letters, and the other way round", () => {
  const index = [
    entry({ id: "a", title: "Çocukların göç yolu", body: "Metin" }),
    entry({ id: "b", title: "Kâğıt fiyatları", body: "Metin" }),
  ];
  assert.deepEqual(search(index, "cocuk goc", "tr").map((h) => h.id), ["a"]);
  assert.deepEqual(search(index, "ÇOCUK", "tr").map((h) => h.id), ["a"]);
  assert.deepEqual(search(index, "kagit", "tr").map((h) => h.id), ["b"]);
});

test("Arabic ignores harakat and tatweel, and unifies alef, ة/ه and ى/ي", () => {
  const index = [
    entry({ id: "a", title: "السَّلَامُ", body: "نص" }),
    entry({ id: "b", title: "إلى مدرسة", body: "نص" }),
    entry({ id: "c", title: "على الطريق", body: "نص" }),
    entry({ id: "d", title: "السـلام", body: "نص" }),
  ];
  assert.deepEqual(search(index, "السلام", "ar").map((h) => h.id), ["a", "d"]);
  assert.deepEqual(search(index, "الي", "ar").map((h) => h.id), ["b"]);
  assert.deepEqual(search(index, "مدرسه", "ar").map((h) => h.id), ["b"]);
  assert.deepEqual(search(index, "علي", "ar").map((h) => h.id), ["c"]);
});

test("Arabic keeps its digits and the percent sign", () => {
  assert.equal(normalize("عام ٢٠٢٠، نسبة ٥٪", "ar"), "عام ٢٠٢٠، نسبه ٥٪");
  const index = [entry({ id: "a", title: "تقرير", body: "في عام ٢٠٢٠" })];
  assert.deepEqual(search(index, "٢٠٢٠", "ar").map((h) => h.id), ["a"]);
});

test("Arabic finds a word with or without the article and its particles", () => {
  const index = [
    entry({ id: "a", title: "الاقتصاد والهجرة", body: "نص" }),
    entry({ id: "b", title: "اقتصاد البلاد", body: "نص" }),
    entry({ id: "c", title: "تقرير", body: "نص للاقتصاد" }),
  ];
  assert.deepEqual(search(index, "اقتصاد", "ar").map((h) => h.id), ["a", "b", "c"]);
  assert.deepEqual(search(index, "الاقتصاد", "ar").map((h) => h.id), ["a", "b", "c"]);
  assert.deepEqual(search(index, "هجرة", "ar").map((h) => h.id), ["a"]);
});

test("French and Spanish ignore accents", () => {
  const fr = [entry({ id: "a", title: "Les élèves", body: "Texte" })];
  assert.deepEqual(search(fr, "ELEVE", "fr").map((h) => h.id), ["a"]);
  const oe = [entry({ id: "c", title: "Une œuvre", body: "Texte" })];
  assert.deepEqual(search(oe, "oeuvre", "fr").map((h) => h.id), ["c"]);
  const es = [entry({ id: "b", title: "Informe", body: "La acción climática" })];
  assert.deepEqual(search(es, "accion", "es").map((h) => h.id), ["b"]);
});

test("every query word must match; a word's beginning is enough", () => {
  const index = [entry({ id: "a", title: "Climate report", body: "The rivers rise." })];
  assert.deepEqual(search(index, "clim rep", "en").map((h) => h.id), ["a"]);
  assert.deepEqual(search(index, "climate missing", "en"), []);
  assert.deepEqual(search(index, "   ", "en"), []);
});

test("the region is searched too, weighed like the body", () => {
  const index = [
    entry({ id: "a", title: "Rivers", region: "Africa" }),
    entry({ id: "b", title: "Rivers", region: "Asia" }),
  ];
  assert.deepEqual(search(index, "africa", "en").map((h) => h.id), ["a"]);
  assert.equal(search(index, "africa", "en")[0].score, 1);
});

test("title beats dek, dek beats body; ties break towards the newer reading", () => {
  const index = [
    entry({ id: "body", date: "2026-01-03", body: "The rivers rise." }),
    entry({ id: "dek", date: "2026-01-02", dek: "The rivers rise." }),
    entry({ id: "title", date: "2026-01-01", title: "The rivers rise" }),
    entry({ id: "old-tie", date: "2026-01-01", title: "Rivers" }),
    entry({ id: "new-tie", date: "2026-02-01", title: "Rivers" }),
  ];
  assert.deepEqual(
    search(index, "rivers", "en").map((h) => h.id),
    ["new-tie", "old-tie", "title", "dek", "body"],
  );
});

test("at most twenty results come back", () => {
  const index = Array.from({ length: 25 }, (_, i) =>
    entry({ id: `r${i}`, title: "Rivers" }),
  );
  assert.equal(search(index, "rivers", "en").length, 20);
});

test("the same index answers repeated queries, in more than one language", () => {
  const index = [entry({ id: "a", title: "Çocuk", body: "Child" })];
  assert.deepEqual(search(index, "cocuk", "tr").map((h) => h.id), ["a"]);
  assert.deepEqual(search(index, "child", "en").map((h) => h.id), ["a"]);
  assert.deepEqual(search(index, "çocuk", "tr").map((h) => h.id), ["a"]);
});
