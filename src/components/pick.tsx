import { useEffect, useId, useRef, useState } from "react";

export type PickOption<T extends string> = {
  value: T;
  label: React.ReactNode;
  lang?: string;
};

/**
 * A small menu that opens right under its button, drawn in the site's own colours.
 * Used instead of <select>, whose phone pop-up is a white system box.
 * tone "panel" sits on the dark (or burgundy) header; tone "page" sits on the paper.
 */
export function Pick<T extends string>({
  value,
  options,
  onChange,
  label,
  tone,
  align = "start",
  children,
  buttonClassName = "",
}: {
  value: T;
  options: PickOption<T>[];
  onChange: (value: T) => void;
  label: string;
  tone: "panel" | "page";
  align?: "start" | "end";
  children: React.ReactNode;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement | null>(null);
  const button = useRef<HTMLButtonElement | null>(null);
  const list = useRef<HTMLUListElement | null>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    // Put focus on the chosen item so arrow keys start from there.
    list.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus();
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function moveFocus(step: number) {
    const items = [...(list.current?.querySelectorAll<HTMLButtonElement>("[role=option]") ?? [])];
    if (!items.length) return;
    const at = items.indexOf(document.activeElement as HTMLButtonElement);
    items[(at + step + items.length) % items.length]?.focus();
  }

  function choose(next: T) {
    setOpen(false);
    button.current?.focus();
    if (next !== value) onChange(next);
  }

  const menu =
    tone === "panel"
      ? "border border-paper/25 bg-panel text-paper shadow-lg"
      : "border border-ink bg-sheet text-ink shadow-md";
  const item = (on: boolean) =>
    tone === "panel"
      ? on
        ? "text-paper underline underline-offset-4"
        : "text-mist hover:text-paper focus:text-paper"
      : on
        ? "text-ink font-semibold"
        : "text-muted hover:text-ink focus:text-ink";

  return (
    <div ref={root} className="relative inline-flex">
      <button
        ref={button}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={label}
        onClick={() => setOpen((was) => !was)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className={`inline-flex items-center ${buttonClassName}`}
      >
        {children}
      </button>
      {open ? (
        <ul
          ref={list}
          id={listId}
          role="listbox"
          aria-label={label}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              moveFocus(1);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              moveFocus(-1);
            } else if (event.key === "Tab") {
              setOpen(false);
            }
          }}
          className={`absolute top-full z-50 mt-1 flex min-w-full flex-col py-1 ${
            align === "end" ? "end-0" : "start-0"
          } ${menu}`}
        >
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                lang={option.lang}
                onClick={() => choose(option.value)}
                className={`flex min-h-10 w-full items-center px-4 text-start text-sm whitespace-nowrap outline-none ${item(
                  option.value === value,
                )}`}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
