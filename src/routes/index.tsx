import { createFileRoute, redirect } from "@tanstack/react-router";
import { Atlas } from "@/components/atlas";
import { Shell } from "@/components/shell";
import { toTheme } from "@/lib/types";

export const Route = createFileRoute("/")({
  // Sections used to open as /?s=climate; old links now land on /climate.
  beforeLoad: ({ search }) => {
    const s = (search as Record<string, unknown>).s;
    const theme = typeof s === "string" ? toTheme(s) : undefined;
    if (theme) throw redirect({ to: "/$section", params: { section: theme }, replace: true });
  },
  component: Home,
});

function Home() {
  return (
    <Shell section="all">
      <Atlas section="all" />
    </Shell>
  );
}
