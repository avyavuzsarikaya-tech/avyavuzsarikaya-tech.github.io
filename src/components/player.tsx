import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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

  return (
    <div className="flex w-0 min-w-full items-center gap-2.5">
      <button
        type="button"
        onClick={() => void toggle()}
        aria-label={playing ? pause : listen}
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-ink text-paper"
      >
        {playing ? (
          <Pause className="size-3.5" aria-hidden="true" />
        ) : (
          <Play className="size-3.5 translate-x-px" aria-hidden="true" />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <input
          className="seek h-4"
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Math.min(progress, duration || 0)}
          aria-label={listen}
          onChange={(event) => seek(Number(event.target.value))}
        />
        <div className="flex items-baseline gap-1.5 whitespace-nowrap text-xs">
          <span className="text-pine">{listen}</span>
          <span dir="ltr" className="tabular-nums text-muted">
            {fmt(progress)}/{fmt(duration)}
          </span>
          <label dir="ltr" className="ms-auto inline-flex items-baseline gap-1 text-muted">
            <span className="sr-only">{speed}</span>
            <select
              value={String(rate)}
              aria-label={speed}
              onChange={(event) => changeRate(Number(event.target.value))}
              className="appearance-none bg-transparent pe-0 text-xs tabular-nums text-ink"
            >
              {RATES.map((value) => (
                <option key={value} value={String(value)}>
                  {value}x
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
