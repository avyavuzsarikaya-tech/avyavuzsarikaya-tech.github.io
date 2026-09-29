import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { useFrameCopy } from "@/lib/frame-copy";
import { useCopy } from "@/lib/i18n";
import { useLibrary } from "@/lib/library";
import { formatDate, paragraphs, storyTitle } from "@/lib/text";
import { toTheme, type Lang, type Story, type Theme } from "@/lib/types";

type HomeSearch = { s?: Theme };

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): HomeSearch => {
    const s = typeof search.s === "string" && search.s ? toTheme(search.s) : undefined;
    return s ? { s } : {};
  },
  component: Home,
});

function Home() {
  const { s } = Route.useSearch();
  return (
    <Shell section={s ?? "all"}>
      <Atlas section={s ?? "all"} />
    </Shell>
  );
}

/** First paragraphs as plain text: source markers like [1] are dropped for the cards. */
function cut(body: string, count: number): string {
  return paragraphs(body)
    .slice(0, count)
    .join(" ")
    .replace(/\s*\[\d+\]/g, "")
    .trim();
}

function Meta({ story, lang }: { story: Story; lang: Lang }) {
  const copy = useCopy(lang);
  return (
    <p className="text-xs uppercase tracking-widest text-pine">
      {copy.themes[story.theme]}
      <span className="hidden text-muted normal-case tracking-normal md:inline">
        {" "}
        · {formatDate(story.date, lang)}
      </span>
    </p>
  );
}

function Atlas({ section }: { section: Theme | "all" }) {
  const lang = useLibrary((s) => s.lang);
  const stories = useLibrary((s) => s.stories);
  const restoreSeed = useLibrary((s) => s.restoreSeed);
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
  const leadSpan = alone
    ? "col-span-3"
    : cards.length === 1
      ? "col-span-2"
      : "col-span-2 row-span-2";
  // The index lists only stories the grid does not already show.
  const rest = section === "all" ? all.slice(9) : all;
  // A row with fewer than three cards stretches so it never leaves a hole.
  const cardSpan = (n: number) => {
    if (n < 2) return "";
    const row = Math.floor((n - 2) / 3);
    const inRow = Math.min(3, cards.length - 2 - row * 3);
    if (inRow === 1) return "col-span-3";
    if (inRow === 2 && (n - 2) % 3 === 0) return "col-span-2";
    return "";
  };

  if (stories.length === 0) {
    return (
      <main className="flex flex-col items-start gap-4 px-5 py-10 md:px-8">
        <p>{copy.emptyAtlas}</p>
        <button
          type="button"
          onClick={() => void restoreSeed()}
          className="inline-flex min-h-11 items-center bg-pine px-4 text-paper"
        >
          {copy.restore}
        </button>
      </main>
    );
  }

  return (
    <main>
      <div className="px-5 py-6 md:px-8 md:py-8">
        <p className="text-xs uppercase tracking-widest text-muted">{copy.readings}</p>
        <h1 className="mt-1 text-2xl leading-tight md:text-3xl">
          {section === "all" ? copy.hero : copy.themes[section]}
        </h1>
      </div>

      <div
        className={`grid border-t border-rule ${rest.length > 0 ? "lg:grid-cols-[minmax(0,1fr)_20rem]" : ""}`}
      >
        {latest ? (
          <div className="grid grid-cols-3 self-start">
            <Link
              to="/read/$storyId"
              params={{ storyId: latest.id }}
              className={`${leadSpan} flex min-w-0 flex-col gap-2 border-r border-b border-rule p-3 md:gap-3 md:px-8 md:py-6 rtl:border-r-0 rtl:border-l`}
            >
              <Meta story={latest} lang={lang} />
              <h2
                className={
                  alone
                    ? "max-w-3xl text-3xl leading-tight md:text-5xl"
                    : "text-xl leading-tight md:text-4xl"
                }
              >
                {storyTitle(latest, lang)}
              </h2>
              {latest.locales[lang].dek ? (
                <p
                  className={
                    alone
                      ? "max-w-3xl text-pretty text-lg leading-snug text-muted md:text-xl"
                      : "hidden text-pretty text-lg leading-snug text-muted lg:block lg:text-xl"
                  }
                >
                  {latest.locales[lang].dek}
                </p>
              ) : null}
              {alone ? (
                <p className="font-body line-clamp-[10] max-w-3xl text-pretty text-base leading-relaxed md:line-clamp-none md:text-lg">
                  {cut(latest.locales[lang].body, 3)}
                </p>
              ) : (
                <div className="relative md:min-h-24 md:flex-1">
                  <p className="font-body line-clamp-8 text-pretty text-sm leading-snug md:absolute md:inset-0 md:line-clamp-none md:overflow-hidden md:text-base md:leading-relaxed">
                    {cut(latest.locales[lang].body, 6)}
                  </p>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-10 bg-gradient-to-t from-paper to-transparent md:block"
                  />
                </div>
              )}
              <EndMark />
            </Link>
            {cards.map((story, n) => (
              <Card key={story.id} story={story} lang={lang} span={cardSpan(n)} />
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
                  className="text-xs font-normal uppercase tracking-widest text-muted"
                  style={{ fontFamily: "inherit" }}
                >
                  {frame.index}
                </h2>
                <ol className="mt-3 flex flex-col">
                  {rest.map((story, n) => (
                    <li key={story.id} className="border-b border-line">
                      <Link
                        to="/read/$storyId"
                        params={{ storyId: story.id }}
                        className="grid grid-cols-[2rem_1fr] gap-2 py-3"
                      >
                        <span className="tabular-nums text-sm text-pine">
                          {String(n + 1 + (all.length - rest.length)).padStart(2, "0")}
                        </span>
                        <span className="min-w-0">
                          <span className="block leading-snug">{storyTitle(story, lang)}</span>
                          <span className="mt-1 block text-xs text-muted">
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

function EndMark() {
  return (
    <span aria-hidden="true" className="mx-auto mt-1 flex w-16 items-center gap-2 md:w-24 md:gap-3">
      <span className="h-px flex-1 bg-rule" />
      <span className="size-1 rounded-full bg-ink md:size-1.5" />
      <span className="h-px flex-1 bg-rule" />
    </span>
  );
}

function Card({ story, lang, span = "" }: { story: Story; lang: Lang; span?: string }) {
  const title = storyTitle(story, lang);
  const excerpt = cut(story.locales[lang].body, 1);
  return (
    <Link
      to="/read/$storyId"
      params={{ storyId: story.id }}
      className={`${span} flex min-w-0 flex-col gap-2 border-r border-b border-rule p-3 md:gap-2 md:px-8 md:py-5 rtl:border-r-0 rtl:border-l`}
    >
      <Meta story={story} lang={lang} />
      <h2 className="text-base leading-tight md:text-xl lg:text-2xl">{title}</h2>
      {excerpt ? (
        <p className="font-body line-clamp-3 text-pretty text-[13px] leading-snug text-muted md:line-clamp-2 md:text-base">
          {excerpt}
        </p>
      ) : null}
      <EndMark />
    </Link>
  );
}
