import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { useCopy } from "@/lib/i18n";
import { useLibrary } from "@/lib/library";
import { formatDate, readingMinutes, storyTitle } from "@/lib/text";
import { LANGS } from "@/lib/types";

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

function Atlas() {
  const lang = useLibrary((s) => s.lang);
  const stories = useLibrary((s) => s.stories);
  const restoreSeed = useLibrary((s) => s.restoreSeed);
  const copy = useCopy(lang);

  return (
    <main className="px-5 py-10 md:px-12 md:py-14">
      <div className="grid gap-8 border-b border-line pb-10 md:grid-cols-2 md:gap-16">
        <h1 className="text-4xl md:text-6xl">{copy.hero}</h1>
        <div className="flex flex-col justify-end gap-4">
          <p className="text-pretty">{copy.manifesto}</p>
          <p className="text-sm text-muted">{copy.listenRule}</p>
        </div>
      </div>

      <h2 className="mt-10 text-xs uppercase tracking-widest text-muted">{copy.readings}</h2>

      {stories.length === 0 ? (
        <div className="mt-8 flex flex-col items-start gap-4">
          <p>{copy.emptyAtlas}</p>
          <button
            type="button"
            onClick={() => void restoreSeed()}
            className="inline-flex min-h-11 items-center bg-pine px-4 text-paper"
          >
            {copy.restore}
          </button>
        </div>
      ) : (
        <div className="mt-2">
          {stories.map((story, index) => {
            const locale = story.locales[lang];
            const title = storyTitle(story, lang);
            const minutes = readingMinutes(locale.body);
            const lead = index === 0;
            return (
              <Link
                key={story.id}
                to="/read/$storyId"
                params={{ storyId: story.id }}
                className="group grid gap-3 border-b border-line py-8 md:grid-cols-12 md:gap-8"
              >
                <div className="md:col-span-3">
                  <p className="text-sm tabular-nums text-muted">{String(index + 1).padStart(2, "0")}</p>
                  <p className="mt-2 text-pine">{copy.themes[story.theme]}</p>
                </div>
                <div className="md:col-span-9">
                  <h3
                    className={
                      lead
                        ? "text-3xl transition-colors duration-200 group-hover:text-pine md:text-5xl"
                        : "text-2xl transition-colors duration-200 group-hover:text-pine md:text-3xl"
                    }
                  >
                    {title}
                  </h3>
                  {locale.dek ? (
                    <p className={lang === "ar" ? "mt-3 text-muted" : "mt-3 text-muted italic"}>{locale.dek}</p>
                  ) : null}
                  <p className="mt-4 text-sm text-muted">
                    {[locale.region, formatDate(story.date, lang), minutes ? `${minutes} ${copy.min}` : ""]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {LANGS.some((code) => story.locales[code].audio) ? (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {LANGS.map((code) => {
                        const filed = Boolean(story.locales[code].audio);
                        return (
                          <span key={code} className="inline-flex items-center gap-2 text-xs uppercase tracking-widest">
                            <span className={filed ? "size-2 rounded-full bg-pine" : "size-2 rounded-full bg-line"} />
                            <span className={filed ? "text-ink" : "text-muted"}>{code}</span>
                          </span>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
