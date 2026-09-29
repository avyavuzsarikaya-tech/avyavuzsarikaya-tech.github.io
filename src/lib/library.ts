import { create } from "zustand";
import { SEED } from "@/lib/seed";
import { isLang, type Lang, type Story } from "@/lib/types";

const DB_NAME = "orbis";
const DB_STORE = "kv";
const KEY = "stories";

type Envelope = { stories: Story[] };

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

let memory: Envelope | null = null;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("idb"));
  });
}

function idbGet(): Promise<Envelope | undefined> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, "readonly");
        const req = tx.objectStore(DB_STORE).get(KEY);
        req.onsuccess = () => resolve(req.result as Envelope | undefined);
        req.onerror = () => reject(req.error ?? new Error("idb"));
      }),
  );
}

function idbSet(value: Envelope): Promise<void> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, "readwrite");
        tx.objectStore(DB_STORE).put(value, KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error ?? new Error("idb"));
      }),
  );
}

async function readEnvelope(): Promise<Envelope> {
  if (memory) return memory;
  try {
    const stored = await idbGet();
    if (stored && Array.isArray(stored.stories)) {
      memory = stored;
      return stored;
    }
  } catch {
    /* session memory below */
  }
  memory = { stories: structuredClone(SEED) };
  try {
    await idbSet(memory);
  } catch {
    /* keep memory */
  }
  return memory;
}

async function writeEnvelope(stories: Story[]) {
  memory = { stories };
  try {
    await idbSet(memory);
  } catch {
    /* session still holds the edit */
  }
}

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
    set({ loading: true });
    const envelope = await readEnvelope();
    set({ stories: envelope.stories, lang: readLang(), ready: true, loading: false });
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
    await writeEnvelope(next);
  },
  remove: async (id) => {
    const next = get().stories.filter((item) => item.id !== id);
    set({ stories: next });
    await writeEnvelope(next);
  },
  restoreSeed: async () => {
    const have = new Set(get().stories.map((item) => item.id));
    const missing = SEED.filter((item) => !have.has(item.id)).map((item) => structuredClone(item));
    if (!missing.length) return;
    const next = [...get().stories, ...missing];
    set({ stories: next });
    await writeEnvelope(next);
  },
}));
