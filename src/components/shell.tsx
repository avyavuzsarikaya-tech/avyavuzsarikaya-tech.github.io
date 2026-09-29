import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { langMeta, useCopy } from "@/lib/i18n";
import { useLibrary } from "@/lib/library";
import { LANGS, type Lang } from "@/lib/types";

function Meridian() {
  return (
    <span className="relative inline-flex h-8 w-8 items-center justify-center" aria-hidden="true">
      <span className="absolute h-8 w-px bg-ink" />
      <span className="size-2 rounded-full bg-ink" />
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
      className="min-h-11 bg-paper px-1 text-sm tracking-widest text-ink"
    >
      {LANGS.map((code) => (
        <option key={code} value={code} lang={langMeta[code].html}>
          {langMeta[code].code}
        </option>
      ))}
    </select>
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

  const atlasClass = inPanel ? "text-muted" : "border-b border-ink text-ink";
  const panelClass = inPanel ? "border-b border-ink text-ink" : "text-ink";

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header dir="ltr" className="flex items-start justify-between gap-6 px-5 py-6 md:px-8">
        <Link to="/" className="inline-flex min-h-11 items-center gap-3">
          <Meridian />
          <span className="font-display text-xl tracking-widest">ORBIS</span>
        </Link>
        <div className="flex flex-col items-end">
          <LangSwitch lang={lang} onChange={setLang} label={copy.language} />
          <Link to="/" className={`inline-flex min-h-11 items-center text-sm ${atlasClass}`}>
            {copy.atlas}
          </Link>
          <Link to="/panel" className={`inline-flex min-h-11 items-center text-sm ${panelClass}`}>
            {copy.panel}
          </Link>
        </div>
      </header>
      <div dir={meta.dir} lang={meta.html}>
        {ready ? children : <p className="px-5 py-16 text-muted md:px-8">{copy.loading}</p>}
      </div>
    </div>
  );
}

export function fieldClass() {
  return "w-full border border-line bg-sheet px-3 py-3 text-ink";
}
