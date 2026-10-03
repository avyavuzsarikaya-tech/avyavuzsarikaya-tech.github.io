import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ReadingPlayer } from "@/components/player";
import { Prose } from "@/components/prose";
import { Comments } from "@/components/members/comments";
import { LockNote, StoryVideos, useMemberText } from "@/components/members/locked";
import { ReadTime } from "@/components/read-time";
import { FrameTools, Shell } from "@/components/shell";
import { byline, editorialCopy, imageCaption } from "@/lib/editorial";
import { langMeta, useCopy } from "@/lib/i18n";
import { homeLink, readLink, rememberLang } from "@/lib/lang-path";
import { formatDate, hasCopy, readingMinutes, safeHttpUrl } from "@/lib/text";
import { LANGS, type Lang, type Story } from "@/lib/types";
import { useLang } from "@/lib/use-lang";

/**
 * A reading page, in the language of its address. `story` is the full published file,
 * loaded by the route; null when no reading has this id.
 */
export function ReadingPage({ story }: { story: Story | null }) {
  return (
    <Shell section={story?.theme}>
      <Reading story={story} />
    </Shell>
  );
}

const TYPE_STEPS = [0.9, 1, 1.1, 1.2, 1.3] as const;
const TYPE_KEY = "orbis-type";

const AI_NOTE: Record<Lang, string> = {
  tr: "Yapay zekâ ile üretilmiş görsel",
  en: "AI-generated image",
  ar: "صورة مولّدة بالذكاء الاصطناعي",
  fr: "Image générée par IA",
  es: "Imagen generada por IA",
};

const AI_VIDEO_NOTE: Record<Lang, string> = {
  tr: "Yapay zekâ ile üretilmiş video",
  en: "AI-generated video",
  ar: "فيديو مولّد بالذكاء الاصطناعي",
  fr: "Vidéo générée par IA",
  es: "Vídeo generado por IA",
};

function readType(): number {
  try {
    const next = Number(localStorage.getItem(TYPE_KEY));
    if ((TYPE_STEPS as readonly number[]).includes(next)) return next;
  } catch {
    /* keep default */
  }
  return 1;
}

function writeType(value: number) {
  try {
    localStorage.setItem(TYPE_KEY, String(value));
  } catch {
    /* ignore */
  }
}

function TypeSize({
  step,
  onDown,
  onUp,
  label,
  downLabel,
  upLabel,
}: {
  step: number;
  onDown: () => void;
  onUp: () => void;
  label: string;
  downLabel: string;
  upLabel: string;
}) {
  const atMin = step <= 0;
  const atMax = step >= TYPE_STEPS.length - 1;
  return (
    <div className="inline-flex shrink-0 items-center gap-1">
      <span className="sr-only">{label}</span>
      <button
        type="button"
        onClick={onDown}
        disabled={atMin}
        aria-label={downLabel}
        className="inline-flex size-8 items-center justify-center text-sm text-ink disabled:text-muted"
      >
        <span dir="ltr">A−</span>
      </button>
      <button
        type="button"
        onClick={onUp}
        disabled={atMax}
        aria-label={upLabel}
        className="inline-flex size-8 items-center justify-center text-sm text-ink disabled:text-muted"
      >
        <span dir="ltr">A+</span>
      </button>
    </div>
  );
}

function Reading({ story }: { story: Story | null }) {
  const lang = useLang();
  const copy = useCopy(lang);
  const [typeStep, setTypeStep] = useState(1);
  const membersOnly = story?.membersOnly === true;
  // A paid member's full text of a members-only reading; null for everyone else.
  const fullText = useMemberText(story?.id, lang, membersOnly);

  useEffect(() => {
    const saved = TYPE_STEPS.indexOf(readType() as (typeof TYPE_STEPS)[number]);
    setTypeStep(saved === -1 ? 1 : saved);
  }, []);

  function setStep(next: number) {
    const clamped = Math.min(TYPE_STEPS.length - 1, Math.max(0, next));
    setTypeStep(clamped);
    writeType(TYPE_STEPS[clamped]);
  }

  if (!story) {
    return (
      <main className="px-5 py-12 md:px-12">
        <p>{copy.missing}</p>
        <Link {...homeLink(lang)} className="mt-6 inline-flex min-h-11 items-center text-pine">
          {copy.back}
        </Link>
      </main>
    );
  }

  const locale = story.locales[lang];
  const editorial = editorialCopy(lang);
  const by = byline(story.author, lang);
  const caption = imageCaption(story.image, lang);
  const videoCaption = story.video
    ? story.video.captions?.[lang]?.trim() || story.video.credit?.trim() || ""
    : "";
  const body = fullText ?? locale.body;
  const minutes = readingMinutes(body);
  const written = hasCopy(story, lang);
  const sourceNums = new Set(story.sources.map((source) => source.n));
  const sources = [...story.sources].sort((a, b) => a.n - b.n);
  const others = LANGS.filter((code) => hasCopy(story, code));

  return (
    <main className="px-5 py-10 md:px-12 md:py-14">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <div className="flex items-center justify-between gap-4 text-sm">
          <Link {...homeLink(lang)} className="inline-flex min-h-11 items-center text-pine">
            {copy.back}
          </Link>
          <FrameTools />
        </div>

        <header className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-widest text-pine">{copy.themes[story.theme]}</p>
          <h1 className="text-4xl md:text-5xl">{locale.title || story.locales.en.title}</h1>
          {locale.dek ? (
            <p className={lang === "ar" ? "text-lg text-muted" : "text-lg text-muted italic"}>
              {locale.dek}
            </p>
          ) : null}
          {story.image ? (
            <figure className="mt-2 flex max-w-full flex-col gap-2">
              <img
                src={story.image.src}
                alt={caption}
                width={1500}
                height={1000}
                loading="lazy"
                decoding="async"
                className="block h-auto w-full max-w-full"
              />
              <figcaption className="text-xs leading-snug text-muted">
                {caption ? `${caption} · ${AI_NOTE[lang]}` : AI_NOTE[lang]}
              </figcaption>
            </figure>
          ) : null}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              {/* Place and date on the first line; the reading time under them, set as on
                  the cards, so it no longer pulls the spaced capitals into the date line. */}
              <div className="flex flex-col items-start gap-1">
                {by ? <p className="text-sm text-muted">{by}</p> : null}
                <p className="text-sm text-muted">
                  {[locale.region, formatDate(story.date, lang)].filter(Boolean).join(" · ")}
                </p>
                {story.updatedAt && story.updatedAt !== story.date ? (
                  <p className="text-sm text-muted">
                    {editorial.updated}: {formatDate(story.updatedAt, lang)}
                  </p>
                ) : null}
                {minutes ? <ReadTime minutes={minutes} lang={lang} pattern={copy.minRead} /> : null}
              </div>
              <TypeSize
                step={typeStep}
                onDown={() => setStep(typeStep - 1)}
                onUp={() => setStep(typeStep + 1)}
                label={copy.textSize}
                downLabel={copy.typeDown}
                upLabel={copy.typeUp}
              />
            </div>
            {locale.audio ? (
              <ReadingPlayer
                clip={locale.audio}
                listen={copy.listen}
                pause={copy.pause}
                speed={copy.speed}
                failed={copy.audioError}
                retry={copy.retry}
              />
            ) : null}
          </div>
        </header>

        {story.video ? (
          <figure className="flex max-w-full flex-col gap-2">
            <video
              controls
              preload="metadata"
              playsInline
              controlsList="nodownload"
              poster={story.video.poster}
              src={story.video.src}
              aria-label={videoCaption || AI_VIDEO_NOTE[lang]}
              className="block aspect-video h-auto w-full max-w-full bg-ink"
            />
            <figcaption className="text-xs leading-snug text-muted">
              {videoCaption ? `${videoCaption} · ${AI_VIDEO_NOTE[lang]}` : AI_VIDEO_NOTE[lang]}
            </figcaption>
          </figure>
        ) : null}

        <StoryVideos storyId={story.id} lang={lang} />

        {written ? (
          <div className="flex flex-col gap-8">
            <div style={{ fontSize: `${TYPE_STEPS[typeStep]}em` }}>
              <Prose body={body} sourceNums={sourceNums} sourceWord={copy.sourceWord} />
            </div>
            {membersOnly && fullText === null ? <LockNote lang={lang} /> : null}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p>{copy.unwritten}</p>
            {others.length ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted">{copy.availableIn}</span>
                {others.map((code) => (
                  <Link
                    key={code}
                    {...readLink(code, story.id)}
                    onClick={() => rememberLang(code)}
                    lang={langMeta[code].html}
                    className="inline-flex min-h-11 items-center border border-line px-3 text-sm"
                  >
                    {langMeta[code].name}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {sources.length ? (
          <section className="border-t border-line pt-8" aria-labelledby="bibliography">
            <h2 id="bibliography" className="text-2xl">
              {copy.sources}
            </h2>
            <ol className="mt-6 flex flex-col">
              {sources.map((source) => {
                const href = safeHttpUrl(source.url);
                return (
                  <li
                    key={source.n}
                    id={`source-${source.n}`}
                    className="source-row scroll-mt-24 grid grid-cols-[2.5rem_1fr] gap-3 border-b border-line py-4"
                  >
                    <span className="tabular-nums text-pine">{source.n}</span>
                    <div className="min-w-0">
                      <p>{source.label}</p>
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          dir="ltr"
                          className="mt-1 block break-all text-sm text-pine"
                        >
                          {href}
                        </a>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        ) : null}

        <Comments storyId={story.id} lang={lang} />
      </div>
    </main>
  );
}
