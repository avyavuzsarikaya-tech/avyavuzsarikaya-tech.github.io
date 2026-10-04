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
 * page, then the other readings in ruled columns under it. From tablet width up the front
 * page alone breaks that row into an editorial grid on tablets and horizontal rows on
 * desktop; a phone and every section page keep the ruled columns.
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
          <div className="self-start">
            <Link
              {...readLink(lang, latest.id)}
              className={`grid grid-cols-1 gap-6 border-b border-line px-5 py-7 md:px-8 md:py-10 ${
                latest.image
                  ? home
                    ? "md:grid-cols-12 md:items-center md:gap-10 lg:gap-14 lg:px-10 lg:py-12"
                    : "md:grid-cols-2 md:items-center md:gap-10"
                  : ""
              }`}
            >
              {latest.image ? (
                <Picture
                  story={latest}
                  eager
                  className={
                    home ? "md:order-2 md:col-span-7 md:aspect-[16/10]" : "md:order-2"
                  }
                />
              ) : null}
              <div
                className={`flex flex-col gap-3 md:order-1 ${
                  home ? "md:col-span-5 md:justify-center md:gap-5 md:pe-2" : ""
                }`}
              >
                <h2
                  className={`text-3xl leading-[1.1] md:text-5xl ${
                    home ? "lg:text-[3.35rem] lg:leading-[1.04]" : ""
                  }`}
                >
                  {storyTitle(latest, lang)}
                </h2>
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
            {home ? (
              cards.length ? (
                <>
                  <div className="grid grid-cols-1 divide-y divide-line border-b border-line md:hidden">
                    {cards.map((story) => (
                      <Column key={story.id} story={story} lang={lang} section={section} tall />
                    ))}
                  </div>
                  <HomeDesk cards={cards} lang={lang} section={section} />
                  <HomeList cards={cards} lang={lang} section={section} />
                </>
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

const HOME_COLUMNS = 5;

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size));
  return rows;
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

function HomeDesk({
  cards,
  lang,
  section,
}: {
  cards: Story[];
  lang: Lang;
  section: Theme | "all";
}) {
  const [lead, beside, ...rest] = cards;
  return (
    <div className="hidden border-b border-line md:block lg:hidden">
      <div className="grid grid-cols-12 divide-x divide-line">
        {lead ? (
          <DeskCard
            story={lead}
            lang={lang}
            section={section}
            large
            className={beside ? "col-span-7" : "col-span-12"}
          />
        ) : null}
        {beside ? (
          <DeskCard story={beside} lang={lang} section={section} className="col-span-5" />
        ) : null}
      </div>
      {rest.length ? (
        <div
          className={`grid divide-x divide-line border-t border-line ${
            rest.length === 1 ? "grid-cols-1" : rest.length === 2 ? "grid-cols-2" : "grid-cols-3"
          }`}
        >
          {rest.map((story) => (
            <DeskCard key={story.id} story={story} lang={lang} section={section} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function HomeList({
  cards,
  lang,
  section,
}: {
  cards: Story[];
  lang: Lang;
  section: Theme | "all";
}) {
  return (
    <div className="hidden divide-y divide-line border-b border-line lg:block">
      {cards.map((story) => {
        const dek = story.locales[lang].dek?.trim();
        const excerpt = dek || story.locales[lang].lead;
        return (
          <Link
            key={story.id}
            {...readLink(lang, story.id)}
            className="grid min-w-0 grid-cols-[11rem_minmax(0,1fr)_11rem] items-start gap-8 px-10 py-8"
          >
            <div className="min-w-0">
              {story.image ? (
                <Picture story={story} className="aspect-[3/2]" />
              ) : null}
            </div>
            <div className="flex min-w-0 flex-col gap-3">
              <h2 className="text-xl leading-snug">{storyTitle(story, lang)}</h2>
              {excerpt ? (
                <p
                  className={`font-body text-pretty text-[15px] leading-snug text-muted ${
                    dek ? "" : "line-clamp-3"
                  }`}
                >
                  {excerpt}
                </p>
              ) : null}
            </div>
            <div className="min-w-0">
              <Meta story={story} lang={lang} section={section} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function DeskCard({
  story,
  lang,
  section,
  large = false,
  className = "",
}: {
  story: Story;
  lang: Lang;
  section: Theme | "all";
  large?: boolean;
  className?: string;
}) {
  const dek = story.locales[lang].dek?.trim();
  const excerpt = dek || story.locales[lang].lead;
  return (
    <Link
      {...readLink(lang, story.id)}
      className={`flex min-w-0 flex-col gap-4 px-8 py-8 ${className}`}
    >
      {story.image ? (
        <img
          src={story.image.src}
          alt={imageCaption(story.image, lang)}
          width={1500}
          height={1000}
          loading="lazy"
          decoding="async"
          className={`w-full object-cover ${large ? "aspect-[3/2]" : "aspect-[16/10]"}`}
        />
      ) : null}
      <h2 className={large ? "text-[1.85rem] leading-[1.12]" : "text-xl leading-snug"}>
        {storyTitle(story, lang)}
      </h2>
      {excerpt ? (
        <p
          className={`font-body text-pretty leading-snug text-muted ${large ? "text-base" : "text-[15px]"} ${
            dek ? "" : "line-clamp-3"
          }`}
        >
          {excerpt}
        </p>
      ) : null}
      <div className="mt-auto">
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
