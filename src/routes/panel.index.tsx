import { createFileRoute, Link } from "@tanstack/react-router";
import { langMeta, useCopy } from "@/lib/i18n";
import { useLibrary } from "@/lib/library";
import { storyTitle } from "@/lib/text";
import { LANGS } from "@/lib/types";

export const Route = createFileRoute("/panel/")({
  component: PanelHome,
});

function PanelHome() {
  const lang = useLibrary((s) => s.lang);
  const stories = useLibrary((s) => s.stories);
  const restoreSeed = useLibrary((s) => s.restoreSeed);
  const copy = useCopy(lang);
  const seedMissing = ["carbon-books", "after-ten-million", "grain-moves", "languages-of-record"].some(
    (id) => !stories.some((story) => story.id === id),
  );

  return (
    <main className="px-5 py-10 md:px-12 md:py-14">
      <div className="flex flex-col gap-6 border-b border-line pb-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-4xl">{copy.panel}</h1>
          <p className="mt-4 text-pretty">{copy.panelLead}</p>
        </div>
        <Link
          to="/panel/$storyId"
          params={{ storyId: "new" }}
          className="inline-flex min-h-11 items-center bg-pine px-4 text-paper"
        >
          {copy.newReading}
        </Link>
      </div>

      {stories.length === 0 ? (
        <div className="mt-8 flex flex-col items-start gap-4">
          <p>{copy.emptyPanel}</p>
          {seedMissing ? (
            <button
              type="button"
              onClick={() => void restoreSeed()}
              className="inline-flex min-h-11 items-center border border-line px-4"
            >
              {copy.restore}
            </button>
          ) : null}
        </div>
      ) : (
        <ul className="mt-2">
          {stories.map((story) => (
            <li key={story.id} className="border-b border-line">
              <Link
                to="/panel/$storyId"
                params={{ storyId: story.id }}
                className="grid gap-3 py-6 md:grid-cols-12 md:items-center"
              >
                <div className="md:col-span-8">
                  <p className="text-xs uppercase tracking-widest text-pine">{copy.themes[story.theme]}</p>
                  <h2 className="mt-2 text-2xl">{storyTitle(story, lang) || copy.unwritten}</h2>
                </div>
                <div className="flex flex-wrap gap-3 md:col-span-4 md:justify-end">
                  {LANGS.map((code) => {
                    const filed = Boolean(story.locales[code].audio);
                    return (
                      <span key={code} className="inline-flex items-center gap-2 text-sm" lang={langMeta[code].html}>
                        <span className={filed ? "size-2 rounded-full bg-pine" : "size-2 rounded-full bg-line"} />
                        <span className="sr-only">{filed ? copy.recordingOn : copy.recordingOff}</span>
                        {langMeta[code].code}
                      </span>
                    );
                  })}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {stories.length > 0 && seedMissing ? (
        <button
          type="button"
          onClick={() => void restoreSeed()}
          className="mt-8 inline-flex min-h-11 items-center text-pine"
        >
          {copy.restore}
        </button>
      ) : null}
    </main>
  );
}
