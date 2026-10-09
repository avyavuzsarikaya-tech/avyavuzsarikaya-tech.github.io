import { Link } from "@tanstack/react-router";
import { Pause, Play, X } from "lucide-react";
import { Pick } from "@/components/pick";
import { SkipButton } from "@/components/player";
import { useCopy } from "@/lib/i18n";
import { readLink } from "@/lib/lang-path";
import {
  RATES,
  SKIP_SECONDS,
  close,
  fmt,
  retry,
  seek,
  setRate,
  skip,
  toggle,
  useListen,
} from "@/lib/listen";

/**
 * The bar at the foot of the screen that plays a reading started from a card. It stays
 * while the reader moves between pages, in the same hairline style as the reading page's
 * player: title on top (it opens the reading), then play, the 15-second jumps, the seek
 * line, the time and the speed. A spacer of the same height keeps the page's last lines
 * from sitting under it.
 */
export function ListenBar() {
  const now = useListen();
  const clip = now.clip;
  const copy = useCopy(clip?.lang ?? "en");
  if (!clip) return null;

  const span = now.duration > 0 ? Math.min(now.time, now.duration) / now.duration : 0;
  const pct = `${span * 100}%`;

  return (
    <>
      <div aria-hidden="true" className="listen-bar-space no-print h-28" />
      <section
        aria-label={copy.listen}
        className="listen-bar no-print fixed inset-x-0 bottom-0 z-40 border-t border-ink bg-sheet text-ink"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="reading-player mx-auto flex w-full max-w-3xl min-w-0 flex-col gap-1 px-5 pt-2.5 pb-2 md:px-8">
          <div className="flex min-w-0 items-center gap-x-3">
            <Link
              {...readLink(clip.lang, clip.id)}
              className="min-w-0 flex-1 truncate font-body text-sm text-ink underline-offset-4 hover:underline"
            >
              {clip.title}
            </Link>
            <button
              type="button"
              onClick={close}
              aria-label={copy.closeListen}
              title={copy.closeListen}
              className="-me-2 inline-flex size-9 shrink-0 items-center justify-center text-muted hover:text-ink"
            >
              <X className="size-4" strokeWidth={1.25} aria-hidden="true" />
            </button>
          </div>
          <div className="flex w-full min-w-0 flex-nowrap items-center gap-x-3">
            <button
              type="button"
              onClick={toggle}
              aria-label={now.playing ? copy.pause : copy.listen}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-ink text-ink"
            >
              {now.playing ? (
                <Pause className="size-3.5" strokeWidth={1.25} aria-hidden="true" />
              ) : (
                <Play
                  className="ms-0.5 size-3.5 rtl:-scale-x-100"
                  strokeWidth={1.25}
                  aria-hidden="true"
                />
              )}
            </button>
            <SkipButton
              direction="back"
              label={copy.skipBack}
              onClick={() => skip(-SKIP_SECONDS)}
            />
            <div className="seek-line">
              <div className="seek-rule" aria-hidden="true">
                <span className="seek-fill" style={{ width: pct }} />
                <span className="seek-knob" style={{ insetInlineStart: pct }} />
              </div>
              <input
                className="seek"
                type="range"
                min={0}
                max={now.duration || 0}
                step={0.1}
                value={Math.min(now.time, now.duration || 0)}
                aria-label={copy.listen}
                aria-valuetext={`${fmt(now.time)} / ${fmt(now.duration)}`}
                onChange={(event) => seek(Number(event.target.value))}
              />
            </div>
            <SkipButton
              direction="ahead"
              label={copy.skipAhead}
              onClick={() => skip(SKIP_SECONDS)}
            />
            <span
              dir="ltr"
              className="shrink-0 text-[11px] tabular-nums tracking-wide text-muted max-[360px]:hidden"
            >
              {fmt(now.time)}
              <span className="px-1 text-rule" aria-hidden="true">
                —
              </span>
              {fmt(now.duration)}
            </span>
            <span className="inline-flex shrink-0">
              <Pick
                tone="page"
                align="end"
                drop="up"
                label={copy.speed}
                value={String(now.rate)}
                onChange={(value) => setRate(Number(value))}
                options={RATES.map((value) => ({ value: String(value), label: `${value}x` }))}
                buttonClassName="min-h-8 gap-1 py-0 text-[11px] tracking-widest text-muted"
              >
                <span dir="ltr" className="tabular-nums text-ink">
                  {now.rate}×
                </span>
                <span aria-hidden="true" className="text-[9px] leading-none">
                  ▴
                </span>
              </Pick>
            </span>
          </div>
          {now.error ? (
            <p role="alert" className="flex flex-wrap items-center gap-x-3 text-sm text-muted">
              {copy.audioError}
              <button
                type="button"
                onClick={retry}
                className="inline-flex min-h-9 items-center text-pine underline underline-offset-4"
              >
                {copy.retry}
              </button>
            </p>
          ) : null}
        </div>
      </section>
    </>
  );
}
