import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/panel")({
  component: PanelLayout,
});

function PanelLayout() {
  return (
    <Shell>
      <Outlet />
    </Shell>
  );
}
