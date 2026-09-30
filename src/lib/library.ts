import { create } from "zustand";
import { LANG_KEY } from "@/lib/lang-path";
import { loadAllStories } from "@/lib/seed";
import { isLang, type Lang, type Story } from "@/lib/types";

/**
 * The editing panel's copy of every reading, in full. Reader pages do not use it: they take
 * their language from the address and their text from the published files (see seed.ts).
 * After a publish the store is updated in place, so the editor sees the result before
 * the site finishes rebuilding.
 */

type LibraryState = {
  ready: boolean;
  loading: boolean;
  /** The panel's language: the last one the reader chose anywhere on the site. */
  lang: Lang;
  stories: Story[];
  load: () => Promise<void>;
  setLang: (lang: Lang) => void;
  upsert: (story: Story) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

function readLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && isLang(saved)) return saved;
  } catch {
    /* ignore */
  }
  return "en";
}

export const useLibrary = create<LibraryState>((set, get) => ({
  ready: false,
  loading: false,
  lang: "en",
  stories: [],
  load: async () => {
    if (get().ready || get().loading) return;
    set({ loading: true, lang: readLang() });
    const stories = await loadAllStories();
    set({ stories, ready: true, loading: false });
  },
  setLang: (lang) => {
    set({ lang });
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* ignore */
    }
  },
  upsert: async (story) => {
    const next = get().stories.some((item) => item.id === story.id)
      ? get().stories.map((item) => (item.id === story.id ? story : item))
      : [...get().stories, story];
    set({ stories: next });
  },
  remove: async (id) => {
    set({ stories: get().stories.filter((item) => item.id !== id) });
  },
}));
