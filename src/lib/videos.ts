import INDEX from "virtual:orbis-videos";
import { mediaUrl } from "@/lib/seed";
import type { Lang, Video, VideoCard } from "@/lib/types";

/**
 * Videos stand on their own: each is a file in content/videos/<id>.json, with no reading
 * or issue behind it. The front page's media strip and the list of videos work from
 * VIDEOS (no transcripts); a video's page loads its own file, transcript included.
 */
const files = import.meta.glob<Video>("/content/videos/*.json", { import: "default" });

export const VIDEOS: VideoCard[] = INDEX.map((card) => ({
  ...card,
  src: mediaUrl(card.src),
  poster: card.poster ? mediaUrl(card.poster) : undefined,
}));

/** The videos with a title in this language, newest first. */
export function videosIn(lang: Lang): VideoCard[] {
  return VIDEOS.filter((video) => Boolean(video.locales[lang]?.title));
}

export function findVideo(id: string): VideoCard | undefined {
  return VIDEOS.find((video) => video.id === id);
}

/** The full video, or null when no published file has this id. */
export async function loadVideo(id: string): Promise<Video | null> {
  const card = findVideo(id);
  const load = card ? files[`/content/videos/${card.file}`] : undefined;
  if (!load) return null;
  const video = structuredClone(await load());
  return {
    ...video,
    id: card!.id,
    src: mediaUrl(video.src),
    poster: video.poster ? mediaUrl(video.poster) : undefined,
  };
}

/** 95 seconds → "1:35". */
export function formatDuration(seconds?: number): string {
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) return "";
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export type VideoWords = {
  /** The strip's label and the list page's title. */
  videos: string;
  /** The link at the strip's top right. */
  showAll: string;
  /** The small label on a video, where a reading shows its section. */
  video: string;
  readTranscript: string;
  hideTranscript: string;
  /** Under the list's title. */
  listNote: string;
  missing: string;
  /** The list page while there is no video yet. */
  empty: string;
  back: string;
};

const WORDS: Record<Lang, VideoWords> = {
  tr: {
    videos: "Videolar",
    showAll: "Tümünü göster",
    video: "Video",
    readTranscript: "Transkripti oku",
    hideTranscript: "Transkripti kapat",
    listNote: "Orbis'in bütün videoları, en yeniden en eskiye.",
    missing: "Bu video bulunamadı.",
    empty: "Henüz video yok.",
    back: "Bütün videolar",
  },
  en: {
    videos: "Videos",
    showAll: "Show all",
    video: "Video",
    readTranscript: "Read the transcript",
    hideTranscript: "Hide the transcript",
    listNote: "Every Orbis video, newest first.",
    missing: "This video could not be found.",
    empty: "No videos yet.",
    back: "All videos",
  },
  ar: {
    videos: "الفيديوهات",
    showAll: "عرض الكل",
    video: "فيديو",
    readTranscript: "اقرأ النص",
    hideTranscript: "إخفاء النص",
    listNote: "كل فيديوهات أوربيس، من الأحدث إلى الأقدم.",
    missing: "تعذّر العثور على هذا الفيديو.",
    empty: "لا توجد فيديوهات بعد.",
    back: "كل الفيديوهات",
  },
  fr: {
    videos: "Vidéos",
    showAll: "Tout afficher",
    video: "Vidéo",
    readTranscript: "Lire la transcription",
    hideTranscript: "Masquer la transcription",
    listNote: "Toutes les vidéos d’Orbis, des plus récentes aux plus anciennes.",
    missing: "Cette vidéo est introuvable.",
    empty: "Pas encore de vidéo.",
    back: "Toutes les vidéos",
  },
  es: {
    videos: "Vídeos",
    showAll: "Ver todos",
    video: "Vídeo",
    readTranscript: "Leer la transcripción",
    hideTranscript: "Ocultar la transcripción",
    listNote: "Todos los vídeos de Orbis, del más reciente al más antiguo.",
    missing: "No se encontró este vídeo.",
    empty: "Todavía no hay vídeos.",
    back: "Todos los vídeos",
  },
};

export function videoWords(lang: Lang): VideoWords {
  return WORDS[lang];
}
