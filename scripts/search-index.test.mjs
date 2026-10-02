import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { writeSearchIndex } from "./search-index.mjs";

function fixture(t) {
  const stories = mkdtempSync(join(tmpdir(), "orbis-stories-"));
  const out = mkdtempSync(join(tmpdir(), "orbis-out-"));
  t.after(() => {
    rmSync(stories, { recursive: true, force: true });
    rmSync(out, { recursive: true, force: true });
  });
  return { stories, out };
}

const copy = (title, dek, body, region = "Global") => ({ title, dek, region, body });

function fullStory(id, date) {
  return {
    id,
    theme: "climate",
    date,
    locales: {
      tr: copy("Başlık", "Özet", "Gövde metni. [1]", "Küresel"),
      ar: copy("العنوان", "الموجز", "نص المقال. [1]", "عالمي"),
      en: copy("Title", "Summary", "Body text. [1]"),
      fr: copy("Titre", "Résumé", "Corps du texte. [1]", "Monde"),
      es: copy("Título", "Resumen", "Cuerpo del texto. [1]", "Global"),
    },
  };
}

const read = (out, lang) =>
  JSON.parse(readFileSync(join(out, lang === "en" ? "search.json" : `${lang}/search.json`), "utf8"));

test("writes one index per language, English at the root, the rest under their prefix", (t) => {
  const { stories, out } = fixture(t);
  writeFileSync(join(stories, "a.json"), JSON.stringify(fullStory("a", "2026-01-01")));
  writeSearchIndex(out, stories);
  for (const lang of ["en", "tr", "ar", "fr", "es"]) {
    const file = lang === "en" ? join(out, "search.json") : join(out, lang, "search.json");
    assert.ok(existsSync(file), `${lang} index missing`);
    assert.equal(read(out, lang).length, 1);
  }
});

test("records carry id, theme, date, title, dek, region and a cleaned body", (t) => {
  const { stories, out } = fixture(t);
  const story = fullStory("reading", "2026-02-01");
  story.locales.en.body = "First line. [1]\n\n**Second** line, quoted. [12]\n> aside";
  writeFileSync(join(stories, "reading.json"), JSON.stringify(story));
  writeSearchIndex(out, stories);
  const [record] = read(out, "en");
  assert.deepEqual(Object.keys(record), ["id", "theme", "date", "title", "dek", "region", "body"]);
  assert.equal(record.id, "reading");
  assert.equal(record.theme, "climate");
  assert.equal(record.date, "2026-02-01");
  assert.equal(record.title, "Title");
  assert.equal(record.dek, "Summary");
  assert.equal(record.region, "Global");
  assert.equal(record.body, "First line. Second line, quoted. aside");
});

test("links and images keep their words and lose their addresses", (t) => {
  const { stories, out } = fixture(t);
  const story = fullStory("links", "2026-02-01");
  story.locales.en.body =
    "See the [World Bank report](https://www.worldbank.org/en/report) here. [1]\n" +
    "![Flooded river](images/flood.jpg)";
  writeFileSync(join(stories, "links.json"), JSON.stringify(story));
  writeSearchIndex(out, stories);
  const [record] = read(out, "en");
  assert.equal(record.body, "See the World Bank report here. Flooded river");
});

test("drafts stay out; a reading without text in a language is absent there only", (t) => {
  const { stories, out } = fixture(t);
  writeFileSync(
    join(stories, "draft.json"),
    JSON.stringify({ ...fullStory("draft", "2026-03-01"), status: "draft" }),
  );
  const partial = fullStory("partial", "2026-03-02");
  partial.locales.fr = copy("", "", "", "");
  partial.locales.ar.body = "   ";
  writeFileSync(join(stories, "partial.json"), JSON.stringify(partial));
  writeSearchIndex(out, stories);
  assert.deepEqual(read(out, "en").map((r) => r.id), ["partial"]);
  assert.deepEqual(read(out, "fr").map((r) => r.id), []);
  assert.deepEqual(read(out, "ar").map((r) => r.id), []);
  assert.deepEqual(read(out, "tr").map((r) => r.id), ["partial"]);
});

test("the id falls back to the file name and records come newest first", (t) => {
  const { stories, out } = fixture(t);
  const unnamed = fullStory("", "2026-01-01");
  delete unnamed.id;
  writeFileSync(join(stories, "from-file.json"), JSON.stringify(unnamed));
  writeFileSync(join(stories, "newer.json"), JSON.stringify(fullStory("newer", "2026-05-01")));
  writeSearchIndex(out, stories);
  assert.deepEqual(
    read(out, "en").map((r) => r.id),
    ["newer", "from-file"],
  );
});
