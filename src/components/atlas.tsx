import { Link } from "@tanstack/react-router";
import { ReadTime } from "@/components/read-time";
import { FrameTools, Shell } from "@/components/shell";
import { useFrameCopy } from "@/lib/frame-copy";
import { imageCaption } from "@/lib/editorial";
import { useCopy } from "@/lib/i18n";
import { readLink } from "@/lib/lang-path";
import { CARDS } from "@/lib/seed";
import { formatDate, storyTitle } from "@/lib/text";
import type { Lang, StoryCard as Story, Theme } from "@/lib/types";
import { useLang } from "@/lib/use-lang";

/**
 * The front page and the section pages share this layout: the lead reading across the
 * page, then the other readings in ruled columns under it.
 */

function Meta({ story, lang, section }: { story: Story; lang: Lang; section: Theme | "all" }) {
  const copy = useCopy(lang);
  const minutes = story.locales[lang].minutes;
  // The section name and date close the card, under the text, so the line never sits
  // under a picture where it would read as the picture's caption. A section page names
  // its section once in its own title, so its cards skip it. The reading time, worked
  // out from the text, always takes its own line under the date, in every card and at
  // every width, so it never jumps from the far right to under the date when a card
  // narrows.
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
  // A reading not yet written in this language stays off this language's pages.
  const stories = CARDS.filter((story) => story.locales[lang].written);
  const copy = useCopy(lang);
  const frame = useFrameCopy(lang);

  const all = [...stories].sort((a, b) => b.date.localeCompare(a.date));
  const sorted = all.filter((story) => section === "all" || story.theme === section);
  const latest = sorted[0];
  // The lead across the page, then the other readings in rows. The front page carries a
  // single row of five tall columns under the lead; a section page keeps all its readings
  // in rows of four.
  const home = section === "all";
  const cards = home ? sorted.slice(1, 1 + HOME_COLUMNS) : sorted.slice(1);

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
      {/* Menu, language and scheme sit on the first line of the heading: the box that holds
          them takes the heading's own size and line height, so its middle is that line's
          middle in every language and at every width. */}
      {/* On the front page this row holds the motto and the tools at every width; the
          masthead above it carries the name alone. */}
      <div className="flex items-start justify-between gap-4 px-5 py-3.5 md:px-8 md:py-5">
        {section === "all" ? (
          <>
            <h1 className="home-sentence min-w-0 text-[1.15rem] leading-[1.3] min-[380px]:text-[1.45rem] md:text-[2.05rem]">
              {/* Two lines on a phone, one line on a wider screen. */}
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
          <div className="self-start">
            {/* The lead runs across the page: its words on one side, its picture on the
                other; on a phone the picture comes first and the words under it. */}
            <Link
              {...readLink(lang, latest.id)}
              className={`grid grid-cols-1 gap-6 border-b border-line px-5 py-7 md:px-8 md:py-10 ${latest.image ? "md:grid-cols-2 md:items-center md:gap-10" : ""}`}
            >
              {latest.image ? <Picture story={latest} eager className="md:order-2" /> : null}
              <div className="flex flex-col gap-3 md:order-1">
                <h2 className="text-3xl leading-[1.1] md:text-5xl">{storyTitle(latest, lang)}</h2>
                {/* Title, the reading's own summary in full, then section, date and the reading time. */}
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
            {/* The other readings stand side by side, parted by thin rules, text only, so
                every column starts and ends on the same lines. On the front page they make
                one row of five columns taller than they are wide; a tablet shows the first
                three of them, a phone all five one under another. */}
            {home ? (
              cards.length ? (
                <div
                  className={`grid grid-cols-1 divide-y divide-line border-b border-line md:divide-x md:divide-y-0 ${HOME_COLS[cards.length]}`}
                >
                  {cards.map((story, n) => (
                    <Column
                      key={story.id}
                      story={story}
                      lang={lang}
                      section={section}
                      tall
                      className={n >= 3 ? "md:hidden lg:flex" : ""}
                    />
                  ))}
                </div>
              ) : null
            ) : (
              chunk(cards, 4).map((row) => (
                <div
                  key={row[0].id}
                  className={`grid grid-cols-1 divide-y divide-line border-b border-line md:divide-x md:divide-y-0 ${COLS[row.length]}`}
                >
                  {row.map((story) => (
                    <Column key={story.id} story={story} lang={lang} section={section} />
                  ))}
                </div>
              ))
            )}
          </div>
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

/** How many readings stand in the front page's row under the lead. */
const HOME_COLUMNS = 5;

/** The front page row: three columns on a tablet, all five from a laptop up. */
const HOME_COLS: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-3 lg:grid-cols-4",
  5: "md:grid-cols-3 lg:grid-cols-5",
};

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size));
  return rows;
}

/** One reading in the row of columns: title, its one-sentence summary, then the meta line. */
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
  // A tall column is at least a third taller than it is wide from tablet width up; a
  // longer text makes it taller still, and its neighbours follow, so the row stays even.
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

/**
 * The reading's picture, cropped to a steady 3:2 frame so the grid keeps its rhythm.
 * With `fill`, the lead picture grows taller when the cards beside it run longer, so the
 * lead frame never ends in an empty band; it never gets shorter than 3:2.
 */
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

/** The front page, in the language of its address. */
export function HomePage() {
  return (
    <Shell section="all">
      <Atlas section="all" />
    </Shell>
  );
}

/** One section of the atlas, in the language of its address. */
export function SectionPage({ theme }: { theme: Theme }) {
  return (
    <Shell section={theme}>
      <Atlas section={theme} />
    </Shell>
  );
}
