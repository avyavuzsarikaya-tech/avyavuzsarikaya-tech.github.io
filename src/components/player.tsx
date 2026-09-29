import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { AudioClip } from "@/lib/types";

function fmt(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${mins}:${rest.toString().padStart(2, "0")}`;
}

export function ReadingPlayer({
  clip,
  listen,
  pause,
}: {
  clip: AudioClip;
  listen: string;
  pause: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = new Audio(clip.dataUrl);
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

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    try {
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

  return (
    <div className="flex items-center gap-4 border border-line bg-sheet px-4 py-3">
      <button
        type="button"
        onClick={() => void toggle()}
        aria-label={playing ? pause : listen}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-ink text-paper"
      >
        {playing ? <Pause className="size-5" aria-hidden="true" /> : <Play className="size-5" aria-hidden="true" />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm text-pine">{listen}</p>
          <p className="truncate text-sm text-muted">{clip.name}</p>
        </div>
        <input
          className="seek"
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Math.min(progress, duration || 0)}
          aria-label={listen}
          onChange={(event) => seek(Number(event.target.value))}
        />
        <p className="text-sm tabular-nums text-muted">
          {fmt(progress)} / {fmt(duration)}
        </p>
      </div>
    </div>
  );
}
