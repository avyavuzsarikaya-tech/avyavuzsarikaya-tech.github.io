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
 * The front page is laid out like a newspaper page. On a wide screen: the lead reading
 * with its picture across two columns on the left, two readings with pictures in the
 * narrow right column, then a row of two pictured readings and a corner reading without
 * a picture, and below a thick rule the rest in columns of four, text only. On a phone:
 * the lead with its picture, then every other reading as text, a thick rule every third.
 */
function HomeGrid({ stories, lang }: { stories: Story[]; lang: Lang }) {
  const dir = langMeta[lang].dir;
  const [lead, ...rest] = stories;
  const side = rest.slice(0, 2);
  const bottom = rest.slice(2, 4);
  const corner = rest[4];
  const more = rest.slice(5);
  if (!lead) return null;
  return (
    <div dir={dir}>
      <div className="md:hidden">
        <Link {...readLink(lang, lead.id)} className="group flex flex-col border-b-[3px] border-ink">
          <CardPicture story={lead} lang={lang} ratio="aspect-[16/10]" eager />
          <div className="flex flex-col gap-2 px-5 pt-3.5 pb-5">
            <CardBody story={lead} lang={lang} size="lead" />
          </div>
        </Link>
        <ol className="px-5">
          {rest.map((story, index) => (
            <li
              key={story.id}
              className={
                index === rest.length - 1
                  ? ""
                  : index % 3 === 2
                    ? "border-b-[3px] border-ink"
                    : "border-b border-ink"
              }
            >
              <Link {...readLink(lang, story.id)} className="group flex flex-col gap-2 py-4">
                <CardBody story={story} lang={lang} size="list" />
              </Link>
            </li>
          ))}
        </ol>
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
              className="group flex min-w-0 flex-col gap-2.5 border-b border-ink py-7 ps-6"
            >
              <CardPicture story={story} lang={lang} ratio="aspect-[2/1]" />
              <CardBody story={story} lang={lang} size="side" />
            </Link>
          ))}
          {bottom.map((story, index) => (
            <Link
              key={story.id}
              {...readLink(lang, story.id)}
              style={{ gridColumn: String(index + 1), gridRow: "3" }}
              className={`group flex min-w-0 flex-col gap-2.5 border-t border-e border-ink py-6 ${
                index === 0 ? "pe-6" : "px-6"
              }`}
            >
              <CardPicture story={story} lang={lang} ratio="aspect-[2/1]" />
              <CardBody story={story} lang={lang} size="bottom" />
            </Link>
          ))}
          {corner ? (
            <Link
              {...readLink(lang, corner.id)}
              style={{ gridColumn: "3", gridRow: "3" }}
              className="group flex min-w-0 flex-col gap-2.5 py-6 ps-6"
            >
              <CardBody story={corner} lang={lang} size="corner" />
            </Link>
          ) : null}
        </div>

        {more.length > 0 ? (
          <div className="mt-7 border-t-[3px] border-ink">
            {chunk(more, 4).map((row, rowIndex) => (
              <div
                key={row[0].id}
                className={`grid grid-cols-4 ${rowIndex > 0 ? "border-t border-ink" : ""}`}
              >
                {row.map((story, index) => (
                  <Link
                    key={story.id}
                    {...readLink(lang, story.id)}
                    className={`group flex min-w-0 flex-col gap-2 py-5 ${
                      index === 0 ? "pe-5" : "border-s border-ink px-5"
                    }`}
                  >
                    <CardBody story={story} lang={lang} size="more" />
                  </Link>
                ))}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
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
          lang === "ar" ? "text-sm leading-snug text-pine" : "text-xs leading-snug uppercase tracking-[0.14em] text-pine"
        }
      >
        {copy.themes[story.theme]}
      </p>
      <h2
        className={`paper-title text-ink underline-offset-[0.14em] decoration-1 group-hover:underline ${CARD_TITLE[size]}`}
      >
        {storyTitle(story, lang)}
      </h2>
      {summary ? <p className={`font-body text-pretty text-ink ${CARD_SUMMARY[size]}`}>{summary}</p> : null}
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
        <p className={`font-body text-pretty text-[15px] leading-snug text-muted ${dek ? "" : "line-clamp-3"}`}>
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
        fill ? "absolute inset-0 h-full w-full object-cover" : `aspect-[3/2] w-full max-w-full object-cover ${className}`
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
