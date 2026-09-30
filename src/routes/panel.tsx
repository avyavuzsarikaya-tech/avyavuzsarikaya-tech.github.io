import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { Shell } from "@/components/shell";
import { useLibrary } from "@/lib/library";

export const Route = createFileRoute("/panel")({
  component: PanelLayout,
});

function PanelLayout() {
  const load = useLibrary((s) => s.load);
  // The panel edits every reading, so it loads them all in full.
  useEffect(() => {
    void load();
  }, [load]);
  return (
    <Shell>
      <Outlet />
    </Shell>
  );
}
