import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { SiteMenu } from "@/components/menu";
import { Pick } from "@/components/pick";
import { SearchMark } from "@/components/search-mark";
import { membersOn } from "@/lib/members/config";
import { membersCopy } from "@/lib/members/copy";
import { searchCopy } from "@/lib/search";
import { aboutCopy } from "@/lib/about-copy";
import { useFrameCopy } from "@/lib/frame-copy";
import { langMeta, useCopy } from "@/lib/i18n";
import {
  aboutLink,
  accountLink,
  homeLink,
  rememberLang,
  searchLink,
  sectionLink,
  withLang,
} from "@/lib/lang-path";
import { useLibrary } from "@/lib/library";
import { LOOKS, LOOK_SWATCH, useLook, type Look } from "@/lib/look";
import { LANGS, THEMES, type Lang, type Theme } from "@/lib/types";
import { useLang } from "@/lib/use-lang";

/** The mark beside the name. In the header it is a size smaller on a phone. */
function Meridian({ header = false }: { header?: boolean }) {
  return (
    <span
      className={
        header
          ? "relative inline-flex h-8 w-6 items-center justify-center md:h-12 md:w-8 lg:h-16 lg:w-10"
          : "relative inline-flex h-8 w-8 items-center justify-center"
      }
      aria-hidden="true"
    >
      <span
        className={
          header ? "absolute h-8 w-px bg-paper md:h-12 lg:h-16" : "absolute h-8 w-px bg-paper"
        }
      />
      <span
        className={
          header
            ? "size-2 rounded-full bg-paper md:size-2.5 lg:size-3"
            : "size-2 rounded-full bg-paper"
        }
      />
    </span>
  );
}

function Swatch({ look }: { look: Look }) {
  const [panel, paper] = LOOK_SWATCH[look];
  return (
    <span
      aria-hidden="true"
      className="me-2.5 inline-block size-3.5 shrink-0 rounded-full border border-ink/30"
      style={{ background: `linear-gradient(135deg, ${panel} 50%, ${paper} 50%)` }}
    />
  );
}

function HeaderSwatch({ look, dark = false }: { look: Look; dark?: boolean }) {
  const [panel, paper] = LOOK_SWATCH[look];
  return (
    <span
      aria-hidden="true"
      className={`block size-[12px] rounded-full border transition-colors md:size-[15px] ${dark ? "border-paper/60 group-hover:border-paper group-aria-expanded:border-paper" : "border-ink/40 group-hover:border-ink group-aria-expanded:border-ink"}`}
      style={{ background: `linear-gradient(135deg, ${panel} 50%, ${paper} 50%)` }}
    />
  );
}

function Caret() {
  return (
    <svg
      viewBox="0 0 8 5"
      className="mb-px size-[7px] shrink-0 opacity-70 md:size-2 transition-transform duration-150 group-hover:opacity-100 group-aria-expanded:rotate-180 group-aria-expanded:opacity-100"
      aria-hidden="true"
    >
      <path d="M.75.75 4 4.25 7.25.75" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

type Tools = {
  openMenu: () => void;
  menuOpen: boolean;
  menuButton: React.RefObject<HTMLButtonElement | null>;
  look: Look;
  setLook: (look: Look) => void;
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const ToolsContext = createContext<Tools | null>(null);

/**
 * Search, menu, colour scheme and language. The masthead carries the name alone, so they
 * sit small on the paper at the head of each page, beside the home sentence, a section's
 * name or a reading's way back (place "page"), at every width.
 */
/** A head and shoulders, drawn in the same thin line as the search mark. */
function PersonMark() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
      className="size-[15px] md:size-[18px]"
    >
      <circle cx="10" cy="6.5" r="3.5" />
      <path d="M3 18c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" strokeLinecap="round" />
    </svg>
  );
}

export function FrameTools({ place = "page" }: { place?: "page" | "masthead" }) {
  const tools = useContext(ToolsContext);
  const lang = useLang();
  const copy = useCopy(lang);
  const frame = useFrameCopy(lang);
  if (!tools) return null;
  const dark = place === "masthead";
  const tone = dark ? "panel" : "page";
  const hover = dark ? "hover:text-paper" : "hover:text-ink";
  return (
    <div
      dir="ltr"
      className={
        dark
          ? "hidden shrink-0 items-center gap-2 text-mist md:flex"
          : "flex shrink-0 items-center gap-0.5 text-muted"
      }
    >
      <Pick
        tone={tone}
        align="end"
        label={frame.look}
        value={tools.look}
        onChange={tools.setLook}
        options={LOOKS.map((code) => ({
          value: code,
          label: (
            <>
              <Swatch look={code} />
              {frame.looks[code]}
            </>
          ),
        }))}
        buttonClassName="group inline-flex h-11 w-7 items-center justify-center md:w-9"
      >
        <HeaderSwatch look={tools.look} dark={dark} />
      </Pick>
      <Pick
        tone={tone}
        align="end"
        label={copy.language}
        value={tools.lang}
        onChange={tools.setLang}
        options={LANGS.map((code) => ({
          value: code,
          label: langMeta[code].name,
          lang: langMeta[code].html,
        }))}
        buttonClassName={`group inline-flex h-11 items-center gap-1 px-1 text-[10px] tracking-[0.18em] ${hover} md:px-2 md:text-[11px]`}
      >
        <span>{langMeta[tools.lang].code}</span>
        <span className="hidden md:inline-flex">
          <Caret />
        </span>
      </Pick>
      {membersOn ? (
        <Link
          {...accountLink(lang)}
          aria-label={membersCopy(lang).account}
          title={membersCopy(lang).account}
          className={`inline-flex h-11 w-7 shrink-0 items-center justify-center ${hover} md:w-9`}
        >
          <PersonMark />
        </Link>
      ) : null}
      <Link
        {...searchLink(lang)}
        aria-label={searchCopy(lang).title}
        title={searchCopy(lang).title}
        className={`inline-flex h-11 w-7 shrink-0 items-center justify-center ${hover} md:w-9`}
      >
        <SearchMark className="size-[15px] md:size-[18px]" />
      </Link>
      <button
        ref={dark ? undefined : tools.menuButton}
        type="button"
        aria-expanded={tools.menuOpen}
        aria-controls="site-menu"
        aria-label={frame.menu}
        onClick={tools.openMenu}
        className={`inline-flex h-11 w-7 shrink-0 items-center justify-end ${hover} md:w-9`}
      >
        <span
          className="flex w-[14px] flex-col gap-[4px] md:w-[17px] md:gap-[5px]"
          aria-hidden="true"
        >
          <span className="h-px w-full bg-current" />
          <span className="h-px w-full bg-current" />
          <span className="h-px w-full bg-current" />
        </span>
      </button>
    </div>
  );
}

/**
 * Site frame shared by every page: header, section bar, footer (black, or burgundy in the second scheme).
 * `section` marks the active section in the bar ("all" on the home page with no filter).
 */
/**
 * A wrapped paragraph keeps the full width of its box even where its longest line ends
 * short of it, which left the footer's first gap wider than the second. On wide screens
 * the column is narrowed to its longest line of text, in whatever language is shown, so
 * both gaps between the three columns come out equal.
 */
function useFitToText(lang: string) {
  const column = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = column.current;
    if (!el) return;
    const wide = window.matchMedia("(min-width: 768px)");
    const fit = () => {
      el.style.width = "";
      if (!wide.matches) return;
      let start = Infinity;
      let end = -Infinity;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        range.selectNodeContents(node);
        for (const rect of range.getClientRects()) {
          if (!rect.width) continue;
          start = Math.min(start, rect.left);
          end = Math.max(end, rect.right);
        }
      }
      // The ORBIS mark sits before the first text; it counts towards the start.
      const first = el.firstElementChild?.getBoundingClientRect();
      if (first) start = Math.min(start, first.left);
      if (end > start) el.style.width = `${Math.ceil(end - start)}px`;
    };
    fit();
    void document.fonts?.ready.then(fit);
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [lang]);
  return column;
}

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
  const footerBrand = useFitToText(lang);

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
      ? "section-link inline-flex min-h-10 shrink-0 md:min-h-9 items-center border-b-2 border-ink text-ink"
      : "section-link inline-flex min-h-10 shrink-0 md:min-h-9 items-center border-b-2 border-transparent text-muted hover:text-ink";

  const tools: Tools = {
    openMenu: () => setMenuOpen(true),
    menuOpen,
    menuButton,
    look,
    setLook,
    lang,
    setLang,
  };

  return (
    <ToolsContext.Provider value={tools}>
      <div className="flex min-h-dvh flex-col bg-paper text-ink">
        {/* The masthead carries the name alone, in the middle, at every width. The motto
          and the tools sit on the paper at the head of each page. */}
        <header
          dir="ltr"
          className="relative flex flex-col items-center justify-center bg-panel px-5 py-5 text-paper md:py-6 lg:py-8"
        >
          <Link
            {...homeLink(lang)}
            className="inline-flex min-h-11 items-center gap-2 text-paper md:gap-3 lg:gap-4"
          >
            <Meridian header />
            <span className="font-display text-[2rem] leading-none tracking-[0.14em] md:text-5xl md:tracking-[0.16em] lg:text-7xl">
              ORBIS
            </span>
          </Link>
          {/* The editing panel stays out of the reader's menu; open it at /panel. */}
          {inPanel ? (
            <nav className="absolute inset-y-0 end-5 flex items-center gap-3 text-sm md:end-8">
              <Link {...homeLink(lang)} className="inline-flex min-h-11 items-center text-mist">
                {copy.atlas}
              </Link>
              <Link to="/panel" className="inline-flex min-h-11 items-center text-paper">
                {copy.panel}
              </Link>
            </nav>
          ) : null}
        </header>
        {menuOpen ? (
          <SiteMenu
            lang={lang}
            section={section}
            path={path}
            look={look}
            onClose={() => {
              setMenuOpen(false);
              // Back to whichever menu button is on screen: the masthead's or the page's.
              const buttons = document.querySelectorAll<HTMLButtonElement>(
                'button[aria-controls="site-menu"]',
              );
              ([...buttons].find((b) => b.offsetParent !== null) ?? menuButton.current)?.focus();
            }}
            onLang={setLang}
            onLook={setLook}
          />
        ) : null}

        <div dir={meta.dir} lang={meta.html} className="flex flex-1 flex-col">
          <nav aria-label={copy.sections} className="section-bar relative border-b border-rule">
            <div
              ref={bar}
              className="no-scrollbar flex gap-5 overflow-x-auto px-5 text-[13px] tracking-wide whitespace-nowrap md:justify-between md:gap-4 md:px-8 md:text-sm lg:text-base"
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

          <div className="flex-1">{children}</div>

          <div aria-hidden="true" className="flex items-center gap-3 px-5 pt-12 pb-10 md:px-8">
            <span className="h-px flex-1 bg-rule" />
            <span className="size-1.5 rounded-full bg-ink" />
            <span className="h-px flex-1 bg-rule" />
          </div>

          <footer className="bg-panel px-5 py-10 text-paper md:px-8">
            {/* Three columns spread to the edges: the language list ends at the right margin. */}
            <div className="grid gap-8 md:flex md:justify-between md:gap-12">
              <div ref={footerBrand} className="flex flex-col gap-3 md:max-w-sm">
                <Link
                  {...homeLink(lang)}
                  dir="ltr"
                  className="inline-flex min-h-11 items-center gap-3 self-start text-paper"
                >
                  <Meridian />
                  <span className="font-display text-xl tracking-widest">ORBIS</span>
                </Link>
                <Link
                  {...aboutLink(lang)}
                  className="inline-flex min-h-9 items-center self-start text-base text-paper"
                >
                  {aboutCopy(lang).title}
                </Link>
                <p className="text-base text-mist">{copy.colophon}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-widest text-mist">{copy.sections}</p>
                <ul className="mt-2 grid w-fit grid-cols-2 gap-x-6">
                  {THEMES.map((theme) => (
                    <li key={theme}>
                      <Link
                        {...sectionLink(lang, theme)}
                        className="inline-flex min-h-9 items-center text-base text-paper"
                      >
                        {copy.themes[theme]}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm uppercase tracking-widest text-mist">
                  {frame.languages}
                </p>
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
                            ? "inline-flex min-h-9 items-center text-base text-paper underline underline-offset-4"
                            : "inline-flex min-h-9 items-center text-base text-mist hover:text-paper"
                        }
                      >
                        {langMeta[code].name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-10 border-t border-muted pt-6 text-sm text-mist">
              © {new Date().getFullYear()} Orbis. {frame.rights}
            </p>
          </footer>
        </div>
      </div>
    </ToolsContext.Provider>
  );
}

export function fieldClass() {
  return "w-full border border-line bg-sheet px-3 py-3 text-ink";
}
