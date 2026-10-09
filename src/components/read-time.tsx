import { Pause, Play } from "lucide-react";
import type { KeyboardEvent, MouseEvent } from "react";
import { useCopy } from "@/lib/i18n";
import { listenTo, useListen, type ListenClip } from "@/lib/listen";
import { storyTitle } from "@/lib/text";
import type { Lang, StoryCard } from "@/lib/types";

/**
 * Reading time, as in "4 MIN READ", plain words, no box, in the small spaced capitals of
 * the section label so the two read as one family. Used on the cards only; the reading page does not show it.
 * Arabic has no capitals and is not letter-spaced.
 *
 * When the reading has a recording in this language, "· ▶ LISTEN" follows on the same
 * line, in the same letters: pressing it plays the recording in the bar at the foot of
 * the screen without opening the reading.
 */
export function ReadTime({
  minutes,
  lang,
  pattern,
  story,
}: {
  minutes: number;
  lang: Lang;
  pattern: string;
  /** The card's reading; with a recording in `lang`, the line offers to listen. */
  story?: StoryCard;
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
      {story ? <CardListen story={story} lang={lang} /> : null}
    </p>
  );
}

/** " · ▶ LISTEN" after a card's reading time, when the reading has a recording in `lang`. */
export function CardListen({ story, lang }: { story: StoryCard; lang: Lang }) {
  const src = story.locales[lang].audio;
  if (!src) return null;
  return (
    <>
      <span aria-hidden="true" className="text-muted">
        {" · "}
      </span>
      <ListenMark clip={{ id: story.id, lang, title: storyTitle(story, lang), src }} />
    </>
  );
}

/**
 * The "Listen" word on a card. The card itself is a link, so this is a span acting as a
 * button: it stops the link from opening and starts (or pauses) the recording instead.
 */
function ListenMark({ clip }: { clip: ListenClip }) {
  const copy = useCopy(clip.lang);
  const now = useListen();
  const mine = now.clip?.src === clip.src;
  const playing = mine && now.playing;

  function press(event: MouseEvent | KeyboardEvent) {
    event.preventDefault();
    event.stopPropagation();
    listenTo(clip);
  }

  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={`${playing ? copy.pause : copy.listen}: ${clip.title}`}
      aria-pressed={playing}
      onClick={press}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") press(event);
      }}
      className="listen-mark -my-2 inline-flex cursor-pointer items-center gap-x-1.5 py-2 text-ink hover:underline hover:underline-offset-4"
    >
      {playing ? (
        <Pause className="size-2.5" strokeWidth={1.5} aria-hidden="true" />
      ) : (
        <Play className="size-2.5 rtl:-scale-x-100" strokeWidth={1.5} aria-hidden="true" />
      )}
      {playing ? copy.pause : copy.listen}
    </span>
  );
}
