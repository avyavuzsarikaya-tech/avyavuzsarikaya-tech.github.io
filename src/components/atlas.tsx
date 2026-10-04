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
 * is a touching line grid: a tall lead cell, then the other readings.
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

function HomeGrid({ stories, lang }: { stories: Story[]; lang: Lang }) {
  const dir = langMeta[lang].dir;
  return (
    <>
      <div dir={dir} className="grid grid-cols-2 border-l border-rule md:hidden">
        {stories.map((story, index) => (
          <HomeCell key={story.id} story={story} lang={lang} place={phonePlace(index)} lead={index === 0} />
        ))}
      </div>
      <div dir={dir} className="hidden border-l border-rule md:grid md:grid-cols-3">
        {stories.map((story, index) => (
          <HomeCell key={story.id} story={story} lang={lang} place={deskPlace(index)} lead={index === 0} />
        ))}
      </div>
    </>
  );
}

function phonePlace(index: number): { column: number; row: number; rowSpan?: number } {
  if (index === 0) return { column: 1, row: 1, rowSpan: 2 };
  if (index === 1) return { column: 2, row: 1 };
  if (index === 2) return { column: 2, row: 2 };
  const n = index - 3;
  return { column: (n % 2) + 1, row: 3 + Math.floor(n / 2) };
}

function deskPlace(index: number): { column: number; row: number; columnSpan?: number; rowSpan?: number } {
  if (index === 0) return { column: 1, row: 1, columnSpan: 2, rowSpan: 2 };
  if (index === 1) return { column: 3, row: 1 };
  if (index === 2) return { column: 3, row: 2 };
  if (index === 3) return { column: 3, row: 3 };
  if (index === 4) return { column: 1, row: 3 };
  if (index === 5) return { column: 2, row: 3 };
  const n = index - 6;
  return { column: (n % 3) + 1, row: 4 + Math.floor(n / 3) };
}

function HomeCell({
  story,
  lang,
  place,
  lead,
}: {
  story: Story;
  lang: Lang;
  place: { column: number; row: number; columnSpan?: number; rowSpan?: number };
  lead: boolean;
}) {
  const summary = cellSummary(story, lang);
  return (
    <Link
      {...readLink(lang, story.id)}
      style={{
        gridColumn: `${place.column} / span ${place.columnSpan ?? 1}`,
        gridRow: `${place.row} / span ${place.rowSpan ?? 1}`,
      }}
      className="flex min-w-0 flex-col gap-3 border-r border-b border-rule p-4 md:p-8"
    >
      <h2 className={lead ? "text-2xl leading-[1.12] md:text-4xl" : "text-base leading-snug md:text-xl"}>
        {storyTitle(story, lang)}
      </h2>
      {summary ? <p className="font-body text-pretty text-[15px] leading-snug text-muted">{summary}</p> : null}
      <span aria-hidden="true" className="mt-auto block h-px w-8 bg-ink" />
    </Link>
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
