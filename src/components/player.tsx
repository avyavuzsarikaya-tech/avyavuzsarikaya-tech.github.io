import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Pick } from "@/components/pick";
import type { AudioClip } from "@/lib/types";

const RATES = [0.75, 1, 1.25, 1.5, 2] as const;
const RATE_KEY = "orbis-rate";

function fmt(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${mins}:${rest.toString().padStart(2, "0")}`;
}

function readRate(): number {
  try {
    const next = Number(localStorage.getItem(RATE_KEY));
    if ((RATES as readonly number[]).includes(next)) return next;
  } catch {
    /* keep default */
  }
  return 1;
}

function writeRate(value: number) {
  try {
    localStorage.setItem(RATE_KEY, String(value));
  } catch {
    /* ignore */
  }
}

export function ReadingPlayer({
  clip,
  listen,
  pause,
  speed = "Speed",
  failed = "The recording could not be played.",
  retry = "Try again",
}: {
  clip: AudioClip;
  listen: string;
  pause: string;
  speed?: string;
  failed?: string;
  retry?: string;
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

  function changeRate(value: number) {
    setRate(value);
    writeRate(value);
    const audio = audioRef.current;
    if (audio) audio.playbackRate = value;
  }

  const span = duration > 0 ? Math.min(progress, duration) / duration : 0;
  const pct = `${span * 100}%`;

  return (
    <div className="reading-player flex w-full min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
      <button
        type="button"
        onClick={() => void toggle()}
        aria-label={playing ? pause : listen}
        className="inline-flex size-7 shrink-0 items-center justify-center text-ink"
      >
        {playing ? (
          <Pause className="size-3" strokeWidth={1.25} aria-hidden="true" />
        ) : (
          <Play className="size-3 translate-x-px" strokeWidth={1.25} aria-hidden="true" />
        )}
      </button>
      <span className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-ink">
        {playing ? pause : listen}
      </span>
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
