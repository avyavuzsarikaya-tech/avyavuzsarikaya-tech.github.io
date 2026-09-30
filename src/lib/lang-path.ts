import { LANGS, type Lang, type Theme } from "@/lib/types";

/**
 * Every page exists once per language. English, the default, keeps the plain address
 * (/read/carbon-books); the others carry their code in front (/tr/read/carbon-books).
 * A shared link therefore opens in the language it was read in.
 */

export const LANG_KEY = "orbis-lang";
export const DEFAULT_LANG: Lang = "en";
/** Languages whose pages carry a prefix: all but the default. */
export const PREFIXED = LANGS.filter((code) => code !== DEFAULT_LANG);

export function isPrefixed(value: string): value is Lang {
  return (PREFIXED as readonly string[]).includes(value);
}

/** The language a reader page is in, read from its address. */
export function langFromPath(pathname: string): Lang {
  const first = pathname.split("/")[1] ?? "";
  return isPrefixed(first) ? first : DEFAULT_LANG;
}

/** The address without its language prefix: /tr/read/x → /read/x, /tr → /. */
export function stripLang(pathname: string): string {
  const first = pathname.split("/")[1] ?? "";
  if (!isPrefixed(first)) return pathname || "/";
  return pathname.slice(first.length + 1) || "/";
}

/** The same page in another language. */
export function withLang(lang: Lang, path: string): string {
  const bare = stripLang(path);
  if (lang === DEFAULT_LANG) return bare;
  return bare === "/" ? `/${lang}` : `/${lang}${bare}`;
}

/**
 * The address a crawler should use. A language's front page is a folder on the host
 * (tr/index.html), which answers at /tr/ without a redirect.
 */
export function publicPath(lang: Lang, path: string): string {
  const full = withLang(lang, path);
  return lang !== DEFAULT_LANG && stripLang(path) === "/" ? `${full}/` : full;
}

/** Keeps the reader's choice: the panel opens in it, and plain addresses lead to it. */
export function rememberLang(lang: Lang) {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    /* the address still carries the language */
  }
}

// Link targets for <Link {...}>, one per page kind.
export function homeLink(lang: Lang) {
  return lang === DEFAULT_LANG
    ? ({ to: "/" } as const)
    : ({ to: "/$section", params: { section: lang } } as const);
}

export function sectionLink(lang: Lang, theme: Theme) {
  return lang === DEFAULT_LANG
    ? ({ to: "/$section", params: { section: theme } } as const)
    : ({ to: "/$lang/$section", params: { lang, section: theme } } as const);
}

export function readLink(lang: Lang, storyId: string) {
  return lang === DEFAULT_LANG
    ? ({ to: "/read/$storyId", params: { storyId } } as const)
    : ({ to: "/$lang/read/$storyId", params: { lang, storyId } } as const);
}

/**
 * Runs in <head> before the page paints.
 * 1. An old section link (/?s=climate) goes to the section's own address (/climate).
 * 2. A reader who chose another language earlier and opens a plain (English) address goes
 *    straight to the same page in that language. An address that already names a
 *    language is never changed, and the panel is left alone.
 */
const PLAIN_PAGE = `/^\\/(${[...PREFIXED, "panel"].join("|")})(\\/|$)/`;
export const LANG_BOOT = [
  "try{",
  'var p=location.pathname,s=new URLSearchParams(location.search).get("s");',
  'if(p==="/"&&s&&/^[a-z-]+$/.test(s)){location.replace("/"+s)}else{',
  `var l=localStorage.getItem("${LANG_KEY}");`,
  `if(l&&${JSON.stringify(PREFIXED)}.indexOf(l)>-1&&!${PLAIN_PAGE}.test(p)){`,
  'location.replace("/"+l+(p==="/"?"":p)+location.search+location.hash)}}',
  "}catch(e){}",
].join("");
