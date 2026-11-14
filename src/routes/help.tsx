import { createFileRoute } from "@tanstack/react-router";
import { Help } from "@/components/vanta/Help";

export const Route = createFileRoute("/help")({
  component: Help,
});
