import { paragraphs } from "@/lib/text";

export function Prose({
  body,
  sourceNums,
  sourceWord,
}: {
  body: string;
  sourceNums: Set<number>;
  sourceWord: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      {paragraphs(body).map((para, index) => (
        <p key={index} className="reading-para">
          <Cited text={para} sourceNums={sourceNums} sourceWord={sourceWord} />
        </p>
      ))}
    </div>
  );
}

function Cited({
  text,
  sourceNums,
  sourceWord,
}: {
  text: string;
  sourceNums: Set<number>;
  sourceWord: string;
}) {
  const nodes: React.ReactNode[] = [];
  const re = /\[(\d+)\]/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const n = Number(match[1]);
    const key = `${match.index}-${n}`;
    if (sourceNums.has(n)) {
      nodes.push(
        <a
          key={key}
          href={`#source-${n}`}
          className="cite"
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
            event.preventDefault();
            const el = document.getElementById(`source-${n}`);
            if (!el) return;
            document.querySelectorAll(".source-row.is-lit").forEach((node) => node.classList.remove("is-lit"));
            el.classList.add("is-lit");
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
        >
          <span aria-hidden="true">{n}</span>
          <span className="sr-only">
            {sourceWord} {n}
          </span>
        </a>,
      );
    } else {
      nodes.push(
        <span key={key} className="text-muted">
          [{n}]
        </span>,
      );
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
}
