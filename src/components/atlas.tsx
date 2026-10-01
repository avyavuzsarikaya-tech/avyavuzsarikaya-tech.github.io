import { Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { useFrameCopy } from "@/lib/frame-copy";
import { useCopy } from "@/lib/i18n";
import { readLink } from "@/lib/lang-path";
import { CARDS } from "@/lib/seed";
import { formatDate, storyTitle } from "@/lib/text";
import type { Lang, StoryCard as Story, Theme } from "@/lib/types";
import { useLang } from "@/lib/use-lang";

/**
 * The front page grid and the section pages share this layout: the lead reading, the
 * cards around it, and the index of further readings on the right.
 */

function Meta({ story, lang, section }: { story: Story; lang: Lang; section: Theme | "all" }) {
  const copy = useCopy(lang);
  const minutes = story.locales[lang].minutes;
  // The section name and date close the card, under the text, so the line never sits
  // under a picture where it would read as the picture's caption. A section page names
  // its section once in its own title, so its cards skip it. The reading time sits at
  // the far end of the same line, plain; it is worked out from the text.
  return (
    <div className="mt-1 flex items-baseline justify-between gap-3 text-xs text-muted">
      <p>
        {section === "all" ? (
          <>
            <span className="uppercase tracking-widest text-pine">{copy.themes[story.theme]}</span>
            {" · "}
          </>
        ) : null}
        {formatDate(story.date, lang)}
      </p>
      {minutes ? (
        <p className="shrink-0 tabular-nums">{copy.minRead.replace("{n}", String(minutes))}</p>
      ) : null}
    </div>
  );
}

export function Atlas({ section }: { section: Theme | "all" }) {
  const lang = useLang();
  const stories = CARDS;
  const copy = useCopy(lang);
  const frame = useFrameCopy(lang);

  const all = [...stories].sort((a, b) => b.date.localeCompare(a.date));
  const sorted = all.filter((story) => section === "all" || story.theme === section);
  const latest = sorted[0];
  // Three-by-three grid: the lead fills the top-left four cells, three cards run down
  // the right and three across the bottom, the corner card belonging to both.
  // Up to one more full row of three follows underneath.
  const cards = sorted.slice(1, 9);
  const alone = cards.length === 0;
  // On phones everything stacks in one column; the grid starts at tablet width.
  const leadSpan = alone
    ? "md:col-span-3"
    : cards.length === 1
      ? "md:col-span-2"
      : "md:col-span-2 md:row-span-2";
  // The index lists only stories the grid does not already show.
  const rest = section === "all" ? all.slice(9) : all;
  // A row with fewer than three cards stretches so it never leaves a hole.
  const cardSpan = (n: number) => {
    if (n < 2) return "";
    const row = Math.floor((n - 2) / 3);
    const inRow = Math.min(3, cards.length - 2 - row * 3);
    if (inRow === 1) return "md:col-span-3";
    if (inRow === 2 && (n - 2) % 3 === 0) return "md:col-span-2";
    return "";
  };

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
      <div className="px-5 py-6 md:px-8 md:py-8">
        <p className="kicker text-xs uppercase tracking-widest text-muted">{copy.readings}</p>
        <h1 className="mt-1 text-2xl leading-tight md:text-3xl">
          {section === "all" ? copy.hero : copy.themes[section]}
        </h1>
      </div>

      <div
        className={`grid border-t border-rule ${rest.length > 0 ? "lg:grid-cols-[minmax(0,1fr)_20rem]" : ""}`}
      >
        {latest ? (
          <div className="grid grid-cols-1 self-start md:grid-cols-3">
            <Link
              {...readLink(lang, latest.id)}
              className={`${leadSpan} flex min-w-0 flex-col gap-3 border-b border-rule px-5 py-7 md:border-r md:px-8 md:py-8 md:rtl:border-r-0 md:rtl:border-l`}
            >
              {latest.image ? (
                <Picture story={latest} eager className={alone ? "max-w-3xl" : ""} />
              ) : null}
              {/* Without a picture the text settles at the foot of the lead frame, so the
                  height reads as air above a headline rather than an empty box. */}
              <div
                className={`flex flex-col gap-3 ${latest.image || alone ? "" : "md:mt-auto md:pt-16"}`}
              >
                <h2
                  className={
                    alone
                      ? "max-w-3xl text-3xl leading-tight md:text-5xl"
                      : "text-3xl leading-[1.1] md:text-5xl"
                  }
                >
                  {storyTitle(latest, lang)}
                </h2>
                {/* Title, the reading's own summary in full, then section, date and the reading time.
                    The picture sits above the headline. The text itself starts on the reading page. */}
                {leadDek ? (
                  <p
                    className={
                      alone
                        ? "max-w-3xl text-pretty text-lg leading-snug text-muted md:text-xl"
                        : "max-w-2xl text-pretty text-lg leading-snug text-muted lg:text-xl"
                    }
                  >
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
            {cards.map((story, n) => (
              <Card
                key={story.id}
                story={story}
                lang={lang}
                section={section}
                span={cardSpan(n)}
                second={n === 0}
              />
            ))}
          </div>
        ) : (
          <p className="px-5 py-10 text-muted md:px-8">{frame.emptySection}</p>
        )}

        {rest.length > 0 ? (
          <aside className="flex flex-col gap-10 px-5 py-8 md:px-8">
            {rest.length > 0 ? (
              <section aria-labelledby="index-title">
                <h2
                  id="index-title"
                  className="kicker text-xs font-normal uppercase tracking-widest text-muted"
                  style={{ fontFamily: "inherit" }}
                >
                  {frame.index}
                </h2>
                <ol className="mt-3 flex flex-col">
                  {rest.map((story, n) => (
                    <li key={story.id} className="border-b border-line last:border-b-0">
                      <Link
                        {...readLink(lang, story.id)}
                        className="grid grid-cols-[1.75rem_1fr] gap-2 py-2.5"
                      >
                        <span className="pt-0.5 text-xs tabular-nums text-muted">
                          {String(n + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm leading-snug">
                            {storyTitle(story, lang)}
                          </span>
                          <span className="mt-0.5 block text-[11px] text-muted/70">
                            {formatDate(story.date, lang)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}
          </aside>
        ) : null}
      </div>
    </main>
  );
}

function Card({
  story,
  lang,
  section,
  span = "",
  second = false,
}: {
  story: Story;
  lang: Lang;
  section: Theme | "all";
  span?: string;
  second?: boolean;
}) {
  const title = storyTitle(story, lang);
  // The card shows the reading's own one-sentence summary, in full.
  // Only a reading without one falls back to the start of its text.
  const dek = story.locales[lang].dek?.trim();
  const excerpt = dek || story.locales[lang].lead;
  // The second reading stands a step above the rest, so the eye moves
  // lead, then second, then the row. Small cards part by space, not by rules.
  return (
    <Link
      {...readLink(lang, story.id)}
      className={`${span} flex min-w-0 flex-col gap-2 border-b border-line px-5 md:px-8 ${second ? "gap-3 py-6 md:py-7" : "py-5"}`}
    >
      {story.image ? <Picture story={story} /> : null}
      <h2
        className={
          second ? "text-2xl leading-tight lg:text-3xl" : "text-lg leading-snug lg:text-xl"
        }
      >
        {title}
      </h2>
      {excerpt ? (
        <p
          className={[
            "font-body text-pretty leading-snug text-muted",
            second ? "text-base md:text-lg" : "text-[15px]",
            dek ? "" : "line-clamp-3 md:line-clamp-2",
          ].join(" ")}
        >
          {excerpt}
        </p>
      ) : null}
      <Meta story={story} lang={lang} section={section} />
    </Link>
  );
}

/** The reading's painting, cropped to a steady 3:2 frame so the grid keeps its rhythm. */
function Picture({
  story,
  className = "",
  eager = false,
}: {
  story: Story;
  className?: string;
  eager?: boolean;
}) {
  if (!story.image) return null;
  return (
    <img
      src={story.image.src}
      alt={story.image.credit}
      width={1500}
      height={1000}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={`aspect-[3/2] w-full max-w-full object-cover ${className}`}
    />
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
