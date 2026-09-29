import type { LocaleCopy, Source, Story } from "@/lib/types";

function loc(title: string, dek: string, region: string, body: string): LocaleCopy {
  return { title, dek, region, body: body.trim(), audio: null };
}

function story(
  id: string,
  theme: Story["theme"],
  date: string,
  sources: Source[],
  locales: Story["locales"],
): Story {
  return { id, theme, date, sources, locales };
}
