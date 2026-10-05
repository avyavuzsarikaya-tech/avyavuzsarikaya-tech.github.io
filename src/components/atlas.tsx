import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ReadTime } from "@/components/read-time";
import { FrameTools, Shell } from "@/components/shell";
import { useFrameCopy } from "@/lib/frame-copy";
import { imageCaption } from "@/lib/editorial";
import { langMeta, useCopy } from "@/lib/i18n";
import { readLink } from "@/lib/lang-path";
import { CARDS } from "@/lib/seed";
import { formatDate, storyTitle } from "@/lib/text";
import type { Lang, StoryCard as Story, Theme } from "@/lib/types";
import { useLang } from "@/lib/use-lang";

/**
 * Section pages keep the lead reading and ruled columns. The front page alone
 * is a newspaper page: a large pictured lead, a narrow column beside it, then the rest.
 */

function Meta({ story, lang, section }: { story: Story; lang: Lang; section: Theme | "all" }) {
  const copy = useCopy(lang);
  const minutes = story.locales[lang].minutes;
  return (
    <div className="mt-1 flex flex-col items-start gap-1 text-xs text-muted">
      <p>
        {section === "all" ? (
          <>
            <span className="uppercase tracking-widest text-pine">{copy.themes[story.theme]}</span>
            {" · "}
          </>
        ) : null}
        <span className="whitespace-nowrap">{formatDate(story.date, lang)}</span>
      </p>
      {minutes ? <ReadTime minutes={minutes} lang={lang} pattern={copy.minRead} /> : null}
    </div>
  );
}

export function Atlas({ section }: { section: Theme | "all" }) {
  const lang = useLang();
  const stories = CARDS.filter((story) => story.locales[lang].written);
  const copy = useCopy(lang);
  const frame = useFrameCopy(lang);

  const all = [...stories].sort((a, b) => b.date.localeCompare(a.date));
  const sorted = all.filter((story) => section === "all" || story.theme === section);
  const latest = sorted[0];
  const home = section === "all";
  const cards = sorted.slice(1);

  if (stories.length === 0) {
    return (
      <main className="flex flex-col items-start gap-4 px-5 py-10 md:px-8">
        <p>{copy.emptyAtlas}</p>
      </main>
    );
  }

  const leadDek = latest?.locales[lang].dek?.trim() ?? "";

  return (
    <main>
      <div className="flex items-start justify-between gap-4 px-5 py-3.5 md:px-8 md:py-5">
        {section === "all" ? (
          <>
            <h1 className="home-sentence min-w-0 text-[1.15rem] leading-[1.3] min-[380px]:text-[1.45rem] md:text-[2.05rem]">
              <span className="block md:inline">{copy.heroLead}</span>{" "}
              <span className="block md:inline">{copy.hero}</span>
            </h1>
            <div className="flex h-[1.3em] shrink-0 items-center text-[1.15rem] min-[380px]:text-[1.45rem] md:text-[2.05rem]">
              <FrameTools />
            </div>
          </>
        ) : (
          <>
            <h1 className="min-w-0 text-2xl leading-tight md:text-3xl">{copy.themes[section]}</h1>
            <div className="flex h-[1.25em] shrink-0 items-center text-2xl md:text-3xl">
              <FrameTools />
            </div>
          </>
        )}
      </div>

      <div className="border-t border-rule">
        {latest ? (
          home ? (
            <HomeGrid stories={sorted} lang={lang} />
          ) : (
            <div className="self-start">
              <Link
                {...readLink(lang, latest.id)}
                className={`grid grid-cols-1 gap-6 border-b border-line px-5 py-7 md:px-8 md:py-10 ${
                  latest.image ? "md:grid-cols-2 md:items-center md:gap-10" : ""
                }`}
              >
                {latest.image ? <Picture story={latest} eager className="md:order-2" /> : null}
                <div className="flex flex-col gap-3 md:order-1">
                  <h2 className="text-3xl leading-[1.1] md:text-5xl">{storyTitle(latest, lang)}</h2>
                  {leadDek ? (
                    <p className="max-w-2xl text-pretty text-lg leading-snug text-muted lg:text-xl">
                      {leadDek}
                    </p>
                  ) : (
                    <p className="font-body line-clamp-4 max-w-2xl text-pretty text-base leading-snug text-muted">
                      {latest.locales[lang].lead}
                    </p>
                  )}
                  <Meta story={latest} lang={lang} section={section} />
                </div>
              </Link>
              {chunk(cards, 4).map((row) => (
                <div
                  key={row[0].id}
                  className={`grid grid-cols-1 divide-y divide-line border-b border-line md:divide-x md:divide-y-0 ${COLS[row.length]}`}
                >
                  {row.map((story) => (
                    <Column key={story.id} story={story} lang={lang} section={section} />
                  ))}
                </div>
              ))}
            </div>
          )
        ) : (
          <p className="px-5 py-10 text-muted md:px-8">{frame.emptySection}</p>
        )}
      </div>
    </main>
  );
}

const COLS: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size));
  return rows;
}

function oneSentence(text: string): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (!trimmed) return "";
  const match = trimmed.match(/^.*?[.!?؟۔](?=\s|$)/);
  return match ? match[0] : trimmed;
}

function cellSummary(story: Story, lang: Lang): string {
  const dek = story.locales[lang].dek?.trim();
  return oneSentence(dek || story.locales[lang].lead);
}

/**
 * The front page. On a wide screen: the lead reading with its picture across two columns
 * on the left and two readings in the narrow right column. Under them, the chain of
 * documents the lead rests on, then every other reading as one list of records whose depth
 * the reader sets: 1 title, 2 title and summary, 3 everything with a small picture.
 * On a phone: the lead, the chain, then the records.
 */
function HomeGrid({ stories, lang }: { stories: Story[]; lang: Lang }) {
  const dir = langMeta[lang].dir;
  const [lead, ...rest] = stories;
  const side = rest.slice(0, 2);
  if (!lead) return null;
  return (
    <div dir={dir}>
      <div className="md:hidden">
        <Link {...readLink(lang, lead.id)} className="group flex flex-col border-b border-ink">
          <CardPicture story={lead} lang={lang} ratio="aspect-[16/10]" eager />
          <div className="flex flex-col gap-2 px-5 pt-3.5 pb-5">
            <CardBody story={lead} lang={lang} size="lead" />
          </div>
        </Link>
      </div>

      <div className="hidden px-8 md:block">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.85fr)] border-b border-ink">
          <Link
            {...readLink(lang, lead.id)}
            style={{ gridColumn: "1 / span 2", gridRow: "1 / span 2" }}
            className="group flex min-w-0 flex-col gap-3 border-e border-ink py-7 pe-7"
          >
            <CardPicture story={lead} lang={lang} ratio="aspect-[16/10]" eager />
            <CardBody story={lead} lang={lang} size="lead" />
          </Link>
          {side.map((story, index) => (
            <Link
              key={story.id}
              {...readLink(lang, story.id)}
              style={{ gridColumn: "3", gridRow: String(index + 1) }}
              className={`group flex min-w-0 flex-col gap-2.5 py-7 ps-6 ${index === 0 ? "border-b border-ink" : ""}`}
            >
              <CardPicture story={story} lang={lang} ratio="aspect-[2/1]" />
              <CardBody story={story} lang={lang} size="side" />
            </Link>
          ))}
        </div>
      </div>

      <DocumentChain story={lead} lang={lang} />
      <Records stories={rest} sideCount={side.length} lang={lang} />
    </div>
  );
}

/** Words for the two front-page parts below the lead, in the five languages. */
const HOME_WORDS: Record<
  Lang,
  { chain: string; records: string; depth: [string, string, string] }
> = {
  tr: {
    chain: "Belge zinciri",
    records: "Kayıtlar",
    depth: ["Başlık", "Özet", "Tamamı"],
  },
  en: {
    chain: "Document chain",
    records: "Records",
    depth: ["Headline", "Summary", "Full"],
  },
  ar: {
    chain: "سلسلة الوثائق",
    records: "السجلات",
    depth: ["العنوان", "الملخص", "كامل"],
  },
  fr: {
    chain: "Chaîne de documents",
    records: "Registres",
    depth: ["Titre", "Résumé", "Complet"],
  },
  es: {
    chain: "Cadena de documentos",
    records: "Registros",
    depth: ["Titular", "Resumen", "Completo"],
  },
};

/** "IPCC – Sixth Assessment Report" becomes the issuer and the document name. */
function splitSource(label: string): { issuer: string; title: string } {
  const at = label.search(/\s[–—-]\s/);
  if (at < 0) return { issuer: "", title: label };
  return { issuer: label.slice(0, at).trim(), title: label.slice(at + 3).trim() };
}

/**
 * One ruled band under the lead, closed at first: its label and the lead's title. Opened, it
 * shows the documents the lead rests on, in order, each opening the document itself.
 * A reading without filed sources shows no band.
 */
function DocumentChain({ story, lang }: { story: Story; lang: Lang }) {
  const [open, setOpen] = useState(false);
  const sources = story.sources ?? [];
  if (sources.length === 0) return null;
  const words = HOME_WORDS[lang];
  const arrow = langMeta[lang].dir === "rtl" ? "←" : "→";
  const label =
    lang === "ar" ? "text-sm text-pine" : "text-xs uppercase tracking-[0.14em] text-pine";
  const panelId = `chain-${story.id}`;
  return (
    <section className="px-5 md:px-8" aria-label={words.chain}>
      <div className="border-b border-ink">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((was) => !was)}
          className="flex w-full items-center gap-3 py-4 text-start md:gap-5"
        >
          <span className={`shrink-0 ${label}`}>{words.chain}</span>
          <span className="paper-title min-w-0 flex-1 truncate text-[0.95rem] text-ink">
            {storyTitle(story, lang)}
          </span>
          <span
            aria-hidden="true"
            className={`shrink-0 text-ink transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
            >
              <path d="M2 4.5 6 8.5l4-4" />
            </svg>
          </span>
        </button>
        <div id={panelId} className="chain-panel" data-open={open}>
          <div>
            <ol className="flex flex-col gap-2 pb-4 sm:flex-row sm:items-stretch sm:gap-0">
              {sources.map((source, index) => {
                const { issuer, title } = splitSource(source.label);
                return (
                  <li key={source.n} className="flex min-w-0 flex-1 items-stretch">
                    {index > 0 ? (
                      <span
                        aria-hidden="true"
                        className="hidden shrink-0 self-center px-2.5 text-muted sm:block"
                      >
                        {arrow}
                      </span>
                    ) : null}
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      tabIndex={open ? 0 : -1}
                      className="group flex min-w-0 flex-1 flex-col justify-center border border-line bg-sheet px-3 py-2 hover:border-ink"
                    >
                      {issuer ? (
                        <span className={`truncate ${label} !text-muted`}>{issuer}</span>
                      ) : null}
                      <span className="font-body truncate text-[0.9rem] leading-snug text-ink group-hover:underline">
                        {title}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The first lines of the text, shown under the summary at depth 3. When the summary was
 * itself taken from those lines, the sentence already shown is not repeated.
 */
function openingLines(story: Story, lang: Lang, summary: string): string {
  const lead = story.locales[lang].lead.replace(/\s+/g, " ").trim();
  if (!lead) return "";
  const rest = summary && lead.startsWith(summary) ? lead.slice(summary.length).trim() : lead;
  return rest === summary ? "" : rest;
}

type Depth = 1 | 2 | 3;
const DEPTH_KEY = "orbis-depth";

function readDepth(): Depth {
  try {
    const saved = Number(window.localStorage.getItem(DEPTH_KEY));
    return saved === 1 || saved === 3 ? saved : 2;
  } catch {
    return 2;
  }
}

/**
 * Every reading after the lead, newest first, one per ruled row. The control on the right
 * sets how much of each row shows; the choice is kept in this browser.
 * The two readings of the right column are listed only on a phone, where that column is not shown.
 */
function Records({
  stories,
  sideCount,
  lang,
}: {
  stories: Story[];
  sideCount: number;
  lang: Lang;
}) {
  const words = HOME_WORDS[lang];
  const copy = useCopy(lang);
  const [depth, setDepth] = useState<Depth>(2);
  useEffect(() => setDepth(readDepth()), []);
  const choose = (next: Depth) => {
    setDepth(next);
    try {
      window.localStorage.setItem(DEPTH_KEY, String(next));
    } catch {
      /* private window: the choice lasts until the page closes */
    }
  };
  if (stories.length === 0) return null;
  const label =
    lang === "ar" ? "text-sm text-pine" : "text-xs uppercase tracking-[0.14em] text-pine";
  return (
    <section className="px-5 pt-6 pb-4 md:px-8 md:pt-8" aria-label={words.records}>
      <div className="flex items-center justify-between gap-4 border-b-[3px] border-ink pb-3">
        <h2 className={`font-body font-normal ${label}`}>{words.records}</h2>
        <div role="radiogroup" aria-label={words.records} className="flex items-center">
          {([1, 2, 3] as const).map((step) => (
            <button
              key={step}
              type="button"
              role="radio"
              aria-checked={depth === step}
              onClick={() => choose(step)}
              className={`border border-ink px-3 py-1 text-xs whitespace-nowrap transition-colors duration-200 md:px-3.5 ${
                step > 1 ? "-ms-px" : ""
              } ${depth === step ? "bg-ink text-paper" : "bg-transparent text-ink hover:bg-highlight"} ${
                lang === "ar" ? "" : "uppercase tracking-[0.1em]"
              }`}
            >
              {words.depth[step - 1]}
            </button>
          ))}
        </div>
      </div>
      <ol className="records" data-depth={depth}>
        {stories.map((story, index) => {
          const summary = cellSummary(story, lang);
          const opening = openingLines(story, lang, summary);
          const minutes = story.locales[lang].minutes;
          return (
            <li
              key={story.id}
              className={`border-b border-line ${index < sideCount ? "md:hidden" : ""}`}
            >
              <Link {...readLink(lang, story.id)} className="group flex items-start py-4 md:py-5">
                <div className="min-w-0 flex-1">
                  <h3 className="paper-title text-[1.2rem] leading-[1.2] font-bold text-ink decoration-1 underline-offset-[0.14em] group-hover:underline md:text-[1.35rem]">
                    {storyTitle(story, lang)}
                  </h3>
                  {summary ? (
                    <div className="record-layer" data-layer="2">
                      <div>
                        <p className="font-body max-w-3xl pt-1.5 text-pretty text-base leading-[1.35] text-ink">
                          {summary}
                        </p>
                      </div>
                    </div>
                  ) : null}
                  {opening ? (
                    <div className="record-layer" data-layer="3">
                      <div>
                        <p className="font-body line-clamp-4 max-w-3xl pt-2 text-pretty text-[0.95rem] leading-[1.45] text-muted">
                          {opening}
                        </p>
                      </div>
                    </div>
                  ) : null}
                  <p className={`mt-1.5 ${label}`}>
                    {copy.themes[story.theme]}
                    <span className="text-muted">
                      {" · "}
                      <span className="whitespace-nowrap">{formatDate(story.date, lang)}</span>
                    </span>
                  </p>
                  {minutes ? (
                    <div className="record-layer" data-layer="3">
                      <div>
                        <div className="pt-1">
                          <ReadTime minutes={minutes} lang={lang} pattern={copy.minRead} />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
                {story.image ? (
                  <div className="record-layer record-picture ms-5 shrink-0" data-layer="3">
                    <div>
                      <img
                        src={story.image.src}
                        alt={imageCaption(story.image, lang)}
                        width={160}
                        height={160}
                        loading="lazy"
                        decoding="async"
                        className="block aspect-square w-20 object-cover md:w-28"
                      />
                    </div>
                  </div>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

type CardSize = "lead" | "side" | "bottom" | "corner" | "more" | "list";

const CARD_TITLE: Record<CardSize, string> = {
  lead: "font-extrabold text-[1.95rem] leading-[1.1] md:text-[2.4rem] md:leading-[1.08] lg:text-[2.9rem]",
  side: "font-bold text-[1.3rem] leading-[1.15] lg:text-[1.45rem]",
  bottom: "font-bold text-[1.35rem] leading-[1.15] lg:text-[1.55rem]",
  corner: "font-bold text-[1.45rem] leading-[1.15] lg:text-[1.7rem]",
  more: "font-bold text-[1.15rem] leading-[1.2] lg:text-[1.25rem]",
  list: "font-bold text-[1.45rem] leading-[1.15]",
};

const CARD_SUMMARY: Record<CardSize, string> = {
  lead: "text-[1.0625rem] leading-[1.35] md:text-[1.3rem]",
  side: "text-base leading-[1.35]",
  bottom: "text-base leading-[1.35]",
  corner: "text-[1.0625rem] leading-[1.38]",
  more: "",
  list: "text-base leading-[1.35]",
};

/** Section name, title, the one-sentence summary and the reading time, in that order. */
function CardBody({ story, lang, size }: { story: Story; lang: Lang; size: CardSize }) {
  const copy = useCopy(lang);
  const summary = size === "more" ? "" : cellSummary(story, lang);
  const minutes = story.locales[lang].minutes;
  return (
    <>
      <p
        className={
          lang === "ar"
            ? "text-sm leading-snug text-pine"
            : "text-xs leading-snug uppercase tracking-[0.14em] text-pine"
        }
      >
        {copy.themes[story.theme]}
      </p>
      <h2
        className={`paper-title text-ink underline-offset-[0.14em] decoration-1 group-hover:underline ${CARD_TITLE[size]}`}
      >
        {storyTitle(story, lang)}
      </h2>
      {summary ? (
        <p className={`font-body text-pretty text-ink ${CARD_SUMMARY[size]}`}>{summary}</p>
      ) : null}
      {minutes ? <ReadTime minutes={minutes} lang={lang} pattern={copy.minRead} /> : null}
    </>
  );
}

function CardPicture({
  story,
  lang,
  ratio,
  eager = false,
}: {
  story: Story;
  lang: Lang;
  ratio: string;
  eager?: boolean;
}) {
  if (!story.image) return null;
  return (
    <img
      src={story.image.src}
      alt={imageCaption(story.image, lang)}
      width={1500}
      height={1000}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={`block w-full object-cover ${ratio}`}
    />
  );
}

function Column({
  story,
  lang,
  section,
  tall = false,
  className = "",
}: {
  story: Story;
  lang: Lang;
  section: Theme | "all";
  tall?: boolean;
  className?: string;
}) {
  const dek = story.locales[lang].dek?.trim();
  const excerpt = dek || story.locales[lang].lead;
  return (
    <Link
      {...readLink(lang, story.id)}
      className={`flex min-w-0 flex-col gap-2 px-5 py-6 md:py-8 lg:px-6 ${tall ? "md:aspect-[3/4]" : ""} ${className}`}
    >
      <h2 className="text-lg leading-snug">{storyTitle(story, lang)}</h2>
      {excerpt ? (
        <p
          className={`font-body text-pretty text-[15px] leading-snug text-muted ${dek ? "" : "line-clamp-3"}`}
        >
          {excerpt}
        </p>
      ) : null}
      <div className="md:mt-auto">
        <Meta story={story} lang={lang} section={section} />
      </div>
    </Link>
  );
}

function Picture({
  story,
  className = "",
  eager = false,
  fill = false,
}: {
  story: Story;
  className?: string;
  eager?: boolean;
  fill?: boolean;
}) {
  const lang = useLang();
  if (!story.image) return null;
  const img = (
    <img
      src={story.image.src}
      alt={imageCaption(story.image, lang)}
      width={1500}
      height={1000}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={
        fill
          ? "absolute inset-0 h-full w-full object-cover"
          : `aspect-[3/2] w-full max-w-full object-cover ${className}`
      }
    />
  );
  if (!fill) return img;
  return (
    <div className={`relative w-full md:flex-1 ${className}`}>
      <div aria-hidden="true" className="aspect-[3/2]" />
      {img}
    </div>
  );
}

export function HomePage() {
  return (
    <Shell section="all">
      <Atlas section="all" />
    </Shell>
  );
}

export function SectionPage({ theme }: { theme: Theme }) {
  return (
    <Shell section={theme}>
      <Atlas section={theme} />
    </Shell>
  );
}
