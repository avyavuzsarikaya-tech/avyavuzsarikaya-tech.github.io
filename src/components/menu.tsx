import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { aboutCopy } from "@/lib/about-copy";
import { useFrameCopy } from "@/lib/frame-copy";
import { langMeta, useCopy } from "@/lib/i18n";
import { aboutLink, homeLink, searchLink, sectionLink, stripLang } from "@/lib/lang-path";
import { searchCopy } from "@/lib/search";
import { LOOKS, LOOK_SWATCH, type Look } from "@/lib/look";
import { LANGS, THEMES, type Lang, type Theme } from "@/lib/types";

/**
 * Pages under the section list. Contact and the newsletter are added here later;
 * nothing else in the menu has to move.
 */
const MENU_PAGES = ["search", "about"] as const;

function Swatch({ look }: { look: Look }) {
  const [panel, paper] = LOOK_SWATCH[look];
  return (
    <span
      aria-hidden="true"
      className="me-2.5 inline-block size-3.5 shrink-0 rounded-full border border-ink/20"
      style={{ background: `linear-gradient(135deg, ${panel} 50%, ${paper} 50%)` }}
    />
  );
}

/**
 * The site menu. Opens over the page; the page behind it does not scroll.
 * Closes from the cross, a tap outside, or a link.
 */
export function SiteMenu({
  lang,
  section,
  path,
  look,
  onClose,
  onLang,
  onLook,
}: {
  lang: Lang;
  section?: Theme | "all";
  path: string;
  look: Look;
  onClose: () => void;
  onLang: (lang: Lang) => void;
  onLook: (look: Look) => void;
}) {
  const copy = useCopy(lang);
  const frame = useFrameCopy(lang);
  const meta = langMeta[lang];
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const onAbout = stripLang(path) === "/about";
  const onSearch = stripLang(path) === "/search";
  const item = (on: boolean) =>
    on
      ? "inline-flex min-h-11 items-center text-sm text-ink underline underline-offset-4"
      : "inline-flex min-h-11 items-center text-sm text-muted hover:text-ink";

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    const prevBody = body.style.overflow;
    const prevHtml = html.style.overflow;
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    closeRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      body.style.overflow = prevBody;
      html.style.overflow = prevHtml;
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label={frame.close}
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
      />
      <div
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label={frame.menu}
        dir={meta.dir}
        lang={meta.html}
        className="absolute inset-y-0 start-0 flex w-full max-w-sm flex-col bg-paper text-ink shadow-lg"
      >
        <div className="flex items-center justify-between gap-4 border-b border-rule px-5 py-3">
          <span dir="ltr" className="font-display text-lg tracking-widest">
            ORBIS
          </span>
          <button
            ref={closeRef}
            type="button"
            aria-label={frame.close}
            onClick={onClose}
            className="inline-flex min-h-11 min-w-11 items-center justify-center"
          >
            <X className="size-5" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-5 py-6">
          <nav aria-label={copy.sections}>
            <p className="text-xs uppercase tracking-widest text-muted">{copy.sections}</p>
            <ul className="mt-1 flex flex-col">
              <li>
                <Link {...homeLink(lang)} data-on={section === "all"} className={item(section === "all")} onClick={onClose}>
                  {copy.home}
                </Link>
              </li>
              {THEMES.map((theme) => (
                <li key={theme}>
                  <Link
                    {...sectionLink(lang, theme)}
                    data-on={section === theme}
                    className={item(section === theme)}
                    onClick={onClose}
                  >
                    {copy.themes[theme]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={aboutCopy(lang).title}>
            <ul className="flex flex-col">
              {MENU_PAGES.map((page) =>
                page === "search" ? (
                  <li key={page}>
                    <Link {...searchLink(lang)} className={item(onSearch)} onClick={onClose}>
                      {searchCopy(lang).title}
                    </Link>
                  </li>
                ) : page === "about" ? (
                  <li key={page}>
                    <Link {...aboutLink(lang)} className={item(onAbout)} onClick={onClose}>
                      {aboutCopy(lang).title}
                    </Link>
                  </li>
                ) : null,
              )}
            </ul>
          </nav>

          <div>
            <p className="text-xs uppercase tracking-widest text-muted">{frame.languages}</p>
            <ul className="mt-1 flex flex-col">
              {LANGS.map((code) => (
                <li key={code}>
                  <button
                    type="button"
                    lang={langMeta[code].html}
                    onClick={() => {
                      onLang(code);
                      onClose();
                    }}
                    className={item(code === lang)}
                  >
                    {langMeta[code].name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-muted">{frame.look}</p>
            <ul className="mt-1 flex flex-col">
              {LOOKS.map((code) => (
                <li key={code}>
                  <button
                    type="button"
                    aria-pressed={code === look}
                    onClick={() => onLook(code)}
                    className={item(code === look)}
                  >
                    <Swatch look={code} />
                    {frame.looks[code]}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
