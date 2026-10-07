import { Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Shell, fieldClass } from "@/components/shell";
import { MEMBERS, membersOn } from "@/lib/members/config";
import { errorText, membersCopy } from "@/lib/members/copy";
import { safeBack } from "@/lib/members/rules";
import { isPaid, refreshProfile, supabase, useMember } from "@/lib/members/session";
import { formatDate } from "@/lib/text";
import type { Lang } from "@/lib/types";
import { useLang } from "@/lib/use-lang";

function backFromAddress(): string | null {
  try {
    return safeBack(new URLSearchParams(window.location.search).get("back"));
  } catch {
    return null;
  }
}

export const buttonClass =
  "inline-flex min-h-11 items-center justify-center bg-ink px-5 text-sm text-paper disabled:opacity-50";
export const quietButtonClass =
  "inline-flex min-h-11 items-center text-sm text-pine underline-offset-4 hover:underline disabled:opacity-50";

/** The account page: sign in, or the member's name, membership and sign-out. */
export function AccountPage() {
  const lang = useLang();
  const words = membersCopy(lang);
  return (
    <Shell>
      <main className="px-5 py-10 md:px-12 md:py-14">
        <div className="mx-auto flex max-w-xl flex-col gap-8">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-3xl md:text-4xl">{words.account}</h1>
          </div>
          <Account lang={lang} />
        </div>
      </main>
    </Shell>
  );
}

function Account({ lang }: { lang: Lang }) {
  const words = membersCopy(lang);
  const member = useMember();
  const [back, setBack] = useState<string | null>(null);
  useEffect(() => setBack(backFromAddress()), []);

  if (!membersOn || member.status === "off") return <p className="text-muted">{words.closed}</p>;
  if (member.status === "loading") return <p className="text-muted">{words.loading}</p>;
  if (member.status === "out") return <SignIn lang={lang} />;

  const profile = member.profile;
  const status =
    profile?.role === "editor"
      ? words.editor
      : isPaid(profile) && profile?.paid_until
        ? words.paid(formatDate(profile.paid_until.slice(0, 10), lang))
        : words.free;

  return (
    <div className="flex flex-col gap-8">
      {back ? (
        <a href={back} className="inline-flex min-h-11 items-center self-start text-pine">
          {words.backToReading}
        </a>
      ) : null}
      <div className="flex flex-col gap-1 border-y border-line py-5">
        <p dir="ltr" className="text-start">
          {member.user.email}
        </p>
        <p className="text-sm text-muted">{status}</p>
        {!isPaid(profile) ? <p className="text-sm text-muted">{words.paidSoon}</p> : null}
      </div>
      <NameForm lang={lang} userId={member.user.id} current={profile?.display_name ?? ""} />
      {profile?.role === "editor" ? (
        <Link to="/editor" className="inline-flex min-h-11 items-center self-start text-pine">
          Editör paneli
        </Link>
      ) : null}
      <button
        type="button"
        className={`${quietButtonClass} self-start`}
        onClick={() => void supabase().then((client) => client.auth.signOut())}
      >
        {words.signOut}
      </button>
    </div>
  );
}

/** The name shown on the member's comments. */
export function NameForm({
  lang,
  userId,
  current,
  onSaved,
}: {
  lang: Lang;
  userId: string;
  current: string;
  onSaved?: () => void;
}) {
  const words = membersCopy(lang);
  const [name, setName] = useState(current);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => setName(current), [current]);

  async function save(event: FormEvent) {
    event.preventDefault();
    const value = name.trim();
    if (value.length < 2 || value.length > 40) {
      setNote(words.nameHint);
      return;
    }
    setBusy(true);
    setNote("");
    try {
      const client = await supabase();
      const { error } = await client.from("profiles").update({ display_name: value }).eq("id", userId);
      if (error) throw error;
      await refreshProfile();
      setNote(words.saved);
      onSaved?.();
    } catch (error) {
      setNote(errorText(error, lang));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-2">
      <label className="flex flex-col gap-2">
        <span className="text-sm">{words.name}</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={40}
          autoComplete="nickname"
          className={fieldClass()}
        />
      </label>
      <p className="text-xs text-muted">{words.nameHint}</p>
      <div className="flex items-center gap-4">
        <button type="submit" disabled={busy} className={buttonClass}>
          {words.save}
        </button>
        {note ? (
          <p role="status" className="text-sm text-muted">
            {note}
          </p>
        ) : null}
      </div>
    </form>
  );
}

/**
 * Sign in or sign up with an e-mail: Supabase sends a link and a 6-digit code. The code
 * is the sure way on a phone, where the link may open in another browser.
 */
function SignIn({ lang }: { lang: Lang }) {
  const words = membersCopy(lang);
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(event: FormEvent) {
    event.preventDefault();
    const address = email.trim();
    if (!address) return;
    setBusy(true);
    setError("");
    try {
      const client = await supabase();
      const { error } = await client.auth.signInWithOtp({
        email: address,
        options: { emailRedirectTo: window.location.href, shouldCreateUser: true },
      });
      if (error) throw error;
      setSentTo(address);
    } catch (err) {
      setError(errorText(err, lang));
    } finally {
      setBusy(false);
    }
  }

  async function verify(event: FormEvent) {
    event.preventDefault();
    if (!sentTo) return;
    setBusy(true);
    setError("");
    try {
      const client = await supabase();
      const { error } = await client.auth.verifyOtp({
        email: sentTo,
        token: code.trim(),
        type: "email",
      });
      if (error) throw error;
    } catch (err) {
      setError(errorText(err, lang));
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setError("");
    try {
      const client = await supabase();
      const { error } = await client.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.href },
      });
      if (error) throw error;
    } catch (err) {
      setError(errorText(err, lang));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl">{words.signIn}</h2>
      {sentTo ? (
        <form onSubmit={verify} className="flex flex-col gap-4">
          <p className="text-muted">{words.sent(sentTo)}</p>
          <label className="flex flex-col gap-2">
            <span className="text-sm">{words.code}</span>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              dir="ltr"
              maxLength={10}
              className={`${fieldClass()} tracking-[0.3em]`}
            />
          </label>
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" disabled={busy || code.trim().length < 6} className={buttonClass}>
              {words.verify}
            </button>
            <button
              type="button"
              className={quietButtonClass}
              onClick={() => {
                setSentTo(null);
                setCode("");
              }}
            >
              {words.otherEmail}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={send} className="flex flex-col gap-4">
          <p className="text-muted">{words.signInIntro}</p>
          <label className="flex flex-col gap-2">
            <span className="text-sm">{words.email}</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              dir="ltr"
              className={fieldClass()}
            />
          </label>
          <button type="submit" disabled={busy} className={`${buttonClass} self-start`}>
            {words.send}
          </button>
        </form>
      )}
      {MEMBERS.google && !sentTo ? (
        <button
          type="button"
          onClick={() => void google()}
          className="inline-flex min-h-11 items-center justify-center self-start border border-ink px-5 text-sm"
        >
          {words.google}
        </button>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-pine">
          {error}
        </p>
      ) : null}
    </div>
  );
}
