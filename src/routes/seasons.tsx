import { createFileRoute } from "@tanstack/react-router";
import { Seasons } from "@/components/vanta/Seasons";

export const Route = createFileRoute("/seasons")({
  component: Seasons,
});
