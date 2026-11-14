import { createFileRoute } from "@tanstack/react-router";
import { Configurator } from "@/components/vanta/Configurator";

export const Route = createFileRoute("/config")({
  component: Configurator,
});
