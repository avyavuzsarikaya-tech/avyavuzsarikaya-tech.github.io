import { useEffect, useState } from "react";

/** Colour schemes for the whole site. "classic" is the original black-and-grey one. */
export const LOOKS = ["classic", "bordo"] as const;
export type Look = (typeof LOOKS)[number];

export const LOOK_KEY = "orbis-look";

/** Browser bar colour for each scheme (matches the header). */
const BAR: Record<Look, string> = { classic: "#0c0c0c", bordo: "#5a1523" };

/** Swatches shown next to each scheme's name in the menus: panel, paper. */
export const LOOK_SWATCH: Record<Look, [string, string]> = {
  classic: ["#0c0c0c", "#f4f4f5"],
  bordo: ["#5a1523", "#fbf7ef"],
};

/**
 * Runs in <head> before the page paints, so a reader who chose burgundy
 * never sees a flash of the black header first.
 */
export const LOOK_BOOT = `try{if(localStorage.getItem("${LOOK_KEY}")==="bordo"){document.documentElement.setAttribute("data-look","bordo");var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content","${BAR.bordo}")}}catch(e){}`;

function readLook(): Look {
  try {
    return localStorage.getItem(LOOK_KEY) === "bordo" ? "bordo" : "classic";
  } catch {
    return "classic";
  }
}

function applyLook(look: Look) {
  const html = document.documentElement;
  if (look === "classic") html.removeAttribute("data-look");
  else html.setAttribute("data-look", look);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", BAR[look]);
}

const listeners = new Set<(look: Look) => void>();

export function useLook(): [Look, (look: Look) => void] {
  const [look, setLookState] = useState<Look>("classic");

  useEffect(() => {
    setLookState(readLook());
    listeners.add(setLookState);
    return () => {
      listeners.delete(setLookState);
    };
  }, []);

  function setLook(next: Look) {
    try {
      localStorage.setItem(LOOK_KEY, next);
    } catch {
      /* the choice still holds for this visit */
    }
    applyLook(next);
    listeners.forEach((fn) => fn(next));
  }

  return [look, setLook];
}
