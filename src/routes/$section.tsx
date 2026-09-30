import { createFileRoute, redirect } from "@tanstack/react-router";
import { Atlas } from "@/components/atlas";
import { Shell } from "@/components/shell";
import { copyFor } from "@/lib/i18n";
import { canonical, pageMeta, SITE_NAME } from "@/lib/site";
import { toTheme, type Theme } from "@/lib/types";

/** A section of the atlas at its own address: /climate, /politics, … */
export const Route = createFileRoute("/$section")({
  beforeLoad: ({ params }) => {
    const theme = toTheme(params.section);
    // Not a section: back to the front page.
    if (!theme) throw redirect({ to: "/", replace: true });
    // An old two-part section name: to the section that replaced it.
    if (theme !== params.section) {
      throw redirect({ to: "/$section", params: { section: theme }, replace: true });
    }
  },
  head: ({ params }) => {
    const theme = toTheme(params.section);
    if (!theme) return {};
    const name = copyFor("en").themes[theme];
    return {
      meta: pageMeta({
        title: `${name} — ${SITE_NAME}`,
        description: `${name} readings on ${SITE_NAME}.`,
        path: `/${theme}`,
      }),
      links: [canonical(`/${theme}`)],
    };
  },
  component: SectionPage,
});

function SectionPage() {
  const { section } = Route.useParams();
  const theme = toTheme(section) as Theme;
  return (
    <Shell section={theme}>
      <Atlas section={theme} />
    </Shell>
  );
}
