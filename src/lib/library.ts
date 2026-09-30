import { create } from "zustand";
import { SEED } from "@/lib/seed";
import { isLang, type Lang, type Story } from "@/lib/types";

/**
 * The readings everyone sees are the published files (content/stories). Nothing is kept
 * in the browser: the panel writes to the repository, and after a publish the store is
 * updated in place so the editor sees the result before the site finishes rebuilding.
 */

type LibraryState = {
  ready: boolean;
  loading: boolean;
  lang: Lang;
  stories: Story[];
  load: () => Promise<void>;
  setLang: (lang: Lang) => void;
  upsert: (story: Story) => Promise<void>;
  remove: (id: string) => Promise<void>;
  restoreSeed: () => Promise<void>;
};

function readLang(): Lang {
  try {
    const saved = localStorage.getItem("orbis-lang");
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
    set({ stories: structuredClone(SEED), lang: readLang(), ready: true, loading: false });
  },
  setLang: (lang) => {
    set({ lang });
    try {
      localStorage.setItem("orbis-lang", lang);
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
  restoreSeed: async () => {
    set({ stories: structuredClone(SEED) });
  },
}));
