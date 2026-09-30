import { commit, dataUrlBase64, textToBase64, type Change } from "@/lib/github";
import { mediaPath, mediaUrl } from "@/lib/seed";
import { LANGS, type Story } from "@/lib/types";

/**
 * Turns a saved reading into repository changes:
 * - content/stories/<id>.json holds the text, sources and media paths;
 * - a newly chosen recording goes to public/audio/ (the build copies it to audio/);
 * - a newly chosen picture goes to images/ at the site root, served as it is;
 * - media the reading no longer uses is deleted.
 * New media gets a fresh name each time, so a replaced file is never served from cache.
 */

const AUDIO_EXT: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/aac": "aac",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/ogg": "ogg",
  "audio/webm": "webm",
};

function audioExt(mime: string, name: string): string {
  const fromName = /\.([a-z0-9]{2,4})$/i.exec(name)?.[1]?.toLowerCase();
  return AUDIO_EXT[mime] ?? fromName ?? "mp3";
}

function stamp(): string {
  return Date.now().toString(36);
}

/** Where a stored media path lives in the repository. */
function repoPathOf(stored: string): string | null {
  if (stored.startsWith("audio/")) return `public/${stored}`;
  if (stored.startsWith("images/")) return stored;
  return null;
}

function mediaOf(story: Story | undefined): Set<string> {
  const out = new Set<string>();
  if (!story) return out;
  for (const lang of LANGS) {
    const audio = story.locales[lang].audio;
    if (audio && !audio.dataUrl.startsWith("data:")) out.add(mediaPath(audio.dataUrl));
  }
  if (story.image && !story.image.src.startsWith("data:")) out.add(mediaPath(story.image.src));
  return out;
}

export async function publishStory(
  token: string,
  draft: Story,
  before: Story | undefined,
): Promise<Story> {
  const changes: Change[] = [];
  const file = structuredClone(draft);
  const when = stamp();

  for (const lang of LANGS) {
    const audio = file.locales[lang].audio;
    if (!audio) continue;
    if (audio.dataUrl.startsWith("data:")) {
      const stored = `audio/${file.id}-${lang}-${when}.${audioExt(audio.mime, audio.name)}`;
      changes.push({ path: `public/${stored}`, base64: dataUrlBase64(audio.dataUrl) });
      audio.dataUrl = stored;
    } else {
      audio.dataUrl = mediaPath(audio.dataUrl);
    }
  }

  if (file.image) {
    if (file.image.src.startsWith("data:")) {
      const stored = `images/${file.id}-${when}.jpg`;
      changes.push({ path: stored, base64: dataUrlBase64(file.image.src) });
      file.image.src = stored;
    } else {
      file.image.src = mediaPath(file.image.src);
    }
    file.image.credit = file.image.credit.trim();
  } else {
    delete file.image;
  }

  const keep = mediaOf(file);
  for (const old of mediaOf(before)) {
    const path = repoPathOf(old);
    if (path && !keep.has(old)) changes.push({ path, base64: null });
  }

  changes.push({
    path: `content/stories/${file.id}.json`,
    base64: textToBase64(`${JSON.stringify(file, null, 2)}\n`),
  });
  const title = LANGS.map((lang) => file.locales[lang].title.trim()).find(Boolean) ?? file.id;
  await commit(token, `Panel: ${title}`, changes);

  // What the site will show once rebuilt, with media addressed as the pages serve it.
  const shown = structuredClone(file);
  for (const lang of LANGS) {
    const audio = shown.locales[lang].audio;
    if (audio) audio.dataUrl = mediaUrl(audio.dataUrl);
  }
  if (shown.image) shown.image.src = mediaUrl(shown.image.src);
  return shown;
}

export async function unpublishStory(token: string, story: Story): Promise<void> {
  const changes: Change[] = [{ path: `content/stories/${story.id}.json`, base64: null }];
  for (const old of mediaOf(story)) {
    const path = repoPathOf(old);
    if (path) changes.push({ path, base64: null });
  }
  const title = LANGS.map((lang) => story.locales[lang].title.trim()).find(Boolean) ?? story.id;
  await commit(token, `Panel: remove ${title}`, changes);
}

/** A picture from the phone or computer, scaled to at most 2000 px on its long side as JPEG. */
export async function prepareImage(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("image"));
      el.src = url;
    });
    const long = Math.max(img.naturalWidth, img.naturalHeight);
    const scale = long > 2000 ? 2000 / long : 1;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.86);
  } finally {
    URL.revokeObjectURL(url);
  }
}
