import type { Lang } from "@/lib/types";

/**
 * Reading time, as in "4 MIN READ", plain words, no box, in the small spaced capitals of
 * the section label so the two read as one family. Used on the cards only; the reading page does not show it.
 * Arabic has no capitals and is not letter-spaced.
 */
export function ReadTime({
  minutes,
  lang,
  pattern,
}: {
  minutes: number;
  lang: Lang;
  pattern: string;
}) {
  return (
    <p
      className={
        lang === "ar"
          ? "text-xs whitespace-nowrap text-muted tabular-nums"
          : "text-xs whitespace-nowrap text-muted uppercase tracking-widest tabular-nums"
      }
    >
      {pattern.replace("{n}", String(minutes))}
    </p>
  );
}
