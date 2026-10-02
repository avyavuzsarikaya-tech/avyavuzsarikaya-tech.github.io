import { Link } from "@tanstack/react-router";
import { aboutCopy } from "@/lib/about-copy";
import { FrameTools, Shell } from "@/components/shell";
import { useCopy } from "@/lib/i18n";
import { homeLink } from "@/lib/lang-path";
import { paragraphs } from "@/lib/text";
import { useLang } from "@/lib/use-lang";

/** About Orbis, in the language of its address. Same column as a reading. */
export function AboutPage() {
  const lang = useLang();
  const copy = useCopy(lang);
  const about = aboutCopy(lang);

  return (
    <Shell>
      <main className="px-5 py-10 md:px-12 md:py-14">
        <div className="mx-auto flex max-w-2xl flex-col gap-8">
          <div className="flex items-center justify-between gap-4 text-sm">
            <Link {...homeLink(lang)} className="inline-flex min-h-11 items-center text-pine">
              {copy.back}
            </Link>
            <FrameTools />
          </div>
          <h1 className="text-4xl md:text-5xl">{about.title}</h1>
          <div className="flex flex-col gap-6">
            {paragraphs(about.body).map((para) => (
              <p key={para} className="text-pretty">
                {para}
              </p>
            ))}
          </div>
        </div>
      </main>
    </Shell>
  );
}
