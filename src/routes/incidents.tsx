import { createFileRoute } from "@tanstack/react-router";
import { Incidents } from "@/components/vanta/Incidents";

export const Route = createFileRoute("/incidents")({
  component: Incidents,
});
