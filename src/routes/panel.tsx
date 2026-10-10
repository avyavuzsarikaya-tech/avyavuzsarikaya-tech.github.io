import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ConnectBox, useToken } from "@/components/connect";
import { Shell } from "@/components/shell";
import { checkToken, readToken } from "@/lib/github";
import { useCopy } from "@/lib/i18n";
import { useLibrary } from "@/lib/library";
import { SITE_NAME } from "@/lib/site";

export const Route = createFileRoute("/panel")({
  head: () => ({
    meta: [{ title: `Panel — ${SITE_NAME}` }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: PanelLayout,
});

/**
 * The panel opens only for the editor: a GitHub token that may write to the site's
 * repository. Until one is checked, the page shows the sign-in box and nothing else —
 * no list of readings, no editing links.
 */
function PanelLayout() {
  const lang = useLibrary((s) => s.lang);
  const load = useLibrary((s) => s.load);
  const copy = useCopy(lang);
  const [token, setToken] = useToken();
  const [state, setState] = useState<"checking" | "in" | "out">("checking");

  useEffect(() => {
    const saved = token || readToken();
    if (!saved) {
      setState("out");
      return;
    }
    let live = true;
    setState("checking");
    checkToken(saved)
      .then(() => {
        if (live) setState("in");
      })
      .catch(() => {
        if (!live) return;
        setToken("");
        setState("out");
      });
    return () => {
      live = false;
    };
    // setToken is a fresh function each render; the check follows the token only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // The panel edits every reading, so it loads them all in full — once the editor is in.
  useEffect(() => {
    if (state === "in") void load();
  }, [state, load]);

  return (
    <Shell>
      {state === "in" ? (
        <Outlet />
      ) : state === "checking" ? (
        <p className="px-5 py-16 text-muted md:px-12">{copy.loading}</p>
      ) : (
        <main className="px-5 py-10 md:px-12 md:py-14">
          <h1 className="text-4xl">{copy.panel}</h1>
          <ConnectBox lang={lang} />
        </main>
      )}
    </Shell>
  );
}
