import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { publishMessage, useToken } from "@/components/connect";
import { ReadingPlayer } from "@/components/player";
import { fieldClass } from "@/components/shell";
import { langMeta, useCopy } from "@/lib/i18n";
import { clearDraft, loadDraft, saveDraft } from "@/lib/drafts";
import { PublishError, readRepoFile } from "@/lib/github";
import { useLibrary } from "@/lib/library";
import {
  parseStoryFile,
  prepareImage,
  publishStory,
  storyFile,
  unpublishStory,
} from "@/lib/publish";
import { usePublishCopy } from "@/lib/publish-copy";
import { fromFile } from "@/lib/seed";
import { safeHttpUrl } from "@/lib/text";
import { blankStory, isTheme, LANGS, THEMES, type Lang, type Story } from "@/lib/types";

const MAX_AUDIO = 30 * 1024 * 1024;

export const Route = createFileRoute("/panel/$storyId")({
  component: EditorPage,
});

function EditorPage() {
  const { storyId } = Route.useParams();
  return <Editor storyId={storyId} />;
}

function Editor({ storyId }: { storyId: string }) {
  const ready = useLibrary((s) => s.ready);
  const lang = useLibrary((s) => s.lang);
  const upsert = useLibrary((s) => s.upsert);
  const remove = useLibrary((s) => s.remove);
  const copy = useCopy(lang);
  const pub = usePublishCopy(lang);
  const [token] = useToken();
  const [busy, setBusy] = useState(false);
  const [imageError, setImageError] = useState("");
  const navigate = useNavigate();
  const [draft, setDraft] = useState<Story | null>(null);
  const [booted, setBooted] = useState(false);
  const [editLang, setEditLang] = useState<Lang>(lang);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [audioError, setAudioError] = useState("");
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [sourceError, setSourceError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // The reading's file in the repository when editing began: null when it did not exist
  // yet, undefined until it has been read. Publishing checks it has not changed since.
  const [base, setBase] = useState<string | null | undefined>(undefined);
  // A draft from an earlier visit was put back; the changes on screen are not published.
  const [restored, setRestored] = useState(false);
  const [mediaDropped, setMediaDropped] = useState(false);
  // Publishing stopped because the reading was saved elsewhere meanwhile.
  const [stale, setStale] = useState(false);
  // The draft as last published or loaded: anything else on screen is unsaved.
  const pristine = useRef("");
  const draftRef = useRef<Story | null>(null);
  draftRef.current = draft;
  const loadedFor = useRef<string | null>(null);
  const baseFor = useRef<string | null>(null);

  function isDirty(): boolean {
    const current = draftRef.current;
    return current !== null && JSON.stringify(current) !== pristine.current;
  }

  function freshCopy(): Story | null {
    if (storyId === "new") return blankStory();
    const found = useLibrary.getState().stories.find((item) => item.id === storyId);
    return found ? structuredClone(found) : null;
  }

  useEffect(() => {
    if (!ready || loadedFor.current === storyId) return;
    // A new reading just published moves to its own address: it is already on screen.
    if (loadedFor.current === "new" && draftRef.current?.id === storyId) {
      loadedFor.current = storyId;
      return;
    }
    loadedFor.current = storyId;
    const fresh = freshCopy();
    pristine.current = fresh ? JSON.stringify(fresh) : "";
    const saved = loadDraft(storyId);
    if (saved && (storyId === "new" || saved.story.id === storyId)) {
      setDraft(saved.story);
      setBase(saved.hasBase ? saved.base : undefined);
      baseFor.current = saved.hasBase ? saved.story.id : null;
      setRestored(JSON.stringify(saved.story) !== pristine.current);
      setMediaDropped(saved.mediaDropped);
    } else {
      setDraft(fresh);
      setBase(undefined);
      baseFor.current = null;
      setRestored(false);
      setMediaDropped(false);
    }
    setBooted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, storyId]);

  // Once the device is connected, read the reading's current file from the repository.
  // If the site has not caught up with a recent save yet, the editor opens that newer text.
  useEffect(() => {
    if (!token || !booted || !draft || baseFor.current === draft.id) return;
    const id = draft.id;
    baseFor.current = id;
    let cancelled = false;
    readRepoFile(token, storyFile(id))
      .then((text) => {
        if (cancelled || draftRef.current?.id !== id) return;
        setBase(text);
        const latest = parseStoryFile(text);
        if (!latest || isDirty()) return;
        const shown = fromFile(latest);
        if (JSON.stringify(shown) === pristine.current) return;
        pristine.current = JSON.stringify(shown);
        setDraft(shown);
      })
      .catch(() => {
        // Not readable now: publishing then goes ahead without the check, as before.
        if (!cancelled) baseFor.current = null;
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, booted, draft?.id]);

  // Every change is kept in this browser shortly after it is made.
  useEffect(() => {
    if (!booted || !draft) return;
    const timer = window.setTimeout(() => {
      if (isDirty()) saveDraft(storyId, draft, base);
      else clearDraft(storyId);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [booted, draft, base, storyId]);

  // Leaving the page with unpublished changes asks first.
  useEffect(() => {
    const onLeave = (event: BeforeUnloadEvent) => {
      if (!isDirty()) return;
      const current = draftRef.current;
      if (current) saveDraft(storyId, current, base);
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [storyId, base]);

  useEffect(() => {
    setEditLang(lang);
  }, [lang]);

  if (!ready || !booted) {
    return <p className="px-5 py-12 text-muted md:px-12">{copy.loading}</p>;
  }

  if (!draft) {
    return (
      <main className="px-5 py-12 md:px-12">
        <p>{copy.missing}</p>
        <Link to="/panel" className="mt-4 inline-flex min-h-11 items-center text-pine">
          {copy.panel}
        </Link>
      </main>
    );
  }

  const locale = draft.locales[editLang];

  function patchLocale(partial: Partial<Story["locales"][Lang]>) {
    setDraft((current) => {
      if (!current) return current;
      return {
        ...current,
        locales: {
          ...current.locales,
          [editLang]: { ...current.locales[editLang], ...partial },
        },
      };
    });
    setNotice("");
  }

  function insertMarker(n: number) {
    const token = `[${n}]`;
    const el = bodyRef.current;
    setDraft((current) => {
      if (!current) return current;
      const body = current.locales[editLang].body;
      const start = el ? el.selectionStart : body.length;
      const end = el ? el.selectionEnd : body.length;
      const nextBody = `${body.slice(0, start)}${token}${body.slice(end)}`;
      requestAnimationFrame(() => {
        const node = bodyRef.current;
        if (!node) return;
        node.focus();
        const pos = start + token.length;
        node.setSelectionRange(pos, pos);
      });
      return {
        ...current,
        locales: {
          ...current.locales,
          [editLang]: { ...current.locales[editLang], body: nextBody },
        },
      };
    });
  }

  async function onSave(anyway = false) {
    if (!draft) return;
    const titled = LANGS.some((code) => draft.locales[code].title.trim());
    if (!titled) {
      setError(copy.needTitle);
      return;
    }
    if (!token) {
      setError(pub.needConnect);
      return;
    }
    setError("");
    setStale(false);
    setNotice(pub.publishing);
    setBusy(true);
    try {
      const before = useLibrary.getState().stories.find((item) => item.id === draft.id);
      // "Publish anyway" replaces whatever is there now, knowingly.
      const expected = anyway ? await readRepoFile(token, storyFile(draft.id)) : base;
      const { shown, text } = await publishStory(token, draft, before, expected);
      await upsert(shown);
      const next = structuredClone(shown);
      pristine.current = JSON.stringify(next);
      setDraft(next);
      setBase(text);
      baseFor.current = next.id;
      clearDraft(storyId);
      setRestored(false);
      setMediaDropped(false);
      setNotice(pub.published);
      if (storyId === "new") {
        await navigate({ to: "/panel/$storyId", params: { storyId: draft.id } });
      }
    } catch (err) {
      setNotice("");
      if (err instanceof PublishError && err.kind === "stale") setStale(true);
      else setError(publishMessage(pub, err));
    } finally {
      setBusy(false);
    }
  }

  /** After a conflict: drop the changes here and open the version saved elsewhere. */
  async function loadLatest() {
    if (!draft || !token) return;
    setBusy(true);
    try {
      const text = await readRepoFile(token, storyFile(draft.id));
      const latest = parseStoryFile(text);
      const next = latest ? fromFile(latest) : draft;
      pristine.current = JSON.stringify(next);
      setDraft(next);
      setBase(text);
      baseFor.current = next.id;
      clearDraft(storyId);
      setStale(false);
      setRestored(false);
      setError("");
    } catch (err) {
      setError(publishMessage(pub, err));
    } finally {
      setBusy(false);
    }
  }

  /** Puts the published text back and forgets the restored draft. */
  function discardDraft() {
    clearDraft(storyId);
    const fresh = freshCopy();
    pristine.current = fresh ? JSON.stringify(fresh) : "";
    setDraft(fresh);
    setBase(undefined);
    baseFor.current = null;
    setRestored(false);
    setMediaDropped(false);
    setStale(false);
  }

  async function onImage(file: File | undefined) {
    setImageError("");
    if (!draft || !file) return;
    try {
      const src = await prepareImage(file);
      setDraft({ ...draft, image: { src, credit: draft.image?.credit ?? "" } });
      setNotice("");
    } catch {
      setImageError(pub.imageFail);
    }
  }

  async function onFile(file: File | undefined) {
    setAudioError("");
    if (!file) return;
    if (file.size > MAX_AUDIO) {
      setAudioError(copy.audioTooBig);
      return;
    }
    try {
      const dataUrl = await readFile(file);
      patchLocale({ audio: { name: file.name, mime: file.type || "audio/mpeg", dataUrl } });
    } catch {
      setAudioError(copy.audioFail);
    }
  }

  function addSource() {
    if (!draft) return;
    if (!label.trim()) {
      setSourceError(copy.labelRequired);
      return;
    }
    const safe = safeHttpUrl(url);
    if (!safe) {
      setSourceError(copy.urlInvalid);
      return;
    }
    const n = draft.sources.reduce((max, source) => Math.max(max, source.n), 0) + 1;
    setDraft({ ...draft, sources: [...draft.sources, { n, label: label.trim(), url: safe }] });
    setLabel("");
    setUrl("");
    setSourceError("");
  }

  async function onRemove() {
    if (!draft) return;
    const published = useLibrary.getState().stories.find((item) => item.id === draft.id);
    if (published) {
      if (!token) {
        setConfirming(false);
        setError(pub.needConnect);
        return;
      }
      setBusy(true);
      try {
        await unpublishStory(token, published);
      } catch (err) {
        setConfirming(false);
        setError(publishMessage(pub, err));
        return;
      } finally {
        setBusy(false);
      }
      await remove(draft.id);
    }
    clearDraft(storyId);
    pristine.current = JSON.stringify(draft);
    await navigate({ to: "/panel" });
  }

  return (
    <main className="px-5 py-10 md:px-12 md:py-14">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <div className="flex items-center justify-between gap-4">
          <Link to="/panel" className="inline-flex min-h-11 items-center text-pine">
            {copy.panel}
          </Link>
          {storyId !== "new" ? (
            <Link
              to="/read/$storyId"
              params={{ storyId: draft.id }}
              className="inline-flex min-h-11 items-center text-muted"
            >
              {copy.openReading}
            </Link>
          ) : null}
        </div>

        {restored ? (
          <div
            role="status"
            className="flex flex-col gap-1 border border-line bg-sheet p-4 text-sm"
          >
            <p className="flex flex-wrap items-center gap-x-3">
              {pub.draftRestored}
              <button
                type="button"
                onClick={discardDraft}
                className="inline-flex min-h-11 items-center text-pine underline underline-offset-4"
              >
                {pub.discardDraft}
              </button>
            </p>
            {mediaDropped ? <p className="text-pine">{pub.draftMediaDropped}</p> : null}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            {copy.theme}
            <select
              className={fieldClass()}
              value={draft.theme}
              onChange={(event) => {
                const theme = event.target.value;
                if (isTheme(theme)) {
                  setDraft({ ...draft, theme });
                }
              }}
            >
              {THEMES.map((theme) => (
                <option key={theme} value={theme}>
                  {copy.themes[theme]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm">
            {copy.date}
            <input
              type="date"
              className={fieldClass()}
              value={draft.date}
              onChange={(event) => setDraft({ ...draft, date: event.target.value })}
            />
          </label>
        </div>

        <section className="flex flex-col gap-3 border border-line bg-sheet p-4">
          <h2 className="text-xl">{pub.image}</h2>
          <p className="text-sm text-muted">{pub.imageHint}</p>
          {draft.image ? (
            <figure className="flex flex-col gap-2">
              <img src={draft.image.src} alt="" className="max-h-80 w-full object-contain" />
            </figure>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <label className="inline-flex min-h-11 w-fit cursor-pointer items-center bg-pine px-4 text-paper">
              {draft.image ? pub.replaceImage : pub.chooseImage}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  void onImage(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </label>
            {draft.image ? (
              <button
                type="button"
                onClick={() => {
                  setDraft({ ...draft, image: undefined });
                  setNotice("");
                }}
                className="inline-flex min-h-11 w-fit items-center border border-line px-4"
              >
                {pub.removeImage}
              </button>
            ) : null}
          </div>
          {imageError ? <p className="text-sm text-pine">{imageError}</p> : null}
          {draft.image ? (
            <label className="flex flex-col gap-2 text-sm">
              {pub.credit}
              <input
                className={fieldClass()}
                value={draft.image.credit}
                onChange={(event) => {
                  if (!draft.image) return;
                  setDraft({ ...draft, image: { ...draft.image, credit: event.target.value } });
                  setNotice("");
                }}
              />
            </label>
          ) : null}
        </section>

        <label className="flex flex-col gap-2 text-sm">
          {copy.language}
          <select
            value={editLang}
            onChange={(event) => {
              const next = event.target.value;
              if (next === "tr" || next === "ar" || next === "en" || next === "fr" || next === "es")
                setEditLang(next);
            }}
            className={fieldClass()}
          >
            {LANGS.map((code) => (
              <option key={code} value={code} lang={langMeta[code].html}>
                {langMeta[code].name}
                {draft.locales[code].audio ? ` — ${copy.recordingOn}` : ""}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm">
            {copy.title}
            <input
              lang={langMeta[editLang].html}
              dir={langMeta[editLang].dir}
              className={fieldClass()}
              value={locale.title}
              onChange={(event) => patchLocale({ title: event.target.value })}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            {copy.dek}
            <textarea
              lang={langMeta[editLang].html}
              dir={langMeta[editLang].dir}
              className={`${fieldClass()} min-h-24`}
              value={locale.dek}
              onChange={(event) => patchLocale({ dek: event.target.value })}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            {copy.region}
            <input
              lang={langMeta[editLang].html}
              dir={langMeta[editLang].dir}
              className={fieldClass()}
              value={locale.region}
              onChange={(event) => patchLocale({ region: event.target.value })}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            {copy.body}
            <textarea
              ref={bodyRef}
              lang={langMeta[editLang].html}
              dir={langMeta[editLang].dir}
              className={`${fieldClass()} min-h-64`}
              value={locale.body}
              onChange={(event) => patchLocale({ body: event.target.value })}
            />
            <span className="text-muted">{copy.bodyHint}</span>
          </label>

          <section className="flex flex-col gap-3 border border-line bg-sheet p-4">
            <h2 className="text-xl">{copy.audio}</h2>
            <p className="text-sm text-muted">{copy.audioHint}</p>
            <label className="inline-flex min-h-11 w-fit cursor-pointer items-center bg-pine px-4 text-paper">
              {locale.audio ? copy.replaceAudio : copy.upload}
              <input
                type="file"
                accept="audio/*"
                className="sr-only"
                onChange={(event) => {
                  void onFile(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </label>
            {audioError ? <p className="text-sm text-pine">{audioError}</p> : null}
            {locale.audio ? (
              <div className="flex flex-col gap-3">
                <ReadingPlayer clip={locale.audio} listen={copy.listen} pause={copy.pause} />
                <button
                  type="button"
                  onClick={() => patchLocale({ audio: null })}
                  className="inline-flex min-h-11 w-fit items-center border border-line px-4"
                >
                  {copy.removeAudio}
                </button>
              </div>
            ) : null}
          </section>
        </div>

        <section className="flex flex-col gap-4 border-t border-line pt-8">
          <h2 className="text-2xl">{copy.sources}</h2>
          <p className="text-sm text-muted">{copy.sourcesLead}</p>
          {draft.sources.length === 0 ? <p className="text-muted">{copy.noSources}</p> : null}
          <ul className="flex flex-col gap-4">
            {[...draft.sources]
              .sort((a, b) => a.n - b.n)
              .map((source) => (
                <li
                  key={source.n}
                  className="grid gap-3 border border-line p-4 md:grid-cols-[auto_1fr_auto]"
                >
                  <span className="text-pine tabular-nums">{source.n}</span>
                  <div className="min-w-0">
                    <p>{source.label}</p>
                    <p dir="ltr" className="break-all text-sm text-muted">
                      {source.url}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => insertMarker(source.n)}
                      className="inline-flex min-h-11 items-center border border-line px-3 text-sm"
                    >
                      {copy.insert} [{source.n}]
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          sources: draft.sources.filter((item) => item.n !== source.n),
                        })
                      }
                      className="inline-flex min-h-11 items-center px-3 text-sm text-muted"
                    >
                      {copy.remove}
                    </button>
                  </div>
                </li>
              ))}
          </ul>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm">
              {copy.sourceLabel}
              <input
                className={fieldClass()}
                value={label}
                onChange={(event) => setLabel(event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              {copy.sourceUrl}
              <input
                dir="ltr"
                className={fieldClass()}
                value={url}
                placeholder="https://"
                onChange={(event) => setUrl(event.target.value)}
              />
            </label>
          </div>
          {sourceError ? <p className="text-sm text-pine">{sourceError}</p> : null}
          <button
            type="button"
            onClick={addSource}
            className="inline-flex min-h-11 w-fit items-center border border-ink px-4"
          >
            {copy.addSource}
          </button>
        </section>

        {error ? <p className="text-pine">{error}</p> : null}
        {stale ? (
          <div role="alert" className="flex flex-col gap-3 border border-line bg-sheet p-4">
            <p className="text-pine">{pub.stale}</p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void onSave(true)}
                disabled={busy}
                className="inline-flex min-h-11 items-center bg-pine px-4 text-paper disabled:opacity-60"
              >
                {pub.publishAnyway}
              </button>
              <button
                type="button"
                onClick={() => void loadLatest()}
                disabled={busy}
                className="inline-flex min-h-11 items-center border border-line px-4 disabled:opacity-60"
              >
                {pub.loadLatest}
              </button>
            </div>
          </div>
        ) : null}
        {notice ? <p className="text-pine">{notice}</p> : null}
        {!token ? (
          <p className="text-sm text-muted">
            {pub.needConnect}{" "}
            <Link to="/panel" className="text-pine">
              {copy.panel}
            </Link>
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
          <button
            type="button"
            onClick={() => void onSave()}
            disabled={busy}
            className="inline-flex min-h-11 items-center bg-pine px-4 text-paper disabled:opacity-60"
          >
            {busy ? pub.publishing : copy.save}
          </button>
          {storyId !== "new" && !confirming ? (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="inline-flex min-h-11 items-center px-4 text-muted"
            >
              {copy.removeStory}
            </button>
          ) : null}
          {confirming ? (
            <>
              <button
                type="button"
                onClick={() => void onRemove()}
                disabled={busy}
                className="inline-flex min-h-11 items-center bg-ink px-4 text-paper"
              >
                {copy.confirmRemove}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="inline-flex min-h-11 items-center px-4"
              >
                {copy.cancel}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("read"));
    reader.readAsDataURL(file);
  });
}
