import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useFrameCopy } from "@/lib/frame-copy";
import { langMeta, useCopy } from "@/lib/i18n";
import { useLibrary } from "@/lib/library";
import { LANGS, THEMES, type Lang, type Theme } from "@/lib/types";

function Meridian() {
  return (
    <span className="relative inline-flex h-8 w-8 items-center justify-center" aria-hidden="true">
      <span className="absolute h-8 w-px bg-paper" />
      <span className="size-2 rounded-full bg-paper" />
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
    <label className="relative inline-flex items-center">
      <select
        value={lang}
        aria-label={label}
        onChange={(event) => {
          const next = event.target.value;
          if (next === "tr" || next === "ar" || next === "en" || next === "fr" || next === "es")
            onChange(next);
        }}
        className="lang-box min-h-11 appearance-none bg-transparent pr-4 text-xs tracking-widest text-paper"
      >
        {LANGS.map((code) => (
          <option key={code} value={code} lang={langMeta[code].html}>
            {langMeta[code].code}
          </option>
        ))}
      </select>
      <span
        className="pointer-events-none absolute right-0 text-[10px] text-paper"
        aria-hidden="true"
      >
        ▾
      </span>
    </label>
  );
}

/**
 * Site frame shared by every page: black header, section bar, footer.
 * `section` marks the active section in the bar ("all" on the home page with no filter).
 */
export function Shell({
  children,
  section,
}: {
  children: React.ReactNode;
  section?: Theme | "all";
}) {
  const lang = useLibrary((s) => s.lang);
  const ready = useLibrary((s) => s.ready);
  const setLang = useLibrary((s) => s.setLang);
  const load = useLibrary((s) => s.load);
  const copy = useCopy(lang);
  const frame = useFrameCopy(lang);
  const meta = langMeta[lang];
  const path = useRouterState({ select: (s) => s.location.pathname });
  const inPanel = path.startsWith("/panel");
  const bar = useRef<HTMLDivElement | null>(null);

  // On a phone the section row scrolls sideways: bring the open section into view.
  useEffect(() => {
    const on = bar.current?.querySelector<HTMLElement>('[data-on="true"]');
    // "nearest" keeps the page itself still; works for right-to-left Arabic too.
    on?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [section, lang]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    document.documentElement.lang = meta.html;
    document.documentElement.dir = meta.dir;
  }, [meta.html, meta.dir]);

  const barItem = (on: boolean) =>
    on
      ? "inline-flex min-h-11 shrink-0 items-center border-b-2 border-ink text-ink"
      : "inline-flex min-h-11 shrink-0 items-center border-b-2 border-transparent text-muted hover:text-ink";

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <header
        dir="ltr"
        className="flex items-center justify-between gap-4 bg-ink px-5 py-3 text-paper md:px-8"
      >
        <Link to="/" className="inline-flex min-h-11 items-center gap-3 text-paper">
          <Meridian />
          <span className="font-display text-xl tracking-widest">ORBIS</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          {/* The editing panel stays out of the reader's menu; open it at /panel. */}
          {inPanel ? (
            <>
              <Link to="/" className="inline-flex min-h-11 items-center text-mist">
                {copy.atlas}
              </Link>
              <Link to="/panel" className="inline-flex min-h-11 items-center text-paper">
                {copy.panel}
              </Link>
            </>
          ) : null}
          <LangSwitch lang={lang} onChange={setLang} label={copy.language} />
        </nav>
      </header>

      <div dir={meta.dir} lang={meta.html} className="flex flex-1 flex-col">
        <nav aria-label={copy.sections} className="section-bar relative border-b border-rule">
          <div
            ref={bar}
            className="no-scrollbar flex gap-5 overflow-x-auto px-5 text-[13px] tracking-wide whitespace-nowrap md:gap-7 md:px-8"
          >
            <Link to="/" data-on={section === "all"} className={barItem(section === "all")}>
              {copy.home}
            </Link>
            {THEMES.map((theme) => (
              <Link
                key={theme}
                to="/"
                search={{ s: theme }}
                data-on={section === theme}
                className={barItem(section === theme)}
              >
                {copy.themes[theme]}
              </Link>
            ))}
          </div>
        </nav>

        <div className="flex-1">
          {ready ? children : <p className="px-5 py-16 text-muted md:px-8">{copy.loading}</p>}
        </div>

        <footer className="mt-16 bg-ink px-5 py-10 text-paper md:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col gap-3">
              <Link
                to="/"
                dir="ltr"
                className="inline-flex min-h-11 items-center gap-3 self-start text-paper"
              >
                <Meridian />
                <span className="font-display text-lg tracking-widest">ORBIS</span>
              </Link>
              <p className="text-sm text-mist">{copy.colophon}</p>
              <p className="text-sm text-mist">{frame.principle}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-mist">{copy.sections}</p>
              <ul className="mt-2 grid grid-cols-2 gap-x-6">
                {THEMES.map((theme) => (
                  <li key={theme}>
                    <Link
                      to="/"
                      search={{ s: theme }}
                      className="inline-flex min-h-9 items-center text-sm text-paper"
                    >
                      {copy.themes[theme]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-mist">{frame.languages}</p>
              <ul className="mt-2 flex flex-col">
                {LANGS.map((code) => (
                  <li key={code}>
                    <button
                      type="button"
                      lang={langMeta[code].html}
                      onClick={() => {
                        setLang(code);
                        window.scrollTo({ top: 0 });
                      }}
                      className={
                        code === lang
                          ? "inline-flex min-h-9 items-center text-sm text-paper underline underline-offset-4"
                          : "inline-flex min-h-9 items-center text-sm text-mist hover:text-paper"
                      }
                    >
                      {langMeta[code].name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-10 border-t border-muted pt-6 text-xs text-mist">
            © {new Date().getFullYear()} Orbis. {frame.rights}
          </p>
        </footer>
      </div>
    </div>
  );
}

export function fieldClass() {
  return "w-full border border-line bg-sheet px-3 py-3 text-ink";
}
