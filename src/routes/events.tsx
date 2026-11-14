import { createFileRoute } from "@tanstack/react-router";
import { Events } from "@/components/vanta/Events";

export const Route = createFileRoute("/events")({
  component: Events,
});
