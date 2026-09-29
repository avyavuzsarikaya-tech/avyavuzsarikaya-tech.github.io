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
  const beside = sorted.slice(1, 3);
  const after = sorted.slice(3);

  return (
    <main className="px-5 pb-16 md:px-8">
      {stories.length === 0 ? (
        <div className="flex flex-col items-start gap-4 border-t border-line py-10">
          <p>{copy.emptyAtlas}</p>
          <button
            type="button"
            onClick={() => void restoreSeed()}
            className="inline-flex min-h-11 items-center bg-pine px-4 text-paper"
          >
            {copy.restore}
          </button>
        </div>
      ) : sorted.length === 0 || !latest ? (
        <p className="border-t border-line py-10 text-muted">{copy.emptyAtlas}</p>
      ) : (
        <div className="grid border-t border-line md:grid-cols-5">
          <Link
            to="/read/$storyId"
            params={{ storyId: latest.id }}
            className="border-b border-line py-6 md:col-span-3 md:border-r md:pr-8"
          >
            <p className="text-xs uppercase tracking-widest text-muted">{copy.readings}</p>
            <h1 className="mt-4 text-3xl md:text-5xl">01. {storyTitle(latest, lang)}</h1>
          </Link>
          <div className="flex items-start border-b border-line py-6 md:col-span-2 md:pl-8">
            <label className="w-full text-sm">
              <select
                value={section}
                aria-label={copy.homeSections}
                onChange={(event) => {
                  const next = event.target.value;
                  setSection(isSection(next) ? next : "all");
                }}
                className="min-h-11 w-full border border-ink bg-paper px-3 text-ink"
              >
                <option value="all">{copy.homeSections}</option>
                {THEMES.map((theme) => (
                  <option key={theme} value={theme}>
                    {copy.themes[theme]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <Link
            to="/read/$storyId"
            params={{ storyId: latest.id }}
            className="min-h-72 border-b border-line py-6 md:col-span-3 md:row-span-2 md:border-r md:pr-8"
          >
            <p className="text-pretty leading-relaxed">{cut(latest.locales[lang].body, 2)}</p>
          </Link>

          {beside.map((story) => (
            <Card key={story.id} story={story} lang={lang} />
          ))}
          {after.map((story, index) => (
            <Card key={story.id} story={story} lang={lang} wide={index % 2 === 0} />
          ))}
        </div>
      )}

      <ul className="mt-10 flex flex-col">
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

function Card({ story, lang, wide = false }: { story: Story; lang: Lang; wide?: boolean }) {
  const title = storyTitle(story, lang);
  const excerpt = cut(story.locales[lang].body, 1);
  return (
    <Link
      to="/read/$storyId"
      params={{ storyId: story.id }}
      className={
        wide
          ? "flex flex-col gap-3 border-b border-line py-6 md:col-span-3 md:border-r md:pr-8"
          : "flex flex-col gap-3 border-b border-line py-6 md:col-span-2 md:pl-8"
      }
    >
      <h2 className="text-2xl">{title}</h2>
      {excerpt ? <p className="text-pretty text-muted">{excerpt}</p> : null}
    </Link>
  );
}
