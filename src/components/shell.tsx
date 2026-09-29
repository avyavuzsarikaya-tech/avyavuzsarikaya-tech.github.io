import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { langMeta, useCopy } from "@/lib/i18n";
import { useLibrary } from "@/lib/library";
import { storyTitle } from "@/lib/text";
import { LANGS, type Lang } from "@/lib/types";

function Meridian({ tone }: { tone: "paper" | "pine" }) {
  const line = tone === "paper" ? "bg-paper" : "bg-pine";
  const dot = tone === "paper" ? "bg-paper" : "bg-pine";
  return (
    <span className="relative inline-flex h-8 w-8 items-center justify-center" aria-hidden="true">
      <span className={`absolute h-8 w-px ${line}`} />
      <span className={`size-2 rounded-full ${dot}`} />
    </span>
  );
}

function LangSwitch({
  lang,
  onChange,
  label,
}: {
  lang: Lang;
  onChange: (lang: Lang) => void;
  label: string;
}) {
  return (
    <select
      value={lang}
      aria-label={label}
      onChange={(event) => {
        const next = event.target.value;
        if (next === "tr" || next === "ar" || next === "en" || next === "fr" || next === "es") onChange(next);
      }}
      className="lang-box min-h-11 w-16 border border-ink bg-ink px-1 text-center text-xs tracking-widest text-paper"
    >
      {LANGS.map((code) => (
        <option key={code} value={code} lang={langMeta[code].html}>
          {langMeta[code].code}
        </option>
      ))}
    </select>
  );
}

function Wordmark() {
  return (
    <Link to="/" className="inline-flex items-center gap-3 text-paper">
      <Meridian tone="paper" />
      <span className="font-display text-xl tracking-widest">ORBIS</span>
    </Link>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const lang = useLibrary((s) => s.lang);
  const ready = useLibrary((s) => s.ready);
  const stories = useLibrary((s) => s.stories);
  const setLang = useLibrary((s) => s.setLang);
  const load = useLibrary((s) => s.load);
  const copy = useCopy(lang);
  const meta = langMeta[lang];
  const path = useRouterState({ select: (s) => s.location.pathname });
  const inPanel = path.startsWith("/panel");

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    document.documentElement.lang = meta.html;
    document.documentElement.dir = meta.dir;
  }, [meta.html, meta.dir]);

  const atlasClass = inPanel ? "text-mist" : "text-paper border-b border-paper";
  const panelClass = inPanel ? "text-paper border-b border-paper" : "text-mist";

  return (
    <div className="min-h-screen bg-paper pb-16 text-ink">
      <div className="fixed top-3 right-3 z-40">
        <LangSwitch lang={lang} onChange={setLang} label={copy.language} />
      </div>

      <aside
        dir="ltr"
        className="z-20 flex max-h-64 flex-col bg-ink text-paper md:fixed md:bottom-16 md:left-0 md:top-0 md:max-h-none md:w-60"
      >
        <div className="flex flex-col gap-6 py-6 pl-5 pr-24 md:pr-5">
          <Wordmark />
          <nav className="flex flex-col items-start gap-1 text-sm">
            <Link to="/" className={`inline-flex min-h-11 items-center ${atlasClass}`}>
              {copy.atlas}
            </Link>
            <Link to="/panel" className={`inline-flex min-h-11 items-center ${panelClass}`}>
              {copy.panel}
            </Link>
          </nav>
        </div>
        <p className="px-5 text-xs uppercase tracking-widest text-mist">{copy.readings}</p>
        <ul className="mt-2 flex-1 overflow-y-auto px-2 pb-4">
          {stories.map((story, index) => {
            const href = `/read/${story.id}`;
            const active = path === href;
            const title = storyTitle(story, lang) || story.id;
            return (
              <li key={story.id}>
                <Link
                  to="/read/$storyId"
                  params={{ storyId: story.id }}
                  className={
                    active
                      ? "flex min-h-11 items-center gap-3 bg-pine px-3 text-sm text-paper"
                      : "flex min-h-11 items-center gap-3 px-3 text-sm text-mist"
                  }
                >
                  <span className="tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                  <span className="truncate">{title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>

      <div dir={meta.dir} lang={meta.html} className="min-w-0 md:pl-60">
        <div className="h-14 md:h-16" />
        {ready ? children : <p className="px-5 py-16 text-muted md:px-12">{copy.loading}</p>}
      </div>

      <footer className="fixed inset-x-0 bottom-0 z-30 flex min-h-16 items-center border-t border-mist bg-ink px-5 text-xs leading-relaxed text-mist">
        <p>{copy.colophon}</p>
      </footer>
    </div>
  );
}

export function fieldClass() {
  return "w-full border border-line bg-sheet px-3 py-3 text-ink";
}
