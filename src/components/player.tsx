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
}: {
  clip: AudioClip;
  listen: string;
  pause: string;
  speed?: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);
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
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
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
    } catch {
      setPlaying(false);
    }
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
    <div className="reading-player flex w-full flex-col gap-1.5">
      <div className="flex justify-between text-sm tabular-nums text-muted">
        <span dir="ltr">{fmt(progress)}</span>
        <span dir="ltr">{fmt(duration)}</span>
      </div>
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
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
        <button
          type="button"
          onClick={() => void toggle()}
          aria-label={playing ? pause : listen}
          className={
            playing
              ? "inline-flex size-10 shrink-0 items-center justify-center border border-pine bg-paper text-ink"
              : "inline-flex size-10 shrink-0 items-center justify-center border border-ink bg-paper text-ink"
          }
        >
          {playing ? (
            <Pause className="size-4" strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <Play className="size-4 translate-x-px" strokeWidth={1.75} aria-hidden="true" />
          )}
        </button>
        <span className="text-sm text-pine">{playing ? pause : listen}</span>
        <div className="ms-auto">
          <Pick
            tone="page"
            align="end"
            label={speed}
            value={String(rate)}
            onChange={(value) => changeRate(Number(value))}
            options={RATES.map((value) => ({ value: String(value), label: `${value}x` }))}
            buttonClassName="gap-1.5 border-b border-ink py-2 text-sm text-ink"
          >
            <span className="text-muted">{speed}</span>
            <span dir="ltr" className="tabular-nums">
              {rate}x
            </span>
            <span aria-hidden="true" className="text-[10px] leading-none">
              ▾
            </span>
          </Pick>
        </div>
      </div>
    </div>
  );
}