import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/shell";
import { useCopy } from "@/lib/i18n";
import { useLibrary } from "@/lib/library";
import { paragraphs, storyTitle } from "@/lib/text";
import { THEMES, type Lang, type Story, type Theme } from "@/lib/types";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <Shell>
      <Atlas />
    </Shell>
  );
}

function isSection(value: string): value is Theme | "all" {
  return value === "all" || (THEMES as readonly string[]).includes(value);
}

function cut(body: string, count: number): string {
  return paragraphs(body).slice(0, count).join(" ");
}

function Atlas() {
  const lang = useLibrary((s) => s.lang);
  const stories = useLibrary((s) => s.stories);
  const restoreSeed = useLibrary((s) => s.restoreSeed);
  const copy = useCopy(lang);
  const [section, setSection] = useState<Theme | "all">("all");

  const sorted = [...stories]
    .filter((story) => section === "all" || story.theme === section)
    .sort((a, b) => b.date.localeCompare(a.date));
  const latest = sorted[0];
  const right = sorted.slice(1, 3);
  const bottom = sorted.slice(3, 5);

  return (
    <main className="pb-16">
      {stories.length === 0 ? (
        <div className="flex flex-col items-start gap-4 px-5 py-10 md:px-8">
          <p>{copy.emptyAtlas}</p>
          <button
            type="button"
            onClick={() => void restoreSeed()}
            className="inline-flex min-h-11 items-center bg-pine px-4 text-paper"
          >
            {copy.restore}
          </button>
        </div>
      ) : !latest ? (
        <p className="px-5 py-10 text-muted md:px-8">{copy.emptyAtlas}</p>
      ) : (
        <>
          <div className="flex items-end justify-between gap-4 px-3 py-4 md:px-8 md:py-8">
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-widest text-muted">{copy.readings}</p>
              <h1 className="mt-1 truncate text-lg leading-tight">
                <Link to="/read/$storyId" params={{ storyId: latest.id }}>
                  01 {storyTitle(latest, lang)}
                </Link>
              </h1>
            </div>
            <nav className="flex shrink-0 items-center gap-4 text-sm">
              <Link to="/" className="inline-flex min-h-11 items-center">
                {copy.home}
              </Link>
              <label className="relative inline-flex items-center">
                <select
                  value={section}
                  aria-label={copy.sections}
                  onChange={(event) => {
                    const next = event.target.value;
                    setSection(isSection(next) ? next : "all");
                  }}
                  className="min-h-11 max-w-28 appearance-none bg-transparent pr-5 text-sm text-ink md:max-w-none"
                >
                  <option value="all">{copy.sections}</option>
                  {THEMES.map((theme) => (
                    <option key={theme} value={theme}>
                      {copy.themes[theme]}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-0 text-xs" aria-hidden="true">
                  ▾
                </span>
              </label>
            </nav>
          </div>
          <div className="border-t border-rule" />
          <div className="grid grid-cols-2 border-l border-rule">
            <Link
              to="/read/$storyId"
              params={{ storyId: latest.id }}
              className="row-span-2 flex min-w-0 flex-col gap-2 border-r border-b border-rule p-3 md:gap-4 md:p-8"
            >
              <h2 className="text-xl leading-tight md:text-4xl">{storyTitle(latest, lang)}</h2>
              <p className="font-body line-clamp-8 text-pretty text-sm leading-snug md:line-clamp-4 md:text-base md:leading-relaxed">
                {cut(latest.locales[lang].body, 2)}
              </p>
            </Link>
            {right.map((story) => (
              <Card key={story.id} story={story} lang={lang} />
            ))}
            {bottom.map((story) => (
              <Card key={story.id} story={story} lang={lang} />
            ))}
          </div>
        </>
      )}

      <ul className="mt-10 flex flex-col px-5 md:px-8">
        {THEMES.map((theme) => {
          const on = section === theme;
          return (
            <li key={theme}>
              <button
                type="button"
                onClick={() => setSection(on ? "all" : theme)}
                className={
                  on
                    ? "inline-flex min-h-11 items-center gap-3 border-b border-ink text-left"
                    : "inline-flex min-h-11 items-center gap-3 text-left"
                }
              >
                <span aria-hidden="true">•</span>
                {copy.themes[theme]}
              </button>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

function Card({ story, lang }: { story: Story; lang: Lang }) {
  const title = storyTitle(story, lang);
  const excerpt = cut(story.locales[lang].body, 1);
  return (
    <Link
      to="/read/$storyId"
      params={{ storyId: story.id }}
      className="flex min-w-0 flex-col gap-2 border-r border-b border-rule p-3 md:gap-3 md:p-8"
    >
      <h2 className="text-base leading-tight md:text-2xl">{title}</h2>
      {excerpt ? (
        <p className="font-body line-clamp-3 text-pretty text-[13px] leading-snug text-muted md:text-base">{excerpt}</p>
      ) : null}
    </Link>
  );
}
