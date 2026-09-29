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

const carbonEn = loc(
  "The carbon books, reconciled",
  "National inventories and satellite measurements are being read against each other — not as a headline, but as an accounting problem.",
  "Global",
  `
Every country that reports under the climate convention keeps a greenhouse-gas inventory: a ledger of what is burned, grown, stored, and released. Those ledgers are the official record. They are also slow, and they depend on methods that differ from one capital to the next. [1]

A second set of books now comes from orbit. Instruments measure methane plumes and changes in atmospheric carbon dioxide, then scientists work backward toward the regions that could have produced them. The two records rarely match on the first reading. The work of recent years has been to ask why — a missing landfill, a revised emission factor, a wind field — rather than to declare a winner. [2]

Synthesis assessments still set the frame. Warming is unequivocally human-driven, and the remaining carbon budget is a quantity with a range, not a slogan. What the paired books change is the resolution: which basins, which sectors, which years deserve a closer audit. [3]
`,
);
