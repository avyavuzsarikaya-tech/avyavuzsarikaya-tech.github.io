import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ReadTime } from "@/components/read-time";
import { useCopy } from "@/lib/i18n";
import { publicPath, readLink } from "@/lib/lang-path";
import { CARDS } from "@/lib/seed";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import { formatDate, storyTitle } from "@/lib/text";
import type { Lang, Story, StoryCard } from "@/lib/types";

/**
 * What sits at the end of a reading and around it, open to every reader:
 * - a passage copied from the reading carries its source with it;
 * - a ready citation, copied with one tap;
 * - "Save as PDF or print": the browser's own print sheet, with a clean page (styles.css, @media print);
 * - a few related readings, same section first.
 */

const WORDS: Record<
  Lang,
  {
    source: string;
    cite: string;
    copy: string;
    copied: string;
    pdf: string;
    pdfLong: string;
    related: string;
  }
> = {
  tr: {
    source: "Kaynak",
    cite: "Bu okumayı kaynak göster",
    copy: "Kopyala",
    copied: "Kopyalandı",
    pdf: "PDF",
    pdfLong: "PDF olarak kaydet ya da yazdır",
    related: "İlgili okumalar",
  },
  en: {
    source: "Source",
    cite: "Cite this reading",
    copy: "Copy",
    copied: "Copied",
    pdf: "PDF",
    pdfLong: "Save as PDF or print",
    related: "Related readings",
  },
  ar: {
    source: "المصدر",
    cite: "الاستشهاد بهذه القراءة",
    copy: "نسخ",
    copied: "تم النسخ",
    pdf: "PDF",
    pdfLong: "حفظ بصيغة PDF أو طباعة",
    related: "قراءات ذات صلة",
  },
  fr: {
    source: "Source",
    cite: "Citer cette lecture",
    copy: "Copier",
    copied: "Copié",
    pdf: "PDF",
    pdfLong: "Enregistrer en PDF ou imprimer",
    related: "Lectures liées",
  },
  es: {
    source: "Fuente",
    cite: "Citar esta lectura",
    copy: "Copiar",
    copied: "Copiado",
    pdf: "PDF",
    pdfLong: "Guardar como PDF o imprimir",
    related: "Lecturas relacionadas",
  },
};

/** Quotation marks around a title, as each language sets them. */
const QUOTES: Record<Lang, [string, string]> = {
  tr: ["“", "”"],
  en: ["“", "”"],
  ar: ["«", "»"],
  fr: ["« ", " »"],
  es: ["«", "»"],
};

/** The public address of a reading in a language. */
export function readingUrl(lang: Lang, storyId: string): string {
  return absoluteUrl(publicPath(lang, `/read/${storyId}`));
}

/** Author. “Title.” Orbis, 20 January 2026. — without the address. Arabic names the site
 * as the Arabic pages do and uses the Arabic comma, so the line reads in one direction. */
function citationText(story: Story, lang: Lang): string {
  const [open, close] = QUOTES[lang];
  const author = story.author?.trim();
  const title = storyTitle(story, lang).replace(/[.。]$/, "");
  const site =
    lang === "ar"
      ? `أوربيس، ${formatDate(story.date, lang)}.`
      : `${SITE_NAME}, ${formatDate(story.date, lang)}.`;
  return [author ? `${author}.` : "", `${open}${title}.${close}`, site].filter(Boolean).join(" ");
}

/** The full citation as copied: the text, then the address. */
export function citation(story: Story, lang: Lang): string {
  return `${citationText(story, lang)} ${readingUrl(lang, story.id)}`;
}

/**
 * The selected text without the source numbers (and their hidden "source" word), with its
 * paragraph breaks. The copy is laid out off screen for a moment so the browser can say
 * where its lines break.
 */
function cleanSelection(selection: Selection): string {
  const holder = document.createElement("div");
  holder.style.cssText = "position:fixed;left:-99999px;top:0;width:40rem;white-space:normal";
  for (let i = 0; i < selection.rangeCount; i++) {
    holder.appendChild(selection.getRangeAt(i).cloneContents());
  }
  holder.querySelectorAll("a.cite, .sr-only, button").forEach((node) => node.remove());
  document.body.appendChild(holder);
  const text = holder.innerText;
  holder.remove();
  return text
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/ +([.,;:!?])/g, "$1");
}

/**
 * A passage of eight words or more copied from inside `area` gets the reading's title and
 * address under it. A word or two copied to look up stays as it is.
 */
export function useSignedCopy(
  area: React.RefObject<HTMLElement | null>,
  story: Story | null,
  lang: Lang,
) {
  useEffect(() => {
    const el = area.current;
    if (!el || !story) return;
    const onCopy = (event: ClipboardEvent) => {
      const selection = window.getSelection();
      if (!event.clipboardData || !selection || selection.rangeCount === 0) return;
      const text = cleanSelection(selection);
      if (text.trim().split(/\s+/).length < 8) return;
      const title = storyTitle(story, lang);
      const url = readingUrl(lang, story.id);
      const line = `${WORDS[lang].source}: ${title}, ${SITE_NAME}. ${url}`;
      const escape = (s: string) =>
        s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      event.clipboardData.setData("text/plain", `${text.trim()}\n\n${line}`);
      event.clipboardData.setData(
        "text/html",
        `<p>${escape(text.trim()).replace(/\n+/g, "</p><p>")}</p><p>${escape(
          `${WORDS[lang].source}: ${title}, ${SITE_NAME}.`,
        )} <a href="${url}">${url}</a></p>`,
      );
      event.preventDefault();
    };
    el.addEventListener("copy", onCopy);
    return () => el.removeEventListener("copy", onCopy);
  }, [area, story, lang]);
}

/** "PDF" in the line with A− A+: opens the browser's print sheet, where "Save as PDF" lives. */
export function PdfButton({ lang }: { lang: Lang }) {
  const words = WORDS[lang];
  return (
    <button
      type="button"
      onClick={() => window.print()}
      aria-label={words.pdfLong}
      title={words.pdfLong}
      className="inline-flex h-8 items-center px-1.5 text-sm text-ink tracking-wide"
    >
      <span dir="ltr">{words.pdf}</span>
    </button>
  );
}

/** The ready citation, with a copy link beside its heading. */
export function CiteBox({ story, lang }: { story: Story; lang: Lang }) {
  const words = WORDS[lang];
  const text = citation(story, lang);
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Older browsers: select the citation so the reader can copy it by hand.
      const node = document.getElementById("citation-text");
      if (node) window.getSelection()?.selectAllChildren(node);
      return;
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  }

  const label =
    lang === "ar" ? "text-sm text-pine" : "text-xs uppercase tracking-[0.14em] text-pine";
  return (
    <section className="reading-cite border-t border-line pt-8" aria-labelledby="cite-heading">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="cite-heading" className={`font-body font-normal ${label}`}>
          {words.cite}
        </h2>
        <button
          type="button"
          onClick={copy}
          aria-live="polite"
          className="no-print inline-flex min-h-9 items-center text-sm text-pine"
        >
          {copied ? words.copied : words.copy}
        </button>
      </div>
      <p id="citation-text" className="mt-3 break-words text-[0.95rem] leading-relaxed">
        {citationText(story, lang)}{" "}
        <span dir="ltr" className={lang === "ar" ? "block text-start" : ""}>
          {readingUrl(lang, story.id)}
        </span>
      </p>
    </section>
  );
}

/** Up to three other readings in this language: same section first, then the newest. */
function relatedCards(story: Story, lang: Lang): StoryCard[] {
  const pool = CARDS.filter((card) => card.id !== story.id && card.locales[lang].written);
  const newest = (a: StoryCard, b: StoryCard) => b.date.localeCompare(a.date);
  const same = pool.filter((card) => card.theme === story.theme).sort(newest);
  const rest = pool.filter((card) => card.theme !== story.theme).sort(newest);
  return [...same, ...rest].slice(0, 3);
}

export function RelatedReadings({ story, lang }: { story: Story; lang: Lang }) {
  const copy = useCopy(lang);
  const cards = relatedCards(story, lang);
  if (!cards.length) return null;
  const label =
    lang === "ar" ? "text-sm text-pine" : "text-xs uppercase tracking-[0.14em] text-pine";
  return (
    <section className="no-print mt-4" aria-labelledby="related-heading">
      <h2
        id="related-heading"
        className={`border-b-[3px] border-ink pb-3 font-body font-normal ${label}`}
      >
        {WORDS[lang].related}
      </h2>
      <ol>
        {cards.map((card) => {
          const locale = card.locales[lang];
          return (
            <li key={card.id} className="border-b border-line">
              <Link {...readLink(lang, card.id)} className="group block py-4">
                <h3 className="paper-title text-[1.2rem] leading-[1.2] font-bold text-ink decoration-1 underline-offset-[0.14em] group-hover:underline">
                  {storyTitle(card, lang)}
                </h3>
                {locale.dek ? (
                  <p className="pt-1.5 text-base leading-[1.35] text-ink">{locale.dek}</p>
                ) : null}
                <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
                  <span className={label}>{copy.themes[card.theme]}</span>
                  {locale.minutes ? <span className="text-xs text-muted">·</span> : null}
                  {locale.minutes ? (
                    <ReadTime minutes={locale.minutes} lang={lang} pattern={copy.minRead} />
                  ) : null}
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
