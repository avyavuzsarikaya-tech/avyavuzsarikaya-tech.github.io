import { useRouterState } from "@tanstack/react-router";
import { langFromPath } from "@/lib/lang-path";
import { useLibrary } from "@/lib/library";
import type { Lang } from "@/lib/types";

/**
 * The language of the page on screen. Reader pages take it from the address; the panel,
 * which has one address for every language, uses the reader's last choice.
 */
export function useLang(): Lang {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const panelLang = useLibrary((s) => s.lang);
  return path.startsWith("/panel") ? panelLang : langFromPath(path);
}
