import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SiteMenu } from "@/components/menu";
import { Pick } from "@/components/pick";
import { aboutCopy } from "@/lib/about-copy";
import { useFrameCopy } from "@/lib/frame-copy";
import { langMeta, useCopy } from "@/lib/i18n";
import { aboutLink, homeLink, rememberLang, sectionLink, withLang } from "@/lib/lang-path";
import { useLibrary } from "@/lib/library";
import { LOOKS, LOOK_SWATCH, useLook, type Look } from "@/lib/look";
import { LANGS, THEMES, type Lang, type Theme } from "@/lib/types";
import { useLang } from "@/lib/use-lang";

function Meridian() {
  return (
    <span className="relative inline-flex h-8 w-8 items-center justify-center" aria-hidden="true">
      <span className="absolute h-8 w-px bg-paper" />
      <span className="size-2 rounded-full bg-paper" />
    </span>
  );
}

function Swatch({ look }: { look: Look }) {
  const [panel, paper] = LOOK_SWATCH[look];
  return (
    <span
      aria-hidden="true"
      className="me-2.5 inline-block size-3.5 shrink-0 rounded-full border border-paper/60"
      style={{ background: `linear-gradient(135deg, ${panel} 50%, ${paper} 50%)` }}
    />
  );
}

function HeaderSwatch({ look }: { look: Look }) {
  const [panel, paper] = LOOK_SWATCH[look];
  return (
    <span
      aria-hidden="true"
      className="block size-[18px] rounded-full border border-paper/70 transition-colors group-hover:border-paper group-aria-expanded:border-paper"
      style={{ background: `linear-gradient(135deg, ${panel} 50%, ${paper} 50%)` }}
    />
  );
}

function Caret() {
  return (
    <svg
      viewBox="0 0 8 5"
      className="mb-px size-2 shrink-0 opacity-70 transition-transform duration-150 group-hover:opacity-100 group-aria-expanded:rotate-180 group-aria-expanded:opacity-100"
      aria-hidden="true"
    >
      <path d="M.75.75 4 4.25 7.25.75" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/**
 * Site frame shared by every page: header, section bar, footer (black, or burgundy in the second scheme).
 * `section` marks the active section in the bar ("all" on the home page with no filter).
 */
export function Shell({
  children,
  section,
}: {
  children: React.ReactNode;
  section?: Theme | "all";
}) {
  const lang = useLang();
  const setPanelLang = useLibrary((s) => s.setLang);
  const navigate = useNavigate();
  const copy = useCopy(lang);
  const frame = useFrameCopy(lang);
  const meta = langMeta[lang];
  const path = useRouterState({ select: (s) => s.location.pathname });
  const inPanel = path.startsWith("/panel");
  const bar = useRef<HTMLDivElement | null>(null);
  const menuButton = useRef<HTMLButtonElement | null>(null);
  const [look, setLook] = useLook();
  const [menuOpen, setMenuOpen] = useState(false);

  // On a phone the section row scrolls sideways: bring the open section into view.
  useEffect(() => {
    const on = bar.current?.querySelector<HTMLElement>('[data-on="true"]');
    // "nearest" keeps the page itself still; works for right-to-left Arabic too.
    on?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [section, lang]);

  useEffect(() => {
    document.documentElement.lang = meta.html;
    document.documentElement.dir = meta.dir;
  }, [meta.html, meta.dir]);

  // Reader pages: the same page at the other language's address. The panel keeps its address.
  function setLang(code: Lang) {
    rememberLang(code);
    setPanelLang(code);
    if (!inPanel) void navigate({ href: withLang(code, path) });
  }

  const barItem = (on: boolean) =>
    on
      ? "section-link inline-flex min-h-11 shrink-0 items-center border-b-2 border-ink text-ink"
      : "section-link inline-flex min-h-11 shrink-0 items-center border-b-2 border-transparent text-muted hover:text-ink";

  return (
    <div className="flex min-h-dvh flex-col bg-paper text-ink">
      <header
        dir="ltr"
        className="flex items-center justify-between gap-4 bg-panel px-5 py-3 text-paper md:px-8"
      >
        <div className="flex items-center gap-1">
          <button
            ref={menuButton}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            aria-label={frame.menu}
            onClick={() => setMenuOpen(true)}
            className="inline-flex size-11 shrink-0 items-center justify-start text-paper"
          >
            <span className="flex w-[18px] flex-col gap-[5px]" aria-hidden="true">
              <span className="h-px w-full bg-current" />
              <span className="h-px w-full bg-current" />
              <span className="h-px w-full bg-current" />
            </span>
          </button>
          <Link {...homeLink(lang)} className="inline-flex min-h-11 items-center gap-3 text-paper">
            <Meridian />
            <span className="font-display text-xl tracking-widest">ORBIS</span>
          </Link>
        </div>
        <nav className="flex items-center gap-3 text-sm md:gap-4">
          {/* The editing panel stays out of the reader's menu; open it at /panel. */}
          {inPanel ? (
            <>
              <Link {...homeLink(lang)} className="inline-flex min-h-11 items-center text-mist">
                {copy.atlas}
              </Link>
              <Link to="/panel" className="inline-flex min-h-11 items-center text-paper">
                {copy.panel}
              </Link>
            </>
          ) : null}
          <div className="flex items-center text-paper">
            <Pick
              tone="panel"
              align="end"
              label={frame.look}
              value={look}
              onChange={setLook}
              options={LOOKS.map((code) => ({
                value: code,
                label: (
                  <>
                    <Swatch look={code} />
                    {frame.looks[code]}
                  </>
                ),
              }))}
              buttonClassName="group inline-flex size-11 items-center justify-center text-paper"
            >
              <HeaderSwatch look={look} />
            </Pick>
            <span aria-hidden="true" className="h-3.5 w-px bg-paper/35" />
            <Pick
              tone="panel"
              align="end"
              label={copy.language}
              value={lang}
              onChange={setLang}
              options={LANGS.map((code) => ({
                value: code,
                label: langMeta[code].name,
                lang: langMeta[code].html,
              }))}
              buttonClassName="group inline-flex h-11 items-center gap-1.5 ps-3 pe-0.5 text-[11px] tracking-[0.22em] text-paper"
            >
              <span>{meta.code}</span>
              <Caret />
            </Pick>
          </div>
        </nav>
      </header>
      {menuOpen ? (
        <SiteMenu
          lang={lang}
          section={section}
          path={path}
          look={look}
          onClose={() => {
            setMenuOpen(false);
            menuButton.current?.focus();
          }}
          onLang={setLang}
          onLook={setLook}
        />
      ) : null}

      <div dir={meta.dir} lang={meta.html} className="flex flex-1 flex-col">
        <nav aria-label={copy.sections} className="section-bar relative border-b border-rule">
          <div
            ref={bar}
            className="no-scrollbar flex gap-5 overflow-x-auto px-5 text-[13px] tracking-wide whitespace-nowrap md:gap-7 md:px-8"
          >
            <Link
              {...homeLink(lang)}
              data-on={section === "all"}
              className={barItem(section === "all")}
            >
              {copy.home}
            </Link>
            {THEMES.map((theme) => (
              <Link
                key={theme}
                {...sectionLink(lang, theme)}
                data-on={section === theme}
                className={barItem(section === theme)}
              >
                {copy.themes[theme]}
              </Link>
            ))}
          </div>
        </nav>

        <div className="flex-1">
          {children}
        </div>

        <div aria-hidden="true" className="flex items-center gap-3 px-5 pt-12 pb-10 md:px-8">
          <span className="h-px flex-1 bg-rule" />
          <span className="size-1.5 rounded-full bg-ink" />
          <span className="h-px flex-1 bg-rule" />
        </div>

        <footer className="bg-panel px-5 py-10 text-paper md:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col gap-3">
              <Link
                {...homeLink(lang)}
                dir="ltr"
                className="inline-flex min-h-11 items-center gap-3 self-start text-paper"
              >
                <Meridian />
                <span className="font-display text-lg tracking-widest">ORBIS</span>
              </Link>
              <Link
                {...aboutLink(lang)}
                className="inline-flex min-h-9 items-center self-start text-sm text-paper"
              >
                {aboutCopy(lang).title}
              </Link>
              <p className="text-sm text-mist">{copy.colophon}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-mist">{copy.sections}</p>
              <ul className="mt-2 grid w-fit grid-cols-2 gap-x-6">
                {THEMES.map((theme) => (
                  <li key={theme}>
                    <Link
                      {...sectionLink(lang, theme)}
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
