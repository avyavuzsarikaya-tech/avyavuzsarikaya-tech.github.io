import { useEffect, useState } from "react";
import { fieldClass } from "@/components/shell";
import {
  checkToken,
  PublishError,
  readToken,
  TOKEN_EVENT,
  TOKEN_PAGE,
  writeToken,
} from "@/lib/github";
import { usePublishCopy, type PublishCopy } from "@/lib/publish-copy";
import type { Lang } from "@/lib/types";

export function publishMessage(copy: PublishCopy, error: unknown): string {
  if (error instanceof PublishError) {
    if (error.kind === "auth") return copy.badToken;
    if (error.kind === "access") return copy.noAccess;
    if (error.kind === "network") return copy.network;
  }
  return copy.failed;
}

/** The saved token for this browser; empty until the page has mounted. */
export function useToken(): [string, (token: string) => void] {
  const [token, setToken] = useState("");
  useEffect(() => {
    const sync = () => setToken(readToken());
    sync();
    window.addEventListener(TOKEN_EVENT, sync);
    return () => window.removeEventListener(TOKEN_EVENT, sync);
  }, []);
  return [
    token,
    (next: string) => {
      writeToken(next);
      setToken(next);
    },
  ];
}

export function ConnectBox({ lang }: { lang: Lang }) {
  const copy = usePublishCopy(lang);
  const [token, setToken] = useToken();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function connect() {
    const value = input.trim();
    if (!value) return;
    setBusy(true);
    setError("");
    try {
      await checkToken(value);
      setToken(value);
      setInput("");
    } catch (err) {
      setError(publishMessage(copy, err));
    } finally {
      setBusy(false);
    }
  }

  if (token) {
    return (
      <section className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-5">
        <p className="inline-flex items-center gap-2 text-sm">
          <span className="size-2 rounded-full bg-pine" aria-hidden="true" />
          {copy.connected}
        </p>
        <button
          type="button"
          onClick={() => setToken("")}
          className="inline-flex min-h-11 items-center text-sm text-muted"
        >
          {copy.disconnect}
        </button>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4 border-b border-line py-8">
      <h2 className="text-2xl">{copy.connectTitle}</h2>
      <p className="max-w-2xl text-pretty">{copy.connectLead}</p>
      <ol className="flex max-w-2xl list-decimal flex-col gap-1 ps-5 text-sm">
        {copy.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <a
        href={TOKEN_PAGE}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 w-fit items-center border border-ink px-4"
      >
        {copy.makeToken}
      </a>
      <label className="flex max-w-2xl flex-col gap-2 text-sm">
        {copy.tokenLabel}
        <input
          dir="ltr"
          type="password"
          autoComplete="off"
          spellCheck={false}
          className={fieldClass()}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="github_pat_…"
        />
        <span className="text-muted">{copy.tokenHelp}</span>
      </label>
      {error ? <p className="text-sm text-pine">{error}</p> : null}
      <button
        type="button"
        onClick={() => void connect()}
        disabled={busy || !input.trim()}
        className="inline-flex min-h-11 w-fit items-center bg-pine px-4 text-paper disabled:opacity-60"
      >
        {busy ? copy.checking : copy.connect}
      </button>
    </section>
  );
}
