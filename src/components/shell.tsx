import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { langMeta, useCopy } from "@/lib/i18n";
import { useLibrary } from "@/lib/library";
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
    <label className="flex flex-col gap-2 text-sm text-mist">
      {label}
      <select
        value={lang}
        aria-label={label}
        onChange={(event) => {
          const next = event.target.value;
          if (next === "tr" || next === "ar" || next === "en" || next === "fr" || next === "es") onChange(next);
        }}
        className="lang-box min-h-11 w-full border border-mist bg-ink px-3 text-paper"
      >
        {LANGS.map((code) => (
          <option key={code} value={code} lang={langMeta[code].html}>
            {langMeta[code].name}
          </option>
        ))}
      </select>
    </label>
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
    <div lang={meta.html} dir={meta.dir} className="min-h-screen bg-paper text-ink">
      <header className="bg-ink text-paper md:hidden">
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <Wordmark />
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/" className={`min-h-11 inline-flex items-center ${atlasClass}`}>
              {copy.atlas}
            </Link>
            <Link to="/panel" className={`min-h-11 inline-flex items-center ${panelClass}`}>
              {copy.panel}
            </Link>
          </nav>
        </div>
        <div className="px-5 pb-4">
          <LangSwitch lang={lang} onChange={setLang} label={copy.language} />
        </div>
      </header>

      <div className="md:flex">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between bg-ink px-6 py-8 text-paper md:flex">
          <div className="flex flex-col gap-10">
            <Wordmark />
            <nav className="flex flex-col items-start gap-1 text-sm">
              <Link to="/" className={`inline-flex min-h-11 items-center ${atlasClass}`}>
                {copy.atlas}
              </Link>
              <Link to="/panel" className={`inline-flex min-h-11 items-center ${panelClass}`}>
                {copy.panel}
              </Link>
            </nav>
            <LangSwitch lang={lang} onChange={setLang} label={copy.language} />
          </div>
          <p className="text-sm leading-relaxed text-mist">{copy.colophon}</p>
        </aside>
        <div className="min-w-0 flex-1">
          {ready ? children : <p className="px-5 py-16 text-muted md:px-12">{copy.loading}</p>}
        </div>
      </div>
    </div>
  );
}

export function fieldClass() {
  return "w-full border border-line bg-sheet px-3 py-3 text-ink";
}
