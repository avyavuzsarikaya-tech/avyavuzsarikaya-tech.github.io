import { Pause, Play, RotateCcw, RotateCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Pick } from "@/components/pick";
import {
  AUDIO_EVENT,
  RATES,
  SKIP_SECONDS,
  announceStart,
  fmt,
  readRate,
  writeRate,
} from "@/lib/listen";
import type { AudioClip } from "@/lib/types";

/** Back or ahead fifteen seconds: a turning arrow with the number beside it. */
export function SkipButton({
  direction,
  label,
  onClick,
}: {
  direction: "back" | "ahead";
  label: string;
  onClick: () => void;
}) {
  const Icon = direction === "back" ? RotateCcw : RotateCw;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex h-7 shrink-0 items-center gap-x-1 text-ink"
    >
      {direction === "back" ? (
        <Icon className="size-3.5 rtl:-scale-x-100" strokeWidth={1.25} aria-hidden="true" />
      ) : null}
      <span dir="ltr" className="text-[10px] tabular-nums tracking-wide" aria-hidden="true">
        {SKIP_SECONDS}
      </span>
      {direction === "ahead" ? (
        <Icon className="size-3.5 rtl:-scale-x-100" strokeWidth={1.25} aria-hidden="true" />
      ) : null}
    </button>
  );
}

const PLAYER = "reading";

export function ReadingPlayer({
  clip,
  listen,
  pause,
  speed = "Speed",
  failed = "The recording could not be played.",
  retry = "Try again",
  back = "Back 15 seconds",
  ahead = "Ahead 15 seconds",
}: {
  clip: AudioClip;
  listen: string;
  pause: string;
  speed?: string;
  failed?: string;
  retry?: string;
  back?: string;
  ahead?: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);
  // The recording would not load or play: say so, and offer another try.
  const [error, setError] = useState(false);
  const rateRef = useRef(1);
  rateRef.current = rate;

  useEffect(() => {
    setRate(readRate());
  }, []);

  // The bar at the foot of the screen started a recording: this one stops.
  useEffect(() => {
    const onStart = (event: Event) => {
      if ((event as CustomEvent<string>).detail === PLAYER) return;
      audioRef.current?.pause();
      setPlaying(false);
    };
    window.addEventListener(AUDIO_EVENT, onStart);
    return () => window.removeEventListener(AUDIO_EVENT, onStart);
  }, []);

  useEffect(() => {
    // A new language brings a new recording: start it from the top, stopped.
    setPlaying(false);
    setProgress(0);
    setDuration(0);
    setError(false);
    const audio = new Audio(clip.dataUrl);
    audio.preload = "metadata";
    audio.playbackRate = rateRef.current;
    audioRef.current = audio;
    const onTime = () => setProgress(audio.currentTime);
    const onMeta = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onEnd = () => {
      setPlaying(false);
      setProgress(0);
    };
    const onFail = () => {
      setPlaying(false);
      setError(true);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("error", onFail);
    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("error", onFail);
      audioRef.current = null;
    };
  }, [clip.dataUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.playbackRate = rate;
  }, [rate]);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    try {
      audio.playbackRate = rate;
      announceStart(PLAYER);
      await audio.play();
      setPlaying(true);
      setError(false);
    } catch {
      setPlaying(false);
      setError(true);
    }
  }

  /** Fetch the recording again after a failure (a dropped connection, say). */
  function tryAgain() {
    const audio = audioRef.current;
    if (!audio) return;
    setError(false);
    audio.load();
    void toggle();
  }

  function seek(value: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setProgress(value);
  }

  function skip(step: number) {
    const audio = audioRef.current;
    if (!audio) return;
    const end = duration || (Number.isFinite(audio.duration) ? audio.duration : 0);
    seek(Math.max(0, end ? Math.min(audio.currentTime + step, end) : audio.currentTime + step));
  }

  function changeRate(value: number) {
    setRate(value);
    writeRate(value);
    const audio = audioRef.current;
    if (audio) audio.playbackRate = value;
  }

  const span = duration > 0 ? Math.min(progress, duration) / duration : 0;
  const pct = `${span * 100}%`;

  return (
    <div className="reading-player w-full min-w-0">
      {/* One line, always: the seek line gives up width before anything moves down. */}
      <div className="flex w-full min-w-0 flex-nowrap items-center gap-x-2 sm:gap-x-3">
        <button
          type="button"
          onClick={() => void toggle()}
          aria-label={playing ? pause : listen}
          className="inline-flex h-7 shrink-0 items-center gap-x-3 text-ink"
        >
          {/* The icon's drawing starts a little inside its box; pull it back so the
              triangle lines up with the text column above (the region and date line). */}
          {playing ? (
            <Pause className="play-icon size-3" strokeWidth={1.25} aria-hidden="true" />
          ) : (
            <Play className="play-icon size-3" strokeWidth={1.25} aria-hidden="true" />
          )}
          <span className="text-[11px] uppercase tracking-[0.18em]">
            {playing ? pause : listen}
          </span>
        </button>
        <SkipButton direction="back" label={back} onClick={() => skip(-SKIP_SECONDS)} />
        <SkipButton direction="ahead" label={ahead} onClick={() => skip(SKIP_SECONDS)} />
        <div className="seek-line">
          <div className="seek-rule" aria-hidden="true">
            <span className="seek-fill" style={{ width: pct }} />
            <span className="seek-knob" style={{ insetInlineStart: pct }} />
          </div>
          <input
            className="seek"
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(progress, duration || 0)}
            aria-label={listen}
            aria-valuetext={`${fmt(progress)} / ${fmt(duration)}`}
            onChange={(event) => seek(Number(event.target.value))}
          />
        </div>
        <span dir="ltr" className="shrink-0 text-[11px] tabular-nums tracking-wide text-muted">
          {fmt(progress)}
          <span className="px-1 text-rule" aria-hidden="true">
            —
          </span>
          {fmt(duration)}
        </span>
        <span className="inline-flex shrink-0">
          <Pick
            tone="page"
            align="end"
            label={speed}
            value={String(rate)}
            onChange={(value) => changeRate(Number(value))}
            options={RATES.map((value) => ({ value: String(value), label: `${value}x` }))}
            buttonClassName="gap-1 py-0 text-[11px] tracking-widest text-muted"
          >
            <span dir="ltr" className="tabular-nums text-ink">
              {rate}×
            </span>
            <span aria-hidden="true" className="text-[9px] leading-none">
              ▾
            </span>
          </Pick>
        </span>
      </div>
      {error ? (
        <p role="alert" className="flex flex-wrap items-center gap-x-3 text-sm text-muted">
          {failed}
          <button
            type="button"
            onClick={tryAgain}
            className="inline-flex min-h-11 items-center text-pine underline underline-offset-4"
          >
            {retry}
          </button>
        </p>
      ) : null}
    </div>
  );
}
