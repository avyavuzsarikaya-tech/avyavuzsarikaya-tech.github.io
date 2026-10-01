import type { Lang } from "@/lib/types";

/**
 * Reading time, as in "4 MIN READ": plain words, no box, in the small spaced capitals of
 * the section label so the two read as one family. Cards and the reading page both use
 * it, always on a line of its own under the date, so it sits in the same place everywhere.
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
